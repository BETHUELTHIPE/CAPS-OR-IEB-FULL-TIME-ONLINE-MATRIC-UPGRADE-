import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Check, ChevronRight, ChevronLeft, Calendar, Clock, BookOpen, 
  Layers, Video, CheckCircle, AlertCircle, CreditCard, ShieldCheck,
  Building, User, UserPlus, MessageSquare, Award, Sparkles, LogIn,
  Send, MessageCircle, Mail, Download, Printer, FileText, Share2
} from "lucide-react";
import { Profile, Subject, LessonPackage, Booking, PaymentReceipt, DeliveryChannel } from "../types";
import { dbAPI } from "../lib/db";
import { TutorCalendar } from "./TutorCalendar";
import { TutorExpert, ALL_TUTORS_DATABASE } from "../lib/tutorsData";
import { ReceiptModal } from "./ReceiptModal";
import { executeAutomatedReceiptDispatch } from "../lib/receiptDispatchService";
import { SUPER_USER_CONTACT, generateWhatsAppReceiptUrl, downloadReceiptPdf, printReceiptPdf } from "../lib/pdfReceiptService";
import { generateGoogleCalendarDirectUrl } from "../lib/googleWorkspaceService";

interface BookingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  user: Profile | null;
  onSuccess: () => void;
}

const TIME_SLOTS = [
  "08:30 - 09:30",
  "10:00 - 11:00",
  "11:30 - 12:30",
  "13:30 - 14:30",
  "15:00 - 16:00",
  "16:30 - 17:30",
  "18:00 - 19:00"
];

