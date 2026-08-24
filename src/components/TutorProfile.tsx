import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Camera, Upload, User, Sparkles, CheckCircle2, Save, RefreshCw, 
  BookOpen, Award, Clock, Star, X, AlertCircle, Trash2, Image, 
  ShieldCheck, Check, Briefcase, HeartHandshake, GraduationCap, Video,
  Eye, Zap, MessageSquare, Github, ExternalLink
} from "lucide-react";
import { Profile } from "../types";
import { getFromDB, saveToDB } from "../lib/db";

interface TutorProfileProps {
  user: Profile | null;
  onProfileUpdate: (updated: Profile) => void;
}

const DEFAULT_QUALIFICATIONS = [
  "BSc Mathematical Sciences (Wits)",
  "PGCE Senior Phase & FET Mathematics",
  "100% Matric Distinction Rate Coach",
  "CAPS & IEB Curriculum Assessor"
];

const DEFAULT_SUBJECTS_TAUGHT = [
  "Grade 10 CAPS Mathematics",
  "Grade 11 CAPS Mathematics",
  "Grade 12 CAPS Paper 1 & 2",
  "IEB Advanced Program Mathematics",
  "Matric Upgrade Specialization",
  "NBT Quantitative Literacy"
];

export const TutorProfile: React.FC<TutorProfileProps> = ({ user, onProfileUpdate }) => {
  // Profile state initialization
  const [firstName, setFirstName] = useState<string>(user?.first_name || "Bethuel");
  const [surname, setSurname] = useState<string>(user?.surname || "Moukangwe");
  const [email, setEmail] = useState<string>(user?.email || "bethuelmoukangwe8@gmail.com");
  const [phone, setPhone] = useState<string>(user?.phone || "0712345678");
  const [whatsapp, setWhatsapp] = useState<string>(user?.whatsapp_number || "0712345678");
  const [githubUrl, setGithubUrl] = useState<string>(user?.github_url || "https://github.com/BETHUELTHIPE");
  const [specialization, setSpecialization] = useState<string>(
    user?.specialization || "CAPS & IEB Senior Mathematics Specialist (Paper 1 & 2)"
  );
  const [isAvailable, setIsAvailable] = useState<boolean>(user?.is_available ?? true);
  const [yearsExperience, setYearsExperience] = useState<number>(user?.years_experience || 7);
  const [avatarUrl, setAvatarUrl] = useState<string>(
    user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
  );

  // Biography & Teaching Philosophy
  const [bio, setBio] = useState<string>(
    user?.bio || 
    "Senior Mathematics Tutor with over 7 years of dedicated experience coaching Grade 10-12 students across South Africa. Specializing in breaking down complex calculus, trigonometry, and analytical geometry concepts into intuitive, digestible steps."
  );

  const [teachingPhilosophy, setTeachingPhilosophy] = useState<string>(
    user?.teaching_philosophy || 
    "I believe every student possesses the innate capacity to master high school mathematics when guided through conceptual first-principles rather than rote memorization. My approach focuses on building confidence through scaffolded problem-solving, real-time feedback, and relatable analogies."
  );

  // Qualifications & Subjects
  const [qualifications, setQualifications] = useState<string[]>(
    user?.qualifications && user.qualifications.length > 0
      ? user.qualifications
      : DEFAULT_QUALIFICATIONS
  );
  const [newQualificationInput, setNewQualificationInput] = useState<string>("");

  const [subjectsTaught, setSubjectsTaught] = useState<string[]>(
    user?.subjects_taught && user.subjects_taught.length > 0
      ? user.subjects_taught
      : DEFAULT_SUBJECTS_TAUGHT
  );

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // UI state
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [activePreviewTab, setActivePreviewTab] = useState<"edit" | "preview">("edit");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 640 },
          facingMode: "user"
        },
        audio: false
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera permission denied. Please allow camera access in your browser settings or use image file upload."
          : "Unable to access camera on this device. Please use the file upload option."
      );
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Take Snapshot from Camera
  const capturePhoto = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 640;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw mirror effect for selfie camera
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
        setAvatarUrl(dataUrl);
        stopCamera();
      }
    } catch (err) {
      console.error("Error capturing photo:", err);
      setCameraError("Failed to capture image. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size too large. Please select an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Qualifications Add / Remove
  const handleAddQualification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQualificationInput.trim()) return;
    if (!qualifications.includes(newQualificationInput.trim())) {
      setQualifications([...qualifications, newQualificationInput.trim()]);
    }
    setNewQualificationInput("");
  };

  const handleRemoveQualification = (qToRemove: string) => {
    setQualifications(qualifications.filter(q => q !== qToRemove));
  };

  // Toggle Subject Taught
  const toggleSubject = (subjectName: string) => {
    if (subjectsTaught.includes(subjectName)) {
      setSubjectsTaught(subjectsTaught.filter(s => s !== subjectName));
    } else {
      setSubjectsTaught([...subjectsTaught, subjectName]);
    }
  };

  // Save Profile Handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedProfile: Profile = {
      ...(user || {
        id: "usr-tutor-default",
        grade: "Matric Upgrade",
        province: "Gauteng",
        school: "Amaris Hub Academy",
        parent_name: "N/A",
        parent_phone: "N/A"
      }),
      first_name: firstName,
      surname: surname,
      email: email,
      phone: phone,
      whatsapp_number: whatsapp,
      role: "tutor",
      specialization: specialization,
      bio: bio,
      teaching_philosophy: teachingPhilosophy,
      is_available: isAvailable,
      years_experience: yearsExperience,
      avatar_url: avatarUrl,
      qualifications: qualifications,
      subjects_taught: subjectsTaught,
      github_url: githubUrl
    };

    // Update in parent state
    onProfileUpdate(updatedProfile);

    // Persist in LocalStorage profiles array
    const profiles = getFromDB<Profile>("amh_profiles");
    if (Array.isArray(profiles)) {
      const idx = profiles.findIndex(p => p.id === updatedProfile.id || p.email.toLowerCase() === updatedProfile.email.toLowerCase());
      let newProfiles: Profile[];
      if (idx >= 0) {
        newProfiles = [...profiles];
        newProfiles[idx] = updatedProfile;
      } else {
        newProfiles = [...profiles, updatedProfile];
      }
      saveToDB("amh_profiles", newProfiles);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-left max-w-6xl mx-auto pb-12">
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-royal-950 p-6 sm:p-8 rounded-3xl border border-navy-800 shadow-xl relative overflow-hidden text-white">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-royal-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-20 top-0 w-40 h-40 bg-gold-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-gold-400 text-navy-950 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <GraduationCap className="w-3.5 h-3.5" />
                Senior Math Coach Profile
              </span>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1 border ${
                isAvailable
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                  : "bg-navy-800 text-navy-300 border-navy-700"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-emerald-400 animate-pulse" : "bg-navy-400"}`} />
                {isAvailable ? "Ready For Immediate Sessions" : "Currently Offline / Busy"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
              Tutor Profile & Teaching Philosophy
            </h1>
            <p className="text-xs sm:text-sm text-navy-200 max-w-2xl leading-relaxed">
              Customize your profile photo using live camera capture or file upload, craft an inspiring teaching philosophy, and highlight your math qualifications to Grade 10-12 students across South Africa.
            </p>
          </div>

          {/* VIEW MODE SWITCH TABS */}
          <div className="bg-navy-900/80 border border-navy-750 p-1.5 rounded-2xl flex items-center gap-1 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setActivePreviewTab("edit")}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activePreviewTab === "edit"
                  ? "bg-royal-600 text-white shadow-md font-black"
                  : "text-navy-300 hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => setActivePreviewTab("preview")}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activePreviewTab === "preview"
                  ? "bg-amber-500 text-navy-950 shadow-md font-black"
                  : "text-navy-300 hover:text-white"
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Student Card Preview</span>
            </button>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold font-mono flex items-center justify-between gap-3 shadow-md"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <span>Tutor profile and teaching philosophy updated successfully! Changes are visible in the student coaching portal.</span>
          </div>
          <button onClick={() => setSaveSuccess(false)} className="text-emerald-500 hover:text-emerald-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* EDIT MODE FORM */}
      {activePreviewTab === "edit" ? (
        <form onSubmit={handleSaveProfile} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: CAMERA & PROFILE PICTURE MANAGEMENT */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-navy-900 p-6 rounded-3xl border border-navy-200 dark:border-navy-800 shadow-md space-y-5">
                <div className="space-y-1">
                  <h3 className="text-base font-black font-display text-navy-900 dark:text-white flex items-center gap-2">
                    <Camera className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                    <span>Tutor Profile Photo</span>
                  </h3>
                  <p className="text-xs text-navy-500 dark:text-navy-400">
                    Upload a professional headshot or use your device camera to take a photo.
                  </p>
                </div>

                {/* CURRENT PHOTO DISPLAY / CAMERA VIDEO PREVIEW */}
                <div className="relative mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-royal-500/30 shadow-inner bg-navy-950 flex items-center justify-center group">
                  {isCameraActive ? (
                    <div className="w-full h-full relative bg-black">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform -scale-x-100"
                      />
                      {/* Target Reticle Overlay */}
                      <div className="absolute inset-0 border-2 border-dashed border-gold-400/60 rounded-full m-2 pointer-events-none" />
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/70 text-[9px] font-mono text-gold-300">
                        Live Camera Stream
                      </div>
                    </div>
                  ) : avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={`${firstName} ${surname}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-20 h-20 text-navy-400" />
                  )}

                  {/* Status Indicator Dot */}
                  <span className={`absolute bottom-2 right-6 w-5 h-5 rounded-full border-2 border-white dark:border-navy-900 ${
                    isAvailable ? "bg-emerald-500" : "bg-navy-400"
                  }`} />
                </div>

                {/* CAMERA & FILE UPLOAD ACTION BUTTONS */}
                <div className="space-y-3">
                  {isCameraActive ? (
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        disabled={isCapturing}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-navy-950 font-bold font-mono text-xs cursor-pointer flex items-center justify-center gap-2 shadow-lg transition-all"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{isCapturing ? "Capturing..." : "Take Photo Now"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={stopCamera}
                        className="w-full py-2 px-4 rounded-xl bg-navy-200 dark:bg-navy-800 hover:bg-navy-300 dark:hover:bg-navy-750 text-navy-800 dark:text-navy-200 font-mono text-xs cursor-pointer"
                      >
                        Cancel Camera
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="py-2.5 px-3 rounded-xl bg-royal-600 hover:bg-royal-700 text-white font-mono font-bold text-xs cursor-pointer flex items-center justify-center gap-2 transition-all shadow-md"
                      >
                        <Camera className="w-4 h-4 text-gold-400" />
                        <span>Use Camera</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="py-2.5 px-3 rounded-xl bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-750 text-navy-800 dark:text-navy-200 font-mono font-bold text-xs cursor-pointer flex items-center justify-center gap-2 border border-navy-200 dark:border-navy-700 transition-all"
                      >
                        <Upload className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                        <span>Upload File</span>
                      </button>
                    </div>
                  )}

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {cameraError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-mono leading-relaxed flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{cameraError}</span>
                    </div>
                  )}
                </div>

                {/* AVAILABILITY TOGGLE */}
                <div className="pt-4 border-t border-navy-150 dark:border-navy-800 space-y-2">
                  <label className="text-xs font-bold text-navy-700 dark:text-navy-300 flex items-center justify-between cursor-pointer">
                    <span>On-Demand Live Sessions Status:</span>
                    <button
                      type="button"
                      onClick={() => setIsAvailable(!isAvailable)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        isAvailable ? "bg-emerald-500" : "bg-navy-300 dark:bg-navy-800"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isAvailable ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </label>
                  <p className="text-[11px] text-navy-500 dark:text-navy-400 leading-snug">
                    {isAvailable
                      ? "You are currently marked 'Ready Now'. Students can book immediate whiteboard walkthroughs."
                      : "You are currently marked offline. Students can only book scheduled future slots."}
                  </p>
                </div>
              </div>

              {/* QUICK STATS & EXPERIENCE */}
              <div className="bg-white dark:bg-navy-900 p-6 rounded-3xl border border-navy-200 dark:border-navy-800 shadow-md space-y-4">
                <h4 className="text-xs font-mono font-bold text-navy-500 dark:text-navy-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                  <span>Tutoring Experience</span>
                </h4>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-navy-700 dark:text-navy-300 font-bold">Years Coaching High School Math:</span>
                    <span className="font-black text-royal-600 dark:text-gold-400 text-sm">{yearsExperience} Years</span>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={25}
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(Number(e.target.value))}
                    className="w-full accent-royal-600 dark:accent-gold-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: BIOGRAPHY, PHILOSOPHY & QUALIFICATIONS */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* BASIC DETAILS */}
              <div className="bg-white dark:bg-navy-900 p-6 rounded-3xl border border-navy-200 dark:border-navy-800 shadow-md space-y-4">
                <h3 className="text-base font-black font-display text-navy-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                  <span>Personal Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="space-y-1">
                    <label className="block text-navy-600 dark:text-navy-400 font-bold">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-750 rounded-xl px-3.5 py-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-navy-600 dark:text-navy-400 font-bold">Surname</label>
                    <input
                      type="text"
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      required
                      className="w-full bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-750 rounded-xl px-3.5 py-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-navy-600 dark:text-navy-400 font-bold">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-750 rounded-xl px-3.5 py-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-navy-600 dark:text-navy-400 font-bold">WhatsApp Line</label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-750 rounded-xl px-3.5 py-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="block text-xs font-mono font-bold text-navy-600 dark:text-navy-400">
                    Specialization Title / Badge
                  </label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. CAPS & IEB Senior Mathematics Specialist (Paper 1 & 2)"
                    className="w-full bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-750 rounded-xl px-3.5 py-2.5 text-xs text-navy-900 dark:text-white font-bold focus:outline-none focus:border-royal-500"
                  />
                </div>

                <div className="space-y-1 pt-1">
                  <label className="block text-xs font-mono font-bold text-navy-600 dark:text-navy-400 flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5 text-gold-400" />
                    <span>GitHub Profile URL</span>
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/BETHUELTHIPE"
                    className="w-full bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-750 rounded-xl px-3.5 py-2.5 text-xs text-navy-900 dark:text-white font-mono focus:outline-none focus:border-royal-500"
                  />
                </div>
              </div>

              {/* BIOGRAPHY & TEACHING PHILOSOPHY */}
              <div className="bg-white dark:bg-navy-900 p-6 rounded-3xl border border-navy-200 dark:border-navy-800 shadow-md space-y-5">
                <div className="space-y-1">
                  <h3 className="text-base font-black font-display text-navy-900 dark:text-white flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                    <span>Biography & Teaching Philosophy</span>
                  </h3>
                  <p className="text-xs text-navy-500 dark:text-navy-400">
                    Articulate your educational methodology to build trust and connection with prospective students.
                  </p>
                </div>

                {/* BIOGRAPHY */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-navy-700 dark:text-navy-300 flex justify-between">
                    <span>Tutor Biography & Academic Journey</span>
                    <span className="text-[10px] text-navy-400">{bio.length} characters</span>
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your passion for mathematics, your teaching career, and key matric success stories..."
                    className="w-full bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-750 rounded-xl p-3.5 text-xs text-navy-900 dark:text-white leading-relaxed focus:outline-none focus:border-royal-500"
                  />
                </div>

                {/* TEACHING PHILOSOPHY */}
                <div className="space-y-1.5 pt-2">
                  <label className="block text-xs font-mono font-bold text-navy-700 dark:text-navy-300 flex justify-between">
                    <span className="flex items-center gap-1.5 text-royal-600 dark:text-gold-400">
                      <Sparkles className="w-4 h-4" />
                      Teaching Philosophy & Problem Solving Approach
                    </span>
                    <span className="text-[10px] text-navy-400">{teachingPhilosophy.length} characters</span>
                  </label>
                  <textarea
                    rows={4}
                    value={teachingPhilosophy}
                    onChange={(e) => setTeachingPhilosophy(e.target.value)}
                    placeholder="Explain your approach to removing math anxiety, first-principles derivations, step-by-step guidance..."
                    className="w-full bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-750 rounded-xl p-3.5 text-xs text-navy-900 dark:text-white leading-relaxed focus:outline-none focus:border-royal-500 font-sans"
                  />
                </div>
              </div>

              {/* QUALIFICATIONS & SUBJECTS TAUGHT */}
              <div className="bg-white dark:bg-navy-900 p-6 rounded-3xl border border-navy-200 dark:border-navy-800 shadow-md space-y-5">
                <div className="space-y-1">
                  <h3 className="text-base font-black font-display text-navy-900 dark:text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                    <span>Academic Qualifications & Coverage</span>
                  </h3>
                </div>

                {/* ADD QUALIFICATIONS */}
                <div className="space-y-3">
                  <label className="block text-xs font-mono font-bold text-navy-700 dark:text-navy-300">
                    Degrees, Certifications & Matric Distinction Badges:
                  </label>

                  <form onSubmit={handleAddQualification} className="flex gap-2">
                    <input
                      type="text"
                      value={newQualificationInput}
                      onChange={(e) => setNewQualificationInput(e.target.value)}
                      placeholder="e.g. BEd Honors in Mathematics, 100% NSC Distinction..."
                      className="flex-1 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-750 rounded-xl px-3.5 py-2 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-royal-600 hover:bg-royal-700 text-white font-mono font-bold text-xs cursor-pointer"
                    >
                      + Add
                    </button>
                  </form>

                  <div className="flex items-center gap-2 flex-wrap">
                    {qualifications.map((q) => (
                      <span
                        key={q}
                        className="px-3 py-1.5 rounded-xl bg-royal-50 dark:bg-navy-950 text-royal-700 dark:text-gold-300 border border-royal-200 dark:border-royal-800 text-xs font-mono font-bold flex items-center gap-1.5"
                      >
                        <Award className="w-3.5 h-3.5 text-gold-400" />
                        <span>{q}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveQualification(q)}
                          className="hover:text-rose-500 cursor-pointer ml-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* SUBJECTS TAUGHT MULTI-SELECT */}
                <div className="space-y-2 pt-3 border-t border-navy-150 dark:border-navy-800">
                  <label className="block text-xs font-mono font-bold text-navy-700 dark:text-navy-300">
                    Curriculums & Level Coverage:
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {DEFAULT_SUBJECTS_TAUGHT.map((subj) => {
                      const isSelected = subjectsTaught.includes(subj);
                      return (
                        <button
                          key={subj}
                          type="button"
                          onClick={() => toggleSubject(subj)}
                          className={`p-2.5 rounded-xl text-xs font-mono font-bold border text-left transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-gradient-to-r from-royal-600 to-navy-900 text-white border-royal-500 shadow-sm"
                              : "bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300 border-navy-200 dark:border-navy-800 hover:border-royal-400"
                          }`}
                        >
                          <span className="truncate">{subj}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-gold-400 shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-royal-600 to-navy-900 hover:from-royal-700 hover:to-navy-950 text-white font-mono font-bold text-sm shadow-xl flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <Save className="w-5 h-5 text-gold-400" />
                  <span>Save Tutor Profile & Teaching Philosophy</span>
                </button>
              </div>

            </div>
          </div>
        </form>
      ) : (
        /* PREVIEW MODE CARD */
        <div className="space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl text-xs font-mono text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-500 shrink-0" />
            <span>This is how your profile appears to South African students in the Amaris Coaching Directory and lesson booking flows.</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
            
            {/* CARD TOP HEADER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-navy-150 dark:border-navy-800">
              <div className="flex items-center gap-5">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-royal-500/40 shadow-lg bg-navy-950 shrink-0">
                  <img
                    src={avatarUrl}
                    alt={`${firstName} ${surname}`}
                    className="w-full h-full object-cover"
                  />
                  {isAvailable && (
                    <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-navy-900" />
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-royal-100 dark:bg-royal-950 text-royal-700 dark:text-gold-400 border border-royal-200 dark:border-royal-800">
                      Senior Tutor
                    </span>
                    {isAvailable ? (
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Ready For Instant Session
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-navy-100 dark:bg-navy-800 text-navy-500">
                        Scheduled Slots Only
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black font-display text-navy-900 dark:text-white">
                    Tutor {firstName} {surname}
                  </h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-xs font-mono font-bold text-royal-600 dark:text-gold-400">
                      {specialization}
                    </p>
                    {githubUrl && (
                      <a 
                        href={githubUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-navy-100 hover:bg-navy-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-800 dark:text-gold-400 text-[11px] font-mono font-bold transition-colors"
                      >
                        <Github className="w-3 h-3" />
                        <span>GitHub</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* RATING & EXPERIENCE BADGE */}
              <div className="flex sm:flex-col items-end gap-2 bg-navy-50 dark:bg-navy-950 p-3 rounded-2xl border border-navy-150 dark:border-navy-800 shrink-0">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="text-xs font-black text-navy-900 dark:text-white font-mono ml-1">5.0 (120+ reviews)</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-navy-500 dark:text-navy-400">
                  {yearsExperience} Years Coaching Experience
                </span>
              </div>
            </div>

            {/* TEACHING PHILOSOPHY HIGHLIGHT BOX */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-royal-900/10 via-royal-800/5 to-amber-500/5 border border-royal-500/20 space-y-2">
              <h4 className="text-xs font-mono font-black text-royal-700 dark:text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Teaching Philosophy & Strategy</span>
              </h4>
              <p className="text-xs sm:text-sm text-navy-800 dark:text-navy-100 italic leading-relaxed font-sans font-medium">
                "{teachingPhilosophy}"
              </p>
            </div>

            {/* BIOGRAPHY */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-black text-navy-500 dark:text-navy-400 uppercase tracking-wider">
                About the Tutor
              </h4>
              <p className="text-xs sm:text-sm text-navy-700 dark:text-navy-200 leading-relaxed font-sans">
                {bio}
              </p>
            </div>

            {/* QUALIFICATIONS & COVERAGE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-navy-150 dark:border-navy-800">
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-black text-navy-500 dark:text-navy-400 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                  <span>Academic Qualifications</span>
                </h4>
                <div className="space-y-1.5">
                  {qualifications.map((q) => (
                    <div key={q} className="flex items-center gap-2 text-xs font-mono font-bold text-navy-800 dark:text-navy-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-mono font-black text-navy-500 dark:text-navy-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                  <span>Subjects & Modules Taught</span>
                </h4>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {subjectsTaught.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-navy-100 dark:bg-navy-950 text-navy-700 dark:text-navy-300 border border-navy-200 dark:border-navy-800">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
