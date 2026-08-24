import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Sparkles, ShieldCheck, Mail, Phone, Globe, HelpCircle, ArrowLeft, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { dbAuth } from "../lib/db";
import { firebaseSignUpWithEmail } from "../lib/firebaseAuthService";
import { Profile } from "../types";
import { AmarisLogo } from "./AmarisLogo";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { MFAChallengeModal } from "./MFAChallengeModal";

interface RegisterFormInput {
  first_name: string;
  surname: string;
  email: string;
  password?: string;
  confirm_password?: string;
  phone: string;
  whatsapp_number: string;
  province: string;
  school?: string;
  grade?: string;
  parent_name?: string;
  parent_phone?: string;
  role: "student" | "admin" | "tutor";
  specialization?: string;
  bio?: string;
}

interface RegisterProps {
  onRegisterSuccess: (user: Profile) => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegisterSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<Profile | null>(null);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormInput>({
    defaultValues: {
      role: "student",
      province: "Gauteng",
      grade: "Grade 12 CAPS"
    }
  });

  const selectedRole = watch("role", "student");
  const passwordValue = watch("password", "");

  const params = new URLSearchParams(window.location.search);
  const redirectPath = params.get("redirect") || "dashboard";

  const triggerMfaChallenge = (user: Profile) => {
    setPendingUser(user);
    setIsMfaModalOpen(true);
  };

  const handleMfaVerified = (verifiedUser: Profile) => {
    setIsMfaModalOpen(false);
    onRegisterSuccess(verifiedUser);
    const finalRedirect = (verifiedUser.role === "admin" || verifiedUser.role === "tutor") && redirectPath === "dashboard"
      ? "admin"
      : redirectPath;
    navigate(`/${finalRedirect}`);
  };