export const BookingWizard: React.FC<BookingWizardProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess
}) => {
  // 6 Steps state
  const [step, setStep] = useState<number>(1);
  
  // Selection States
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>("usr-bethuel");
  const [category, setCategory] = useState<"caps" | "ieb" | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [platform, setPlatform] = useState<"Zoom">("Zoom");
  const [topics, setTopics] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  // Receipt Delivery Channel & Contacts
  const [deliveryChannel, setDeliveryChannel] = useState<DeliveryChannel>("both");
  const [studentPhone, setStudentPhone] = useState<string>(user?.whatsapp_number || user?.phone || "");
  const [parentName, setParentName] = useState<string>(user?.parent_name || "");
  const [parentPhone, setParentPhone] = useState<string>(user?.parent_phone || "");
  
  // Receipt & Modal States
  const [generatedReceipt, setGeneratedReceipt] = useState<PaymentReceipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isDispatchedAlert, setIsDispatchedAlert] = useState(false);

  // Payment States
  const [paymentMethod, setPaymentMethod] = useState<"card" | "eft">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState<string>("");
  
  // PayFast secure states
  const [payfastStatus, setPayfastStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [payfastProgress, setPayfastProgress] = useState(0);
  const [payfastMessage, setPayfastMessage] = useState("");
  
  // App States
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [packages, setPackages] = useState<LessonPackage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<Booking | null>(null);

  // Load database entities
  useEffect(() => {
    setSubjects(dbAPI.getSubjects());
    setPackages(dbAPI.getPackages());
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split("T")[0]);
  }, []);

  if (!isOpen) return null;

  // Filter subjects based on Step 1 selection
  const getFilteredSubjects = () => {
    if (category === "caps") {
      return subjects.filter(s => s.name.toLowerCase().includes("caps") || s.grade_level === "Matric Upgrade" || s.grade_level === "High School");
    }
    if (category === "ieb") {
      return subjects.filter(s => s.name.toLowerCase().includes("ieb") || s.grade_level === "IEB");
    }
    return subjects;
  };

  const filteredSubjects = getFilteredSubjects();
  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const selectedPackage = packages.find(p => p.id === selectedPackageId);
  const activeSelectedTutor = ALL_TUTORS_DATABASE.find(t => t.id === selectedTutorId) || ALL_TUTORS_DATABASE[0];

  // Automatic formatters for Card UI
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatCardExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  // Step Validation Guard
  const isStepValid = () => {
    if (step === 1) return category !== null;
    if (step === 2) return selectedSubjectId !== null;
    if (step === 3) return selectedPackageId !== null;
    if (step === 4) return selectedDate !== "" && selectedTimeSlot !== null;
    if (step === 5) return platform !== null;
    if (step === 6) {
      if (paymentMethod === "card") {
        return cardNumber.length >= 16 && cardExpiry.length >= 5 && cardCvv.length >= 3 && cardName.trim() !== "";
      }
      if (paymentMethod === "eft") {
        return selectedBank !== "";
      }
    }
    return true;
  };

  const handleNext = () => {
    if (isStepValid() && step < 6) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  // Submit Booking
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in or register an account before booking live classes.");
      return;
    }

    if (!isStepValid()) {
      alert("Please fill in all required payment details to confirm your package.");
      return;
    }

    setIsSubmitting(true);
    setPayfastStatus("processing");
    setPayfastProgress(10);
    setPayfastMessage("Connecting to PayFast Secure Processing Gateway...");

    // Stage 1: Handshake
    setTimeout(() => {
      setPayfastProgress(30);
      setPayfastMessage("Validating merchant signatures and security tokens...");

      // Stage 2: Bank Handshake
      setTimeout(() => {
        setPayfastProgress(65);
        setPayfastMessage(
          paymentMethod === "card"
            ? "Authorizing card vault session. Prompting parents for 3D-Secure approval..."
            : `Handshaking with ${selectedBank} Instant EFT servers. Requesting secure payment authorization...`
        );

        // Stage 3: Confirmation
        setTimeout(() => {
          setPayfastProgress(85);
          setPayfastMessage("Bank authorization received! Generating official Tax Invoice PDF and triggering simultaneous notifications...");

          // Stage 4: Writing DB & Automated Receipt Dispatch
          setTimeout(async () => {
            try {
              const topicList = topics ? topics.split(",").map(t => t.trim()) : ["General Matric Syllabus Mastery"];
              const selectedSub = subjects.find(s => s.id === (selectedSubjectId || subjects[0]?.id));
              const selectedPkg = packages.find(p => p.id === (selectedPackageId || packages[0]?.id));

              // 1. Create Booking Record
              const booking = dbAPI.createBooking({
                student_id: user.id,
                subject_id: selectedSubjectId || subjects[0].id,
                package_id: selectedPackageId || packages[0].id,
                lesson_date: selectedDate,
                lesson_time: selectedTimeSlot || "15:00",
                duration_minutes: 60,
                platform: platform,
                topics_to_cover: topicList,
                notes: notes || "No additional instructions"
              });

              // 2. Create Payment Record
              const payment = dbAPI.createPayment({
                booking_id: booking.id,
                student_id: user.id,
                amount: selectedPkg?.price || 300,
                currency: "ZAR",
                payment_method: paymentMethod === "card" ? "Credit/Debit Card (PayFast)" : `Instant EFT (${selectedBank || "Capitec/FNB"})`,
                transaction_id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
                status: "successful"
              });

              // 3. Automated Dual Dispatch of PDF Receipt & Booking Details (Student & Super User)
              const studentProfileWithPhone: Profile = {
                ...user,
                whatsapp_number: studentPhone || user.whatsapp_number || user.phone || "+27714156665",
                phone: studentPhone || user.phone || "+27714156665",
                parent_name: parentName || user.parent_name,
                parent_phone: parentPhone || user.parent_phone
              };

              const dispatchResult = await executeAutomatedReceiptDispatch({
                booking,
                payment,
                student: studentProfileWithPhone,
                subjectName: selectedSub?.name || "NSC Mathematics",
                packageName: selectedPkg?.name || "1-on-1 Interactive Tutoring",
                lessonsCount: selectedPkg?.lessons_count || 1,
                deliveryChannel: deliveryChannel,
                parentName: parentName || user.parent_name,
                parentPhone: parentPhone || user.parent_phone
              });

              setGeneratedReceipt(dispatchResult.receipt);
              setIsDispatchedAlert(true);

              setPayfastProgress(100);
              setPayfastMessage("Payment cleared & tax receipt dispatched simultaneously!");
              setPayfastStatus("success");

              setTimeout(() => {
                setBookingSuccess(booking);
                setPayfastStatus("idle");
                setIsSubmitting(false);
                onSuccess();
              }, 1200);

            } catch (err) {
              setPayfastStatus("error");
              setPayfastMessage(`Transaction Failed: ${err}`);
              setIsSubmitting(false);
              setTimeout(() => setPayfastStatus("idle"), 4000);
            }
          }, 1200);

        }, 1500);

      }, 1500);

    }, 1000);
  };

  // Get Tutor general weekly availability & booked slots for selected date to show realistic system availability
  const isSlotBooked = (slot: string) => {
    if (!selectedDate) return false;

    // 1. Check existing bookings first
    try {
      const allBookings = dbAPI.getAllBookings();
      const match = allBookings.find(b => b.lesson_date === selectedDate && b.lesson_time === slot && b.status !== "cancelled");
      if (match) return true;
    } catch (e) {
      console.error(e);
    }

    // 2. Check tutor weekly availability
    try {
      const saved = localStorage.getItem("amh_tutor_availability");
      if (saved) {
        const availability = JSON.parse(saved);
        const dateObj = new Date(selectedDate);
        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayName = weekdays[dateObj.getDay()];
        const busySlots = availability[dayName] || [];
        if (busySlots.includes(slot)) {
          return true; // Marked as Busy (unavailable) by tutor
        }
      } else {
        // Fallback default busy template
        const defaultBusy: Record<string, string[]> = {
          "Monday": ["08:30 - 09:30", "16:30 - 17:30"],
          "Tuesday": ["11:30 - 12:30"],
          "Wednesday": ["15:00 - 16:00"],
          "Thursday": ["13:30 - 14:30"],
          "Friday": ["18:00 - 19:00"],
          "Saturday": ["08:30 - 09:30", "10:00 - 11:00"],
          "Sunday": ["11:30 - 12:30", "13:30 - 14:30", "15:00 - 16:00"]
        };
        const dateObj = new Date(selectedDate);
        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayName = weekdays[dateObj.getDay()];
        const busySlots = defaultBusy[dayName] || [];
        if (busySlots.includes(slot)) {
          return true;
        }
      }
    } catch (e) {
      console.error(e);
    }

    // 3. Fallback pseudo-random block for other unconfigured slots to keep demo interesting
    let sum = 0;
    for (let i = 0; i < selectedDate.length; i++) {
      sum += selectedDate.charCodeAt(i);
    }
    const slotIdx = TIME_SLOTS.indexOf(slot);
    return (sum + slotIdx) % 7 === 0;
  };

  const currentStepTitle = () => {
    switch(step) {
      case 1: return "Choose Curriculum Stream";
      case 2: return "Select Mathematics Subject";
      case 3: return "Choose Lesson Package";
      case 4: return "Pick Date & Available Slot";
      case 5: return "Details & Preference";
      case 6: return "Secure Payment Checkout";
      default: return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 bg-navy-50 hover:bg-navy-100 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-500 dark:text-navy-300 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT COLUMN: Steps Tracker (Branding Panel) */}
        <div className="md:w-1/3 bg-gradient-to-b from-navy-900 via-navy-950 to-royal-950 text-white p-6 sm:p-8 flex flex-col justify-between border-r border-navy-800">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-mono text-gold-400 uppercase tracking-widest block mb-1">
                Amaris Scheduling
              </span>
              <h2 className="text-xl font-black font-display text-white">
                Live Class Booking
              </h2>
              <p className="text-[11px] text-navy-300 leading-relaxed mt-1">
                Reserve custom 1-on-1 whiteboards, select CAPS or IEB, and boost your university admission points (APS).
              </p>
            </div>

            {/* Stepper Steps (1-6) */}
            <div className="hidden md:flex flex-col gap-3">
              {[1, 2, 3, 4, 5, 6].map((idx) => {
                let status: "active" | "completed" | "upcoming" = "upcoming";
                if (step === idx) status = "active";
                else if (step > idx) status = "completed";

                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                      status === "active" ? "bg-gold-400 border-gold-400 text-navy-950 shadow" :
                      status === "completed" ? "bg-royal-600 border-royal-600 text-white" :
                      "border-navy-700 text-navy-400"
                    }`}>
                      {status === "completed" ? <Check className="w-3.5 h-3.5" /> : idx}
                    </div>
                    <span className={`text-[11px] font-mono tracking-wide ${
                      status === "active" ? "text-white font-black" :
                      status === "completed" ? "text-navy-200" :
                      "text-navy-400"
                    }`}>
                      {idx === 1 && "Curriculum Category"}
                      {idx === 2 && "Subject Selection"}
                      {idx === 3 && "Lesson Package"}
                      {idx === 4 && "Date & Time Slot"}
                      {idx === 5 && "Platform & Notes"}
                      {idx === 6 && "Secure Checkout"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-navy-800 flex items-center gap-2 text-[10px] text-navy-400 font-mono">
            <ShieldCheck className="w-4 h-4 text-gold-500" />
            <span>Secure encryption via PayFast SA</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Step Content */}
        <div className="md:w-2/3 flex flex-col justify-between p-6 sm:p-8 bg-white dark:bg-navy-900 text-left">
          
          {/* Header Title (Mobile responsive step indicator) */}
          <div className="border-b border-navy-150 dark:border-navy-800 pb-3 mb-5 flex justify-between items-center">
            <div>
              <span className="text-[9px] font-mono text-navy-400 dark:text-navy-500 uppercase block md:hidden">Step {step} of 6</span>
              <h3 className="text-base sm:text-lg font-black font-display text-navy-900 dark:text-white">
                {currentStepTitle()}
              </h3>
            </div>
            {selectedPackage && step > 3 && (
              <div className="text-right">
                <span className="text-[9px] font-mono text-navy-400 block">SELECTED PACKAGE</span>
                <span className="text-xs font-bold text-royal-600 dark:text-gold-400">R{selectedPackage.price} ZAR</span>
              </div>
            )}
          </div>

          {/* Advice to register before booking */}
          {!user && (
            <div id="register-advice" className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-amber-100/40 dark:from-navy-950 dark:to-navy-900/50 border border-amber-250 dark:border-navy-800 rounded-xl space-y-2.5 shadow-sm text-left">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-navy-950 dark:text-white flex items-center gap-1.5">
                    Recommended: Register Your Student Profile First
                  </h4>
                  <p className="text-[10px] text-navy-600 dark:text-navy-400 leading-relaxed">
                    We highly recommend creating your student profile <strong>before</strong> scheduling classes. 
                    Registered students get access to the <strong>student cockpit dashboard</strong> to view lesson details, launch virtual whiteboards, and download study resources.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1 border-t border-amber-200/50 dark:border-navy-800/80 pl-0">
                <Link
                  to="/register?redirect=book"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-royal-600 hover:bg-royal-700 text-white font-extrabold text-[10px] rounded-lg flex items-center gap-1 shadow-sm transition-all"
                >
                  <UserPlus className="w-3 h-3" />
                  Register Now
                </Link>
                <Link
                  to="/login?redirect=book"
                  onClick={onClose}
                  className="px-3 py-1.5 border border-navy-200 dark:border-navy-700 hover:bg-navy-50 dark:hover:bg-navy-850 text-navy-700 dark:text-navy-300 font-bold text-[10px] rounded-lg flex items-center gap-1 transition-all"
                >
                  <LogIn className="w-3 h-3" />
                  Log In
                </Link>
              </div>
            </div>
          )}

          {/* Scrolling Steps Container */}
          <div className="flex-1 overflow-y-auto max-h-[50vh] pr-1 scrollbar-thin">
            <AnimatePresence mode="wait">
              {bookingSuccess ? (
                /* SUCCESS CONGRATULATION SCREEN WITH SIMULTANEOUS DISPATCH & PDF RECEIPT */
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-5 text-center py-4"
                >
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-inner">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[10px] font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded uppercase tracking-wider border border-emerald-500/20">
                        Payment Cleared & Verified
                      </span>
                      {generatedReceipt && (
                        <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                          {generatedReceipt.receipt_number}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xl font-black text-navy-900 dark:text-white">
                      Live Classroom Slot & Receipt Locked!
                    </h4>
                    <p className="text-xs text-navy-500 dark:text-navy-400 max-w-md mx-auto">
                      Official Tax Invoice & lesson details have been simultaneously dispatched via your preferred channel.
                    </p>
                  </div>

                  {/* Simultaneous Delivery Tracker Card */}
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-3 text-left max-w-md mx-auto space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
                      <span className="flex items-center gap-1.5 font-mono">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Simultaneous Multi-Channel Dispatch:
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                        {deliveryChannel.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-emerald-150 dark:border-emerald-900/30 space-y-0.5">
                        <span className="text-[9px] font-mono font-bold uppercase text-slate-500 block">Student Recipient</span>
                        <p className="font-bold text-slate-900 dark:text-white truncate">{user?.email || "Student"}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                          {studentPhone || user?.phone || "WhatsApp Linked"}
                        </p>
                      </div>

                      <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-emerald-150 dark:border-emerald-900/30 space-y-0.5">
                        <span className="text-[9px] font-mono font-bold uppercase text-slate-500 block">Super User (Bethuel)</span>
                        <p className="font-bold text-slate-900 dark:text-white truncate">{SUPER_USER_CONTACT.email}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                          {SUPER_USER_CONTACT.displayPhone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Booking & Classroom Details */}
                  <div className="bg-navy-50 dark:bg-navy-950 p-4 rounded-xl border border-navy-150 dark:border-navy-800 max-w-md mx-auto text-xs space-y-2 font-mono text-left">
                    <div className="flex justify-between border-b border-navy-150 dark:border-navy-800 pb-1.5">
                      <span className="text-navy-400">Booking Reference:</span>
                      <span className="font-bold text-navy-900 dark:text-white">{bookingSuccess.booking_reference}</span>
                    </div>
                    <div className="flex justify-between border-b border-navy-150 dark:border-navy-800 pb-1.5">
                      <span className="text-navy-400">Date & Slot:</span>
                      <span className="font-bold text-navy-900 dark:text-white">{bookingSuccess.lesson_date} @ {bookingSuccess.lesson_time}</span>
                    </div>
                    <div className="flex justify-between border-b border-navy-150 dark:border-navy-800 pb-1.5">
                      <span className="text-navy-400">Classroom Room:</span>
                      <a 
                        href={bookingSuccess.meeting_link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="font-bold text-royal-600 dark:text-gold-400 underline flex items-center gap-1 hover:text-royal-700"
                      >
                        Join Zoom Whiteboard <Video className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <div className="flex justify-between pt-0.5">
                      <span className="text-navy-400">Amount Cleared:</span>
                      <span className="font-bold text-emerald-600">R{selectedPackage?.price || 300}.00 ZAR</span>
                    </div>
                  </div>

                  {/* Quick Action Buttons Bento */}
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-center max-w-md mx-auto">
                    {generatedReceipt && (
                      <button
                        type="button"
                        id="view-tax-invoice-receipt-btn"
                        onClick={() => setIsReceiptModalOpen(true)}
                        className="flex-1 min-w-[170px] px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-4 h-4" /> View / Download Receipt
                      </button>
                    )}

                    {generatedReceipt && (
                      <a
                        id="open-whatsapp-student-receipt-btn"
                        href={generateWhatsAppReceiptUrl(generatedReceipt, studentPhone || SUPER_USER_CONTACT.whatsappNumber, false)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle className="w-4 h-4" /> Student WhatsApp
                      </a>
                    )}

                    {generatedReceipt && (
                      <a
                        id="open-whatsapp-superuser-receipt-btn"
                        href={generateWhatsAppReceiptUrl(generatedReceipt, SUPER_USER_CONTACT.whatsappNumber, true)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle className="w-4 h-4" /> Super User Alert
                      </a>
                    )}

                    {bookingSuccess && (
                      <a
                        id="add-booking-to-google-cal-btn"
                        href={generateGoogleCalendarDirectUrl(
                          bookingSuccess, 
                          selectedSubject?.name || "NSC Mathematics", 
                          user ? `${user.first_name} ${user.surname}` : "Student"
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-4 py-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-4 h-4 text-blue-600" /> 
                        Add Lesson to Google Calendar (Instant Sync)
                      </a>
                    )}

                    <button 
                      onClick={onClose}
                      className="w-full px-5 py-2.5 bg-gradient-to-r from-royal-600 to-royal-700 hover:from-royal-700 hover:to-royal-800 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all"
                    >
                      Go to Cockpit Dashboard
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* SIX INTERACTIVE WIZARD STEPS */
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* STEP 1: CATEGORY SELECTION */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <p className="text-xs text-navy-500 dark:text-navy-400 mb-2">
                        First, select your curriculum alignment. This helps us display the correct syllabus guidelines.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setCategory("caps");
                            setSelectedSubjectId(null); // Reset subject if category change
                          }}
                          className={`p-5 rounded-2xl border text-left transition-all relative ${
                            category === "caps" 
                              ? "bg-royal-50/60 dark:bg-royal-950/20 border-royal-500 dark:border-gold-400 ring-2 ring-royal-200 dark:ring-gold-400/20" 
                              : "border-navy-150 dark:border-navy-850 hover:bg-navy-50 dark:hover:bg-navy-850/40"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="p-2 bg-royal-100 dark:bg-navy-800 text-royal-600 dark:text-gold-400 rounded-lg">
                              <Layers className="w-5 h-5" />
                            </div>
                            {category === "caps" && (
                              <span className="bg-royal-600 dark:bg-gold-500 text-white dark:text-navy-950 rounded-full p-0.5">
                                <Check className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-extrabold text-navy-900 dark:text-white mt-4">Matric Upgrade CAPS</h4>
                          <p className="text-[11px] text-navy-500 dark:text-navy-400 mt-1 leading-relaxed">
                            National Senior Certificate syllabus (Public Schools). Includes Core Mathematics, Technical Math, and Math Literacy.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCategory("ieb");
                            setSelectedSubjectId(null); // Reset
                          }}
                          className={`p-5 rounded-2xl border text-left transition-all relative ${
                            category === "ieb" 
                              ? "bg-royal-50/60 dark:bg-royal-950/20 border-royal-500 dark:border-gold-400 ring-2 ring-royal-200 dark:ring-gold-400/20" 
                              : "border-navy-150 dark:border-navy-850 hover:bg-navy-50 dark:hover:bg-navy-850/40"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="p-2 bg-royal-100 dark:bg-navy-800 text-royal-600 dark:text-gold-400 rounded-lg">
                              <Award className="w-5 h-5" />
                            </div>
                            {category === "ieb" && (
                              <span className="bg-royal-600 dark:bg-gold-500 text-white dark:text-navy-950 rounded-full p-0.5">
                                <Check className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-extrabold text-navy-900 dark:text-white mt-4">IEB Independent</h4>
                          <p className="text-[11px] text-navy-500 dark:text-navy-400 mt-1 leading-relaxed">
                            Independent Examinations Board syllabus (Private Schools). Includes Advanced IEB Mathematics and AP Maths (Enrichment).
                          </p>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: SUBJECT SELECTION */}
                  {step === 2 && (
                    <div className="space-y-3">
                      <p className="text-xs text-navy-500 dark:text-navy-400">
                        Select from the list of mathematics fields in the Amaris database matching your category.
                      </p>

                      <div className="space-y-2">
                        {filteredSubjects.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => setSelectedSubjectId(s.id)}
                            className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer flex justify-between items-center ${
                              selectedSubjectId === s.id 
                                ? "bg-royal-50/40 dark:bg-royal-950/10 border-royal-500 dark:border-gold-400" 
                                : "border-navy-150 dark:border-navy-850 hover:bg-navy-50 dark:hover:bg-navy-850/30"
                            }`}
                          >
                            <div className="space-y-1 flex-1 pr-4">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs sm:text-sm font-extrabold text-navy-900 dark:text-white">{s.name}</h4>
                                <span className="text-[8px] font-mono font-bold bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300 px-1.5 py-0.5 rounded uppercase">
                                  {s.grade_level}
                                </span>
                              </div>
                              <p className="text-[11px] text-navy-500 dark:text-navy-400 leading-relaxed line-clamp-2 sm:line-clamp-none">{s.description}</p>
                            </div>
                            {selectedSubjectId === s.id && (
                              <div className="flex-shrink-0 text-royal-600 dark:text-gold-400">
                                <Check className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: PACKAGE SELECTION */}
                  {step === 3 && (
                    <div className="space-y-3">
                      <p className="text-xs text-navy-500 dark:text-navy-400">
                        Choose an active lesson bundle. Selecting a larger package grants substantial percentage-off discounts.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {packages.map((pkg) => {
                          const isSelected = selectedPackageId === pkg.id;
                          return (
                            <div
                              key={pkg.id}
                              onClick={() => setSelectedPackageId(pkg.id)}
                              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                                isSelected 
                                  ? "bg-royal-50/40 dark:bg-royal-950/10 border-royal-500 dark:border-gold-400 ring-1 ring-royal-200 dark:ring-gold-400/10" 
                                  : "border-navy-150 dark:border-navy-850 hover:bg-navy-50 dark:hover:bg-navy-850/30"
                              }`}
                            >
                              {pkg.discount_percentage > 0 && (
                                <span className="absolute top-2.5 right-2.5 text-[8px] font-mono font-black text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                  Save {pkg.discount_percentage}%
                                </span>
                              )}
                              
                              <div className="space-y-2">
                                <div className="space-y-0.5">
                                  <h4 className="text-xs font-black text-navy-900 dark:text-white">{pkg.name}</h4>
                                  <p className="text-[10px] text-navy-400">{pkg.lessons_count} Hours Live lessons</p>
                                </div>
                                <p className="text-[10px] text-navy-500 dark:text-navy-400 leading-normal line-clamp-2">{pkg.description}</p>
                                
                                <ul className="space-y-1 pt-1.5 border-t border-navy-100 dark:border-navy-850">
                                  {pkg.features.slice(0, 3).map((f, i) => (
                                    <li key={i} className="text-[9px] text-navy-400 flex items-center gap-1.5">
                                      <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                      <span className="truncate">{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="pt-3 mt-3 border-t border-navy-100 dark:border-navy-850 flex justify-between items-center">
                                <span className="text-[9px] font-mono text-navy-400">TOTAL PRICE</span>
                                <span className="text-xs font-black text-royal-600 dark:text-gold-400">R{pkg.price} ZAR</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STEP 4: DATE & TIME PICKER */}
                  {step === 4 && (
                    <div className="space-y-4">
                      <p className="text-xs text-navy-500 dark:text-navy-400">
                        Pick a date and select one of our available virtual whiteboard slots on the visual calendar.
                      </p>

                      <TutorCalendar
                        selectedDate={selectedDate}
                        selectedSlot={selectedTimeSlot}
                        tutorName={activeSelectedTutor.fullName}
                        tutorTitle={activeSelectedTutor.title}
                        tutorAvatar={activeSelectedTutor.avatar}
                        tutorSyllabus={activeSelectedTutor.syllabusFocus}
                        onSelectSlot={(date, slot) => {
                          setSelectedDate(date);
                          setSelectedTimeSlot(slot);
                        }}
                      />
                    </div>
                  )}

                  {/* STEP 5: NOTES & PLATFORM PREFERENCE */}
                  {step === 5 && (
                    <div className="space-y-4">
                      <p className="text-xs text-navy-500 dark:text-navy-400">
                        All 1-on-1 private tutoring classes are conducted exclusively via <b>Zoom Live Whiteboard</b> for real-time mathematical equation sketching, formula proofs, and screen sharing.
                      </p>

                      <div className="space-y-3.5">
                        {/* Platform Display */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-mono font-black text-navy-500 uppercase">
                            Virtual Room Platform (Zoom Only)
                          </label>
                          <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
                                <Video className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-sm font-extrabold text-navy-900 dark:text-white flex items-center gap-1.5">
                                  Zoom Live Whiteboard Session
                                  <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded bg-blue-500 text-white uppercase">
                                    Exclusive
                                  </span>
                                </h4>
                                <p className="text-[11px] text-navy-500 dark:text-navy-400 mt-0.5">
                                  Includes real-time stylus annotations, step-by-step CAPS/IEB solution boards, and recorded replay.
                                </p>
                              </div>
                            </div>
                            <div className="text-right hidden sm:block">
                              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                                HD Audio/Video Active
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Preferred Notification & Tax Invoice Delivery Channel */}
                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                          <label className="block text-[10px] font-mono font-black text-amber-600 dark:text-amber-400 uppercase flex items-center justify-between">
                            <span>Preferred Receipt Delivery Channel</span>
                            <span className="text-[9px] lowercase font-normal text-slate-500">Student & Super User Auto-Alert</span>
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => setDeliveryChannel("email")}
                              className={`p-2 rounded-lg text-center border text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                                deliveryChannel === "email"
                                  ? "bg-white dark:bg-navy-900 border-royal-500 text-royal-600 dark:text-gold-400 shadow-sm"
                                  : "border-navy-200 dark:border-navy-800 text-navy-600 dark:text-navy-400 hover:bg-white/50"
                              }`}
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Email Only</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeliveryChannel("whatsapp")}
                              className={`p-2 rounded-lg text-center border text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                                deliveryChannel === "whatsapp"
                                  ? "bg-white dark:bg-navy-900 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm"
                                  : "border-navy-200 dark:border-navy-800 text-navy-600 dark:text-navy-400 hover:bg-white/50"
                              }`}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeliveryChannel("both")}
                              className={`p-2 rounded-lg text-center border text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1 relative ${
                                deliveryChannel === "both"
                                  ? "bg-gradient-to-r from-royal-600 to-royal-700 text-white border-transparent shadow-sm"
                                  : "border-navy-200 dark:border-navy-800 text-navy-600 dark:text-navy-400 hover:bg-white/50"
                              }`}
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>Both (Simultaneous)</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            <div>
                              <label className="text-[9px] font-mono text-navy-500 uppercase block mb-0.5">
                                Student WhatsApp / Phone
                              </label>
                              <input
                                type="text"
                                placeholder="+27 71 415 6665"
                                value={studentPhone}
                                onChange={(e) => setStudentPhone(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white text-xs font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-mono text-navy-500 uppercase block mb-0.5">
                                Parent Phone (Optional)
                              </label>
                              <input
                                type="text"
                                placeholder="+27 82 000 0000"
                                value={parentPhone}
                                onChange={(e) => setParentPhone(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white text-xs font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Topics comma input */}
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono font-black text-navy-500 uppercase">
                            Specific Chapters / Concepts (Comma-separated)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Sinking Funds, Calculus Limits, Optimization"
                            value={topics}
                            onChange={(e) => setTopics(e.target.value)}
                            className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 text-xs"
                          />
                        </div>

                        {/* Additional notes */}
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono font-black text-navy-500 uppercase">
                            Instructions for the Tutor
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Please explain first principles in calculus using f(x) = 3x^2... I keep getting stuck with algebraic simplification."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 6: PAYMENT & CONFIRMATION */}
                  {step === 6 && (
                    <div className="space-y-4">
                      <p className="text-xs text-navy-500 dark:text-navy-400">
                        Verify your booking overview and complete your South African PayFast secure checkout.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        {/* Summary Receipt Card */}
                        <div className="sm:col-span-5 bg-navy-50 dark:bg-navy-950 p-4 rounded-xl border border-navy-150 dark:border-navy-800 space-y-3 text-[11px]">
                          <h4 className="font-mono font-bold text-navy-400 uppercase text-[9px] tracking-wide border-b border-navy-150 dark:border-navy-800 pb-1.5">
                            BOOKING SUMMARY
                          </h4>
                          
                          <div className="space-y-2">
                            <div>
                              <span className="text-[9px] font-mono text-navy-400 block">SUBJECT</span>
                              <span className="font-bold text-navy-900 dark:text-white leading-tight block">
                                {selectedSubject?.name}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono text-navy-400 block">PACKAGE BUNDLE</span>
                              <span className="font-bold text-navy-900 dark:text-white block">
                                {selectedPackage?.name} ({selectedPackage?.lessons_count} hrs)
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono text-navy-400 block">DATE & TIME</span>
                              <span className="font-bold text-navy-900 dark:text-white font-mono block">
                                {selectedDate} @ {selectedTimeSlot}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono text-navy-400 block">CLASSROOM ROOM</span>
                              <span className="font-bold text-navy-900 dark:text-white block">
                                {platform} virtual whiteboard
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-navy-200 dark:border-navy-800 flex justify-between items-center text-xs font-black">
                            <span className="text-navy-900 dark:text-white">TOTAL DUE:</span>
                            <span className="text-royal-600 dark:text-gold-400 text-sm font-black font-mono">
                              R{selectedPackage?.price}.00 ZAR
                            </span>
                          </div>
                        </div>

                        {/* Payment inputs form */}
                        <div className="sm:col-span-7 space-y-3">
                          {/* Payment method toggle */}
                          <div className="flex bg-navy-100 dark:bg-navy-950 p-0.5 rounded-lg border border-navy-150 dark:border-navy-850">
                            <button
                              type="button"
                              onClick={() => setPaymentMethod("card")}
                              className={`flex-1 py-1 text-center rounded-md font-bold text-[10px] uppercase transition-all ${
                                paymentMethod === "card" 
                                  ? "bg-white dark:bg-navy-900 text-navy-900 dark:text-white shadow-sm" 
                                  : "text-navy-500 hover:text-navy-700"
                              }`}
                            >
                              Credit/Debit Card
                            </button>
                            <button
                              type="button"
                              onClick={() => setPaymentMethod("eft")}
                              className={`flex-1 py-1 text-center rounded-md font-bold text-[10px] uppercase transition-all ${
                                paymentMethod === "eft" 
                                  ? "bg-white dark:bg-navy-900 text-navy-900 dark:text-white shadow-sm" 
                                  : "text-navy-500 hover:text-navy-700"
                              }`}
                            >
                              Instant EFT Transfer
                            </button>
                          </div>

                          {paymentMethod === "card" ? (
                            /* Card form */
                            <div className="space-y-2">
                              <div className="space-y-0.5">
                                <label className="text-[9px] font-mono font-bold text-navy-500 uppercase">Cardholder Name</label>
                                <input
                                  type="text"
                                  placeholder="e.g. B Thipe"
                                  value={cardName}
                                  onChange={(e) => setCardName(e.target.value)}
                                  className="w-full px-3 py-1.5 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none"
                                />
                              </div>

                              <div className="space-y-0.5">
                                <label className="text-[9px] font-mono font-bold text-navy-500 uppercase">Card Number</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="4000 1234 5678 9010"
                                    maxLength={19}
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                    className="w-full px-3 py-1.5 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none font-mono"
                                  />
                                  <CreditCard className="w-4 h-4 text-navy-400 absolute right-3 top-2" />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-0.5">
                                  <label className="text-[9px] font-mono font-bold text-navy-500 uppercase">Expiry Date</label>
                                  <input
                                    type="text"
                                    placeholder="MM/YY"
                                    maxLength={5}
                                    value={cardExpiry}
                                    onChange={(e) => setCardExpiry(formatCardExpiry(e.target.value))}
                                    className="w-full px-3 py-1.5 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none font-mono text-center"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <label className="text-[9px] font-mono font-bold text-navy-500 uppercase">CVV Code</label>
                                  <input
                                    type="password"
                                    placeholder="123"
                                    maxLength={3}
                                    value={cardCvv}
                                    onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ""))}
                                    className="w-full px-3 py-1.5 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none font-mono text-center"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Instant EFT selection */
                            <div className="space-y-2">
                              <label className="block text-[9px] font-mono font-bold text-navy-500 uppercase">
                                Select South African Bank
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                {["First National Bank (FNB)", "Capitec Bank", "Standard Bank", "Nedbank", "ABSA Bank", "TymeBank"].map((bank) => (
                                  <button
                                    type="button"
                                    key={bank}
                                    onClick={() => setSelectedBank(bank)}
                                    className={`p-2.5 rounded-lg text-center border text-[10px] font-semibold transition-all flex items-center gap-1.5 justify-center ${
                                      selectedBank === bank 
                                        ? "bg-royal-50 dark:bg-royal-950/20 border-royal-500 dark:border-gold-400 text-royal-700 dark:text-gold-400" 
                                        : "bg-white dark:bg-navy-900 border-navy-150 dark:border-navy-850 text-navy-700 dark:text-navy-300 hover:bg-navy-50"
                                    }`}
                                  >
                                    <Building className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span className="truncate">{bank.split(" (")[0]}</span>
                                  </button>
                                ))}
                              </div>
                              {selectedBank && (
                                <p className="text-[9px] font-mono text-amber-600 bg-amber-500/10 p-2 rounded leading-relaxed">
                                  *Instructions: Secure connection via <b>{selectedBank}</b>. You will authorize this single payment of R{selectedPackage?.price} via your mobile banking app.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FOOTER BUTTONS CONTROL AREA */}
          {!bookingSuccess && (
            <div className="border-t border-navy-150 dark:border-navy-800 pt-4 mt-6 flex justify-between gap-3 items-center">
              <span className="text-[10px] font-mono text-navy-400">
                Step {step} of 6
              </span>
              
              <div className="flex gap-2">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-navy-50 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                )}

                {step < 6 ? (
                  <button
                    type="button"
                    disabled={!isStepValid()}
                    onClick={handleNext}
                    className={`px-4 py-2 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all ${
                      isStepValid() 
                        ? "bg-royal-600 hover:bg-royal-700 cursor-pointer" 
                        : "bg-navy-200 dark:bg-navy-800 text-navy-400 dark:text-navy-600 cursor-not-allowed"
                    }`}
                  >
                    Continue
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!isStepValid() || isSubmitting}
                    onClick={handleCheckoutSubmit}
                    className={`px-5 py-2.5 text-navy-950 text-xs font-black rounded-lg flex items-center gap-1.5 transition-all bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 shadow ${
                      isSubmitting 
                        ? "opacity-60 cursor-wait" 
                        : isStepValid() 
                          ? "cursor-pointer" 
                          : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                        Authorizing EFT...
                      </>
                    ) : (
                      <>
                        Pay & Book Now (R{selectedPackage?.price})
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* HIGH FIDELITY SECURE PAYFAST SIMULATOR OVERLAY */}
          {payfastStatus !== "idle" && (
            <div className="absolute inset-0 z-50 bg-navy-950/85 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl border border-red-100 flex flex-col text-left text-navy-900"
              >
                {/* PayFast Header */}
                <div className="bg-[#E21C26] text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base tracking-tight">pay<span className="text-white/80 font-normal">fast</span></span>
                    <span className="text-[8px] font-mono bg-white/20 px-1 py-0.5 rounded uppercase font-bold tracking-wider">Secure</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-mono bg-black/20 px-2 py-0.5 rounded-full text-white/90">
                    <ShieldCheck className="w-3 h-3 text-emerald-400 animate-pulse" />
                    <span>Encrypted</span>
                  </div>
                </div>

                {/* Amount details */}
                <div className="bg-navy-50 p-3.5 border-b border-navy-100 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-[9px] text-navy-400 uppercase">MERCHANT</p>
                    <p className="font-bold text-navy-800 text-[11px] truncate max-w-[150px]">Amaris Learning Hub</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[9px] text-navy-400 uppercase">DUE</p>
                    <p className="font-black text-sm text-[#E21C26]">R{selectedPackage?.price || 300}.00</p>
                  </div>
                </div>

                {/* Steps body */}
                <div className="p-6 flex flex-col items-center justify-center text-center space-y-5">
                  {payfastStatus === "processing" && (
                    <>
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-12 h-12 bg-red-600/10 rounded-full animate-ping" />
                        <div className="w-10 h-10 bg-[#E21C26] text-white rounded-full flex items-center justify-center shadow relative">
                          <CreditCard className="w-5 h-5 animate-pulse" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-navy-900">Authorizing Booking Payment</h4>
                        <p className="text-[11px] text-navy-500 max-w-[240px] leading-relaxed">{payfastMessage}</p>
                      </div>

                      {/* Custom progress line */}
                      <div className="w-full bg-navy-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#E21C26] h-full transition-all duration-300 rounded-full" 
                          style={{ width: `${payfastProgress}%` }}
                        />
                      </div>
                    </>
                  )}

                  {payfastStatus === "success" && (
                    <>
                      <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow">
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-extrabold text-navy-900">Booking Successfully Completed!</h4>
                        <p className="text-[10px] text-emerald-600 font-mono font-semibold">Token logged into your timeline</p>
                      </div>
                    </>
                  )}

                  {payfastStatus === "error" && (
                    <>
                      <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow">
                        <AlertCircle className="w-5 h-5" />
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-navy-950">Payment Verification Failed</h4>
                        <p className="text-[11px] text-red-600 font-mono">{payfastMessage}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer security */}
                <div className="bg-navy-50 p-3 border-t border-navy-100 flex items-center justify-center gap-1.5 text-[9px] text-navy-400 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Verified Secure PayFast SA Protocol</span>
                </div>
              </motion.div>
            </div>
          )}

        </div>

      </div>

      {/* Official Tax Invoice & PDF Receipt Interactive Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receipt={generatedReceipt}
      />
    </div>
  );
};