  const onSubmit = async (data: RegisterFormInput) => {
    setError(null);
    setIsLoading(true);

    try {
      if (data.password && data.password.trim().length > 0) {
        if (data.password.length < 6) {
          setError("Password must be at least 6 characters long.");
          setIsLoading(false);
          return;
        }
        if (data.password !== data.confirm_password) {
          setError("Passwords do not match. Please re-enter your password.");
          setIsLoading(false);
          return;
        }

        // Firebase Auth User Creation
        try {
          const newUser = await firebaseSignUpWithEmail(data.email, data.password, {
            first_name: data.first_name,
            surname: data.surname,
            phone: data.phone,
            whatsapp_number: data.whatsapp_number,
            province: data.province,
            school: data.school,
            grade: data.grade,
            parent_name: data.parent_name,
            parent_phone: data.parent_phone,
            role: data.role,
            specialization: data.specialization,
            bio: data.bio
          });
          setIsLoading(false);
          triggerMfaChallenge(newUser);
          return;
        } catch (fbErr: any) {
          console.warn("[Firebase Auth] Registration error:", fbErr);
          if (fbErr.message && !fbErr.message.includes("offline")) {
            setError(fbErr.message);
            setIsLoading(false);
            return;
          }
        }
      }

      // Fast-track or fallback local registration
      const newUser = dbAuth.register(data);
      setIsLoading(false);
      triggerMfaChallenge(newUser);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || "An enrollment error occurred.");
    }
  };

  const provinces = [
    "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", 
    "Free State", "Mpumalanga", "Limpopo", "North West", "Northern Cape"
  ];

  const grades = [
    "Matric Upgrade CAPS", "Matric Upgrade IEB", "Grade 12 CAPS", "Grade 12 IEB"
  ];


  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-navy-50 dark:bg-navy-950/20">
      <div className="absolute top-12 left-12 w-64 h-64 bg-royal-600/10 rounded-full blur-2xl" />
      <div className="absolute bottom-12 right-12 w-64 h-64 bg-gold-600/10 rounded-full blur-2xl" />

      <div className="max-w-2xl w-full bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl shadow-xl overflow-hidden relative z-10">
        
        {/* Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-navy-900 to-navy-950 text-white text-center flex flex-col items-center space-y-3">
          <AmarisLogo variant="icon" size="lg" />
          <span className="text-[10px] font-mono font-black uppercase text-gold-400 bg-gold-400/10 px-2.5 py-1 rounded-full">
            Enrollment Form
          </span>
          <h2 className="text-xl sm:text-2xl font-black font-display text-white">Join Amaris Learning Hub</h2>
          <p className="text-xs text-navy-300 max-w-md">Create your account to schedule live whiteboard sessions, upload math homework, and upgrade marks.</p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs">
              {error}
            </div>
          )}

          {/* 1-Click Fast Registration with Google */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-royal-500/5 via-gold-500/5 to-royal-500/5 border border-royal-500/20 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-royal-600 dark:text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold-500 animate-pulse" />
                Fast-Track Student Registration
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                No Password Needed
              </span>
            </div>

            <p className="text-xs text-navy-600 dark:text-navy-300">
              Register instantly using your <b>Google Account</b> to unlock your student dashboard, view past papers, and schedule live whiteboard lessons.
            </p>

            <GoogleAuthButton
              mode="register"
              role={selectedRole}
              buttonText={`Register ${selectedRole === "student" ? "Student Account" : selectedRole === "tutor" ? "Tutor Account" : "Admin Account"} with Google`}
              onSuccess={(user) => {
                triggerMfaChallenge(user);
              }}
            />
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-navy-150 dark:border-navy-800 w-full" />
            <span className="bg-white dark:bg-navy-900 px-3 text-[10px] font-mono font-bold text-navy-400 uppercase tracking-widest absolute">
              OR REGISTER WITH DETAILS FORM
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-xs">
            
            {/* 0. Account Type Selector */}
            <div className="space-y-4">
              <h3 className="text-xs font-black font-mono text-royal-600 dark:text-gold-400 uppercase tracking-widest border-b border-navy-100 dark:border-navy-800 pb-1.5 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gold-500" />
                0. Choose Account Type
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className={`flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedRole === "student"
                    ? "border-royal-500 bg-royal-500/5 dark:bg-royal-500/10"
                    : "border-navy-150 dark:border-navy-800 bg-transparent hover:border-navy-200"
                }`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <input
                      type="radio"
                      value="student"
                      className="text-royal-600 focus:ring-royal-500"
                      {...register("role")}
                    />
                    <span className="font-bold text-sm text-navy-900 dark:text-white">Student</span>
                  </div>
                  <span className="text-[11px] text-navy-500 dark:text-navy-400">
                    Schedule whiteboard sessions, view learning graphs, and track upgrade goals.
                  </span>
                </label>

                <label className={`flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedRole === "tutor"
                    ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10"
                    : "border-navy-150 dark:border-navy-800 bg-transparent hover:border-navy-200"
                }`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <input
                      type="radio"
                      value="tutor"
                      className="text-emerald-500 focus:ring-emerald-500"
                      {...register("role")}
                    />
                    <span className="font-bold text-sm text-navy-900 dark:text-white">Tutor</span>
                  </div>
                  <span className="text-[11px] text-navy-500 dark:text-navy-400">
                    Deliver private mathematics classes, review homework submissions, and upload materials.
                  </span>
                </label>

                <label className={`flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedRole === "admin"
                    ? "border-gold-500 bg-gold-500/5 dark:bg-gold-500/10"
                    : "border-navy-150 dark:border-navy-800 bg-transparent hover:border-navy-200"
                }`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <input
                      type="radio"
                      value="admin"
                      className="text-gold-500 focus:ring-gold-500"
                      {...register("role")}
                    />
                    <span className="font-bold text-sm text-navy-900 dark:text-white">Admin</span>
                  </div>
                  <span className="text-[11px] text-navy-500 dark:text-navy-400">
                    Manage profiles, view audit logs, schedule tutor resources, and manage requests.
                  </span>
                </label>
              </div>
            </div>

            {/* 1. Profile Identity */}
            <div className="space-y-4">
              <h3 className="text-xs font-black font-mono text-royal-600 dark:text-gold-400 uppercase tracking-widest border-b border-navy-100 dark:border-navy-800 pb-1.5">
                1. {selectedRole === "admin" ? "Admin" : selectedRole === "tutor" ? "Tutor" : "Student"} Identity
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">First Name</label>
                  <input 
                    type="text" 
                    placeholder="Sipho"
                    {...register("first_name", { required: "First name is required" })}
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  />
                  {errors.first_name && <p className="text-red-500 mt-1 font-mono text-[10px]">{errors.first_name.message}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">Surname</label>
                  <input 
                    type="text" 
                    placeholder="Ndlovu"
                    {...register("surname", { required: "Surname is required" })}
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  />
                  {errors.surname && <p className="text-red-500 mt-1 font-mono text-[10px]">{errors.surname.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="sipho@gmail.com"
                    {...register("email", { 
                      required: "Email is required",
                      pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                    })}
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  />
                  {errors.email && <p className="text-red-500 mt-1 font-mono text-[10px]">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">Mobile Phone</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 071 415 6665"
                    {...register("phone", { required: "Phone number is required" })}
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  />
                  {errors.phone && <p className="text-red-500 mt-1 font-mono text-[10px]">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">WhatsApp Number</label>
                  <input 
                    type="text" 
                    placeholder="Same as mobile or +27..."
                    {...register("whatsapp_number", { required: "WhatsApp number is required" })}
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  />
                  {errors.whatsapp_number && <p className="text-red-500 mt-1 font-mono text-[10px]">{errors.whatsapp_number.message}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">Province</label>
                  <select 
                    {...register("province", { required: "Province is required" })}
                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none"
                  >
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* Password & Security */}
              <div className="pt-2 border-t border-navy-100 dark:border-navy-800/60">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-mono font-black text-royal-600 dark:text-gold-400 uppercase flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    Account Security Password
                  </label>
                  <span className="text-[10px] text-navy-400 font-mono">Min 6 characters</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        {...register("password", {
                          minLength: { value: 6, message: "Password must be at least 6 characters" }
                        })}
                        className="w-full pl-3 pr-10 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-navy-400 hover:text-navy-600 dark:hover:text-navy-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 mt-1 font-mono text-[10px]">{errors.password.message}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">Confirm Password</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your password"
                        {...register("confirm_password")}
                        className="w-full pl-3 pr-10 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-navy-400 hover:text-navy-600 dark:hover:text-navy-200"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Schooling Details (Students only) */}
            {selectedRole === "student" && (
              <div className="space-y-4">
                <h3 className="text-xs font-black font-mono text-royal-600 dark:text-gold-400 uppercase tracking-widest border-b border-navy-100 dark:border-navy-800 pb-1.5">
                  2. Academic Stream
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">School / College Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Pretoria High School"
                      {...register("school", { required: "School name is required" })}
                      className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none animate-fadeIn"
                    />
                    {errors.school && <p className="text-red-500 mt-1 font-mono text-[10px]">{errors.school.message}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">Grade Level / Stream</label>
                    <select 
                      {...register("grade", { required: "Grade level is required" })}
                      className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none"
                    >
                      {grades.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Tutor Credentials & Specialization (Tutors only) */}
            {selectedRole === "tutor" && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-xs font-black font-mono text-royal-600 dark:text-gold-400 uppercase tracking-widest border-b border-navy-100 dark:border-navy-800 pb-1.5">
                  2. Tutor Credentials & Specialization
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">Subject Specializations</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Core Mathematics, Calculus, Trigonometry"
                      {...register("specialization", { required: "Subject specialization is required" })}
                      className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                    />
                    {errors.specialization && <p className="text-red-500 mt-1 font-mono text-[10px]">{errors.specialization.message}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">Teaching Bio / Statement</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Experienced CAPS matric tutor with 5+ years experience"
                      {...register("bio", { required: "Teaching bio is required" })}
                      className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                    />
                    {errors.bio && <p className="text-red-500 mt-1 font-mono text-[10px]">{errors.bio.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Parent / Sponsor (Students only) */}
            {selectedRole === "student" && (
              <div className="space-y-4">
                <h3 className="text-xs font-black font-mono text-royal-600 dark:text-gold-400 uppercase tracking-widest border-b border-navy-100 dark:border-navy-800 pb-1.5">
                  3. Sponsor / Parent Details <span className="text-[9px] font-mono font-bold text-navy-400 font-normal capitalize">(Optional for Upgrade Candidates)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">Parent / Sponsor Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Sarah Ndlovu"
                      {...register("parent_name")}
                      className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">Parent / Sponsor Mobile</label>
                    <input 
                      type="text" 
                      placeholder="e.g. +27 82 555 1234"
                      {...register("parent_phone")}
                      className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-3 bg-gradient-to-r text-white font-extrabold rounded-lg flex items-center justify-center gap-2 shadow hover:shadow-md transition-all scale-100 hover:scale-[1.01] cursor-pointer disabled:opacity-60 ${
                selectedRole === "admin" 
                  ? "from-gold-600 to-gold-700 hover:from-gold-700 hover:to-gold-800" 
                  : selectedRole === "tutor"
                    ? "from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                    : "from-royal-600 to-royal-700 hover:from-royal-700 hover:to-royal-800"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account with Firebase...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  {selectedRole === "admin" 
                    ? "Register & Access Admin Dashboard" 
                    : selectedRole === "tutor"
                      ? "Register & Access Tutor Console"
                      : "Enroll & Access Student Portal"}
                </>
              )}
            </button>

          </form>

          <div className="border-t border-navy-100 dark:border-navy-800 pt-4 text-center space-y-3">
            <p className="text-[11px] text-navy-500 dark:text-navy-400">
              Already have an account?{" "}
              <Link to={redirectPath !== "dashboard" ? `/login?redirect=${redirectPath}` : "/login"} className="text-royal-600 dark:text-gold-400 font-bold hover:underline">
                Sign In
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

      {/* MFA 2FA Account Enrollment Modal */}
      {pendingUser && (
        <MFAChallengeModal
          isOpen={isMfaModalOpen}
          onClose={() => setIsMfaModalOpen(false)}
          user={pendingUser}
          onVerificationSuccess={handleMfaVerified}
          isRegistrationFlow={true}
        />
      )}
    </div>
  );
};
