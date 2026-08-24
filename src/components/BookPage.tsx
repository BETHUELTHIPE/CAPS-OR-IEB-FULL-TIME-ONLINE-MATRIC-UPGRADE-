import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Check, ChevronRight, ChevronLeft, Calendar, Clock, BookOpen, 
  Layers, Video, CheckCircle, AlertCircle, CreditCard, ShieldCheck,
  Building, User, UserPlus, MessageSquare, Award, Sparkles, LogIn, ExternalLink,
  Send, MessageCircle, Mail, Download, Printer, FileText, Share2
} from "lucide-react";
import { Profile, Subject, LessonPackage, Booking, PaymentReceipt, DeliveryChannel } from "../types";
import { dbAPI, dbAuth } from "../lib/db";
import { TutorCalendar } from "./TutorCalendar";
import { GooglePayButton } from "./GooglePayButton";
import { TutorFilterSystem } from "./TutorFilterSystem";
import { TutorExpert, ALL_TUTORS_DATABASE } from "../lib/tutorsData";
import { ReceiptModal } from "./ReceiptModal";
import { executeAutomatedReceiptDispatch } from "../lib/receiptDispatchService";
import { SUPER_USER_CONTACT, generateWhatsAppReceiptUrl } from "../lib/pdfReceiptService";

interface BookPageProps {
  user: Profile | null;
  onLoginSuccess: (user: Profile) => void;
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

export const BookPage: React.FC<BookPageProps> = ({ user, onLoginSuccess }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 6 Steps state
  const [step, setStep] = useState<number>(1);
  
  // PayFast secure states
  const [payfastStatus, setPayfastStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [payfastProgress, setPayfastProgress] = useState(0);
  const [payfastMessage, setPayfastMessage] = useState("");
  const [useRealSandbox, setUseRealSandbox] = useState(false);
  
  // Selection States
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(() => {
    return searchParams.get("tutor") || "usr-bethuel";
  });
  const [category, setCategory] = useState<"caps" | "ieb" | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [platform, setPlatform] = useState<"Zoom">("Zoom");
  const [topics, setTopics] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  // Guest/Authentication States (Step 6 inline login if not signed in)
  const [authEmail, setAuthEmail] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Receipt Delivery Channel & Contacts
  const [deliveryChannel, setDeliveryChannel] = useState<DeliveryChannel>("both");
  const [studentPhone, setStudentPhone] = useState<string>(user?.whatsapp_number || user?.phone || "");
  const [parentName, setParentName] = useState<string>(user?.parent_name || "");
  const [parentPhone, setParentPhone] = useState<string>(user?.parent_phone || "");

  // Receipt & Modal States
  const [generatedReceipt, setGeneratedReceipt] = useState<PaymentReceipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Payment States
  const [paymentMethod, setPaymentMethod] = useState<"card" | "eft" | "googlepay">("googlepay");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState<string>("");
  
  // Loaded Entities States
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

  // Monitor PayFast sandbox redirect return parameters
  useEffect(() => {
    const pfStatus = searchParams.get("payfast");
    if (pfStatus === "success") {
      const pendingStr = localStorage.getItem("amh_pending_booking");
      if (pendingStr) {
        try {
          const pending = JSON.parse(pendingStr);
          // Restore form state to display on confirmation screen
          setCategory(pending.category);
          setSelectedSubjectId(pending.subject_id);
          setSelectedPackageId(pending.package_id);
          setSelectedDate(pending.lesson_date);
          setSelectedTimeSlot(pending.lesson_time);
          setPlatform(pending.platform);
          setTopics(pending.topics_to_cover?.join(", ") || "");
          setNotes(pending.notes || "");

          // Create the real booking and clear states
          const booking = dbAPI.createBooking({
            student_id: pending.student_id,
            subject_id: pending.subject_id,
            package_id: pending.package_id,
            lesson_date: pending.lesson_date,
            lesson_time: pending.lesson_time,
            duration_minutes: 60,
            platform: pending.platform,
            topics_to_cover: pending.topics_to_cover,
            notes: pending.notes
          });

          setBookingSuccess(booking);
          localStorage.removeItem("amh_pending_booking");
          setSearchParams({});
        } catch (err) {
          console.error("Error restoring pending booking:", err);
        }
      }
    } else if (pfStatus === "cancel") {
      setStep(6);
      alert("Checkout canceled. You can complete your purchase anytime using our secure simulated gateway!");
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Filter subjects based on Step 1 curriculum category selection
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

  const handleSelectTutor = (tutor: TutorExpert) => {
    setSelectedTutorId(tutor.id);
    // Align syllabus category if tutor has specific alignment
    if (tutor.syllabusFocus.length === 1) {
      if (tutor.syllabusFocus[0] === "CAPS") {
        setCategory("caps");
      } else if (tutor.syllabusFocus[0] === "IEB") {
        setCategory("ieb");
      }
    }
    // Smooth scroll down to availability calendar
    const element = document.getElementById("tutor-calendar-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

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
      if (!user) {
        // Need email filled in to login/register inline
        return authEmail.trim() !== "" && authEmail.includes("@");
      }
      if (paymentMethod === "googlepay") {
        return true;
      }
      if (paymentMethod === "card") {
        const cleanCard = cardNumber.replace(/\s+/g, "");
        return cleanCard.length === 16 && cardExpiry.length === 5 && cardCvv.length === 3 && cardName.trim() !== "";
      }
      if (paymentMethod === "eft") {
        return selectedBank !== "";
      }
    }
    return true;
  };

  const handleGooglePayBookingSuccess = async (details: any) => {
    let currentUser = user;
    if (!currentUser && authEmail) {
      try {
        const loggedIn = dbAuth.login(authEmail);
        if (loggedIn) {
          onLoginSuccess(loggedIn);
          currentUser = loggedIn;
        }
      } catch (e) {
        console.error(e);
      }
    }

    const topicList = topics ? topics.split(",").map(t => t.trim()) : ["Algebraic Proofs & Trigonometry"];
    const selectedSub = subjects.find(s => s.id === (selectedSubjectId || subjects[0]?.id));
    const selectedPkg = packages.find(p => p.id === (selectedPackageId || packages[0]?.id));

    const booking = dbAPI.createBooking({
      student_id: currentUser ? currentUser.id : "usr-guest",
      subject_id: selectedSubjectId || subjects[0]?.id || "sub-1",
      package_id: selectedPackageId || packages[0]?.id || "pkg-1",
      lesson_date: selectedDate || new Date().toISOString().split("T")[0],
      lesson_time: selectedTimeSlot || "15:00 - 16:00",
      duration_minutes: 60,
      platform: platform,
      topics_to_cover: topicList,
      notes: notes || "Google Pay Instant Authorization"
    });

    const payment = dbAPI.createPayment({
      booking_id: booking.id,
      student_id: currentUser ? currentUser.id : "usr-guest",
      amount: details.amount,
      currency: details.currency || "ZAR",
      payment_method: details.paymentMethod || "Google Pay",
      transaction_id: details.transactionId,
      status: "successful"
    });

    const studentProfileWithPhone: Profile = currentUser ? {
      ...currentUser,
      whatsapp_number: studentPhone || currentUser.whatsapp_number || currentUser.phone || "+27714156665",
      phone: studentPhone || currentUser.phone || "+27714156665",
      parent_name: parentName || currentUser.parent_name,
      parent_phone: parentPhone || currentUser.parent_phone
    } : {
      id: "usr-guest",
      email: authEmail || "student@amarishub.co.za",
      first_name: "Student",
      surname: "Guest",
      role: "student",
      grade: "Grade 12",
      province: "Gauteng",
      school: "Amaris Open Academy",
      created_at: new Date().toISOString(),
      whatsapp_number: studentPhone || "+27714156665",
      phone: studentPhone || "+27714156665",
      parent_name: parentName,
      parent_phone: parentPhone
    };

    const dispatchResult = await executeAutomatedReceiptDispatch({
      booking,
      payment,
      student: studentProfileWithPhone,
      subjectName: selectedSub?.name || "NSC Mathematics",
      packageName: selectedPkg?.name || "Google Pay Quick Lesson",
      lessonsCount: selectedPkg?.lessons_count || 1,
      deliveryChannel: deliveryChannel,
      parentName: parentName || currentUser?.parent_name,
      parentPhone: parentPhone || currentUser?.parent_phone
    });

    setGeneratedReceipt(dispatchResult.receipt);
    setBookingSuccess(booking);
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

  // Quick Account Activation & Demo Sign-In
  const handleAuthSubmit = (emailStr: string) => {
    try {
      const loggedIn = dbAuth.login(emailStr);
      if (loggedIn) {
        onLoginSuccess(loggedIn);
        setAuthError(null);
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to log in.");
    }
  };

  const handleDemoSignIn = () => {
    handleAuthSubmit("bethuelmoukangwe8@gmail.com");
  };

  // Confirm booking
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let currentUser = user;
    if (!currentUser) {
      if (!authEmail || !authEmail.includes("@")) {
        setAuthError("A valid email address is required to register or login.");
        return;
      }
      // Inline sign in
      try {
        const loggedIn = dbAuth.login(authEmail);
        if (loggedIn) {
          onLoginSuccess(loggedIn);
          currentUser = loggedIn;
          setAuthError(null);
        } else {
          setAuthError("Failed to register.");
          return;
        }
      } catch (err: any) {
        setAuthError(err.message);
        return;
      }
    }

    if (!isStepValid()) {
      alert("Please fill in all payment fields before checking out.");
      return;
    }

    const topicList = topics ? topics.split(",").map(t => t.trim()) : ["Algebraic Proofs & Trigonometry"];

    // Option 1: Actual PayFast Sandbox redirection in a new tab
    if (useRealSandbox) {
      const pendingBooking = {
        student_id: currentUser!.id,
        category: category,
        subject_id: selectedSubjectId || subjects[0].id,
        package_id: selectedPackageId || packages[0].id,
        lesson_date: selectedDate,
        lesson_time: selectedTimeSlot || "15:00",
        duration_minutes: 60,
        platform: platform,
        topics_to_cover: topicList,
        notes: notes || "No additional instructions"
      };
      localStorage.setItem("amh_pending_booking", JSON.stringify(pendingBooking));

      // Build real PayFast sandbox form and submit to new tab
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://sandbox.payfast.co.za/eng/process";
      form.target = "_blank";

      const fields = {
        merchant_id: "10000100", // Sandbox default merchant id
        merchant_key: "46f0z6363g3cu", // Sandbox default key
        return_url: `${window.location.origin}/book?payfast=success`,
        cancel_url: `${window.location.origin}/book?payfast=cancel`,
        notify_url: "https://example.com/mock-notify",
        name_first: currentUser!.first_name,
        name_last: currentUser!.surname,
        email_address: currentUser!.email,
        m_payment_id: "PF-BOOK-" + Math.floor(Math.random() * 1000000),
        amount: String(selectedPackage?.price || 300),
        item_name: `Amaris Whiteboard Class: ${selectedPackage?.name || "Single Session"}`,
        custom_str1: "Book Class Booking"
      };

      Object.entries(fields).forEach(([key, val]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = val;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      return;
    }

    // Option 2: Full Multi-Step High Fidelity PayFast Simulator (In-App)
    setIsSubmitting(true);
    setPayfastStatus("processing");
    setPayfastProgress(10);
    setPayfastMessage("Connecting to PayFast Secure Processing Gateway...");

    // Stage 1: Initiating Handshake
    setTimeout(() => {
      setPayfastProgress(30);
      setPayfastMessage("Validating merchant signatures and security tokens...");
      
      // Stage 2: Authorizing with Bank
      setTimeout(() => {
        setPayfastProgress(60);
        setPayfastMessage(
          paymentMethod === "card"
            ? "Pinging Visa/Mastercard secure vault. Requesting 3D-Secure parent OTP authentication..."
            : `Handshaking with ${selectedBank} API. Fetching secure Instant EFT login challenge...`
        );

        // Stage 3: Clearing transaction
        setTimeout(() => {
          setPayfastProgress(85);
          setPayfastMessage("Bank authorization cleared! Recording successful transaction token and generating room links...");

          // Stage 4: Writing to DB & Finished
          setTimeout(async () => {
            try {
              const selectedSub = subjects.find(s => s.id === (selectedSubjectId || subjects[0]?.id));
              const selectedPkg = packages.find(p => p.id === (selectedPackageId || packages[0]?.id));

              const booking = dbAPI.createBooking({
                student_id: currentUser!.id,
                subject_id: selectedSubjectId || subjects[0].id,
                package_id: selectedPackageId || packages[0].id,
                lesson_date: selectedDate,
                lesson_time: selectedTimeSlot || "15:00",
                duration_minutes: 60,
                platform: platform,
                topics_to_cover: topicList,
                notes: notes || "No additional instructions"
              });

              const payment = dbAPI.createPayment({
                booking_id: booking.id,
                student_id: currentUser!.id,
                amount: selectedPkg?.price || 300,
                currency: "ZAR",
                payment_method: paymentMethod === "card" ? "Credit/Debit Card (PayFast)" : `Instant EFT (${selectedBank || "Capitec/FNB"})`,
                transaction_id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
                status: "successful"
              });

              const studentProfileWithPhone: Profile = {
                ...currentUser!,
                whatsapp_number: studentPhone || currentUser!.whatsapp_number || currentUser!.phone || "+27714156665",
                phone: studentPhone || currentUser!.phone || "+27714156665",
                parent_name: parentName || currentUser!.parent_name,
                parent_phone: parentPhone || currentUser!.parent_phone
              };

              const dispatchResult = await executeAutomatedReceiptDispatch({
                booking,
                payment,
                student: studentProfileWithPhone,
                subjectName: selectedSub?.name || "NSC Mathematics",
                packageName: selectedPkg?.name || "1-on-1 Interactive Tutoring",
                lessonsCount: selectedPkg?.lessons_count || 1,
                deliveryChannel: deliveryChannel,
                parentName: parentName || currentUser?.parent_name,
                parentPhone: parentPhone || currentUser?.parent_phone
              });

              setGeneratedReceipt(dispatchResult.receipt);

              setPayfastProgress(100);
              setPayfastMessage("Payment cleared and official receipt dispatched simultaneously!");
              setPayfastStatus("success");

              setTimeout(() => {
                setBookingSuccess(booking);
                setPayfastStatus("idle");
                setIsSubmitting(false);
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

  // Check booked slots for simulated conflicts
  const isSlotBooked = (slot: string) => {
    if (!selectedDate) return false;
    let sum = 0;
    for (let i = 0; i < selectedDate.length; i++) {
      sum += selectedDate.charCodeAt(i);
    }
    const slotIdx = TIME_SLOTS.indexOf(slot);
    return (sum + slotIdx) % 4 === 0;
  };

  const stepTitle = () => {
    switch(step) {
      case 1: return "Curriculum Stream";
      case 2: return "Mathematics Subject";
      case 3: return "Lesson Package";
      case 4: return "Date & Time Slot";
      case 5: return "Platform & Details";
      case 6: return "Secure Payment Checkout";
      default: return "";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 text-left relative">
      
      {/* Background radial glows for elegance */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-royal-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gold-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER HERO AREA */}
      <div className="mb-10 text-center md:text-left space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-royal-100 dark:bg-royal-950/20 text-royal-700 dark:text-gold-400 text-xs font-bold rounded-full font-mono uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" />
          Interactive Reservation
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-display text-navy-900 dark:text-white leading-tight">
          Reserve Amaris Whiteboard Classes
        </h1>
        <p className="text-xs sm:text-sm text-navy-500 dark:text-navy-400 max-w-3xl leading-relaxed">
          Book standard or advanced South African syllabus topics. Select your package, lock down empty calendar slots, and launch premium interactive classes with high-definition digital boards.
        </p>
      </div>

      {bookingSuccess ? (
        /* SUCCESS SCREEN WITH SIMULTANEOUS MULTI-CHANNEL RECEIPT DISPATCH */
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-5"
        >
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-0.5 rounded uppercase tracking-wider border border-emerald-500/20">
                Transaction Verified & Cleared
              </span>
              {generatedReceipt && (
                <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  {generatedReceipt.receipt_number}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black font-display text-navy-900 dark:text-white">
              Class Reserved & Receipt Dispatched!
            </h2>
            <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed max-w-lg mx-auto">
              Your official Tax Invoice & lesson details have been simultaneously dispatched to you and the Amaris super administrator via your preferred channel.
            </p>
          </div>

          {/* Simultaneous Delivery Tracker */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-4 text-left space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
              <span className="flex items-center gap-1.5 font-mono">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Simultaneous Notification Status:
              </span>
              <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                {deliveryChannel.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-emerald-150 dark:border-emerald-900/30 space-y-0.5">
                <span className="text-[9px] font-mono font-bold uppercase text-slate-500 block">Student Recipient</span>
                <p className="font-bold text-slate-900 dark:text-white truncate">{user?.email || authEmail || "Student"}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                  {studentPhone || user?.phone || "+27 71 415 6665"}
                </p>
              </div>

              <div className="p-2.5 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-emerald-150 dark:border-emerald-900/30 space-y-0.5">
                <span className="text-[9px] font-mono font-bold uppercase text-slate-500 block">Super User (Bethuel)</span>
                <p className="font-bold text-slate-900 dark:text-white truncate">{SUPER_USER_CONTACT.email}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                  {SUPER_USER_CONTACT.displayPhone}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-navy-50 dark:bg-navy-950 p-5 rounded-2xl border border-navy-150 dark:border-navy-800 text-xs text-left space-y-2.5 font-mono">
            <div className="flex justify-between border-b border-navy-150 dark:border-navy-800 pb-2">
              <span className="text-navy-400">Reference ID:</span>
              <span className="font-bold text-navy-900 dark:text-white">{bookingSuccess.booking_reference}</span>
            </div>
            <div className="flex justify-between border-b border-navy-150 dark:border-navy-800 pb-2">
              <span className="text-navy-400">Date & Slot:</span>
              <span className="font-bold text-navy-900 dark:text-white">{bookingSuccess.lesson_date} @ {bookingSuccess.lesson_time}</span>
            </div>
            <div className="flex justify-between border-b border-navy-150 dark:border-navy-800 pb-2">
              <span className="text-navy-400">Virtual Room:</span>
              <a 
                href={bookingSuccess.meeting_link} 
                target="_blank" 
                rel="noreferrer" 
                className="font-bold text-royal-600 dark:text-gold-400 underline flex items-center gap-1 hover:text-royal-700"
              >
                Join Zoom Whiteboard <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="text-navy-400">Amount Paid:</span>
              <span className="font-bold text-emerald-600">R{selectedPackage?.price || 300}.00 ZAR</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 justify-center">
            {generatedReceipt && (
              <button
                type="button"
                id="bookpage-view-receipt-btn"
                onClick={() => setIsReceiptModalOpen(true)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4" /> View / Download Tax Receipt
              </button>
            )}

            {generatedReceipt && (
              <a
                id="bookpage-student-whatsapp-btn"
                href={generateWhatsAppReceiptUrl(generatedReceipt, studentPhone || SUPER_USER_CONTACT.whatsappNumber, false)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" /> Student WhatsApp
              </a>
            )}

            {generatedReceipt && (
              <a
                id="bookpage-superuser-whatsapp-btn"
                href={generateWhatsAppReceiptUrl(generatedReceipt, SUPER_USER_CONTACT.whatsappNumber, true)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" /> Super User Alert
              </a>
            )}

            <Link 
              to="/dashboard"
              className="px-5 py-2.5 bg-gradient-to-r from-royal-600 to-royal-700 hover:from-royal-700 hover:to-royal-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center"
            >
              Go to Cockpit Dashboard
            </Link>

            <button
              onClick={() => {
                setBookingSuccess(null);
                setStep(1);
                setCategory(null);
                setSelectedSubjectId(null);
                setSelectedPackageId(null);
                setSelectedTimeSlot(null);
              }}
              className="px-4 py-2.5 border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300 font-bold text-xs rounded-xl hover:bg-navy-50"
            >
              Book Another Lesson
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-12 animate-fadeIn">
          {/* TUTOR FILTER & SEARCH SYSTEM */}
          <TutorFilterSystem
            selectedTutorId={selectedTutorId}
            onSelectTutor={handleSelectTutor}
            onClearTutorSelection={() => setSelectedTutorId(null)}
            initialSyllabusFilter={category === "caps" ? "caps" : category === "ieb" ? "ieb" : "all"}
          />

          {/* REAL-TIME TUTOR AVAILABILITY WIDGET (BEFORE BOOKING REQUEST) */}
          <div id="tutor-calendar-section" className="space-y-4 pt-4 border-t border-navy-150 dark:border-navy-800">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </span>
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Live Timetable
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-navy-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                {activeSelectedTutor.fullName}'s Real-Time Availability
              </h2>
              <p className="text-xs sm:text-sm text-navy-500 dark:text-navy-400 max-w-2xl leading-relaxed">
                Browse <b>{activeSelectedTutor.fullName}</b> ({activeSelectedTutor.title})'s active timetable for private Zoom whiteboard classes. Click a <b>Vacant</b> slot to lock in that date and time before you initiate checkout.
              </p>
            </div>
            
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
                
                // Scroll smoothly to the booking assistant form
                const element = document.getElementById("booking-wizard-anchor");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
            />
          </div>

          {/* MAIN INTERACTIVE RESERVATION WIZARD SCREEN */}
          <div id="booking-wizard-anchor" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10 pt-4 border-t border-navy-150 dark:border-navy-850">
          
          {/* LEFT AREA: Step Form (8 cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Header Steps Tracker */}
            <div className="flex items-center justify-between border-b border-navy-150 dark:border-navy-800 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-navy-400 uppercase">Step {step} of 6</span>
                <h2 className="text-xl font-black font-display text-navy-900 dark:text-white">
                  {stepTitle()}
                </h2>
              </div>
              
              {/* Desktop Stepper Visuals */}
              <div className="hidden sm:flex items-center gap-1.5 bg-navy-50 dark:bg-navy-950 px-3 py-1.5 rounded-full border border-navy-150 dark:border-navy-850">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div 
                    key={idx} 
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold font-mono border transition-all ${
                      step === idx ? "bg-gold-400 border-gold-400 text-navy-950 shadow-sm" :
                      step > idx ? "bg-royal-600 border-royal-600 text-white" :
                      "border-navy-300 text-navy-400"
                    }`}
                  >
                    {idx}
                  </div>
                ))}
              </div>
            </div>

            {/* Advice to register before booking */}
            {!user && (
              <div id="register-advice" className="p-5 bg-gradient-to-r from-amber-50 to-amber-100/40 dark:from-navy-950 dark:to-navy-900/50 border border-amber-250 dark:border-navy-800 rounded-2xl space-y-3.5 shadow-sm text-left">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl mt-0.5 shrink-0">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-black text-navy-950 dark:text-white flex items-center gap-1.5">
                      Notice: We Recommend Registering Your Student Account First
                    </h4>
                    <p className="text-[11px] text-navy-600 dark:text-navy-400 leading-relaxed">
                      We highly recommend creating your student profile <strong>before</strong> scheduling classes. 
                      Registered students get access to the <strong>student cockpit dashboard</strong> to view lesson details, launch virtual whiteboards, chat with tutors, and download premium study resources.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-1 border-t border-amber-200/50 dark:border-navy-800/80 pl-0 sm:pl-10">
                  <Link
                    to="/register?redirect=book"
                    className="px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.01]"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Register Student Account First
                  </Link>
                  <Link
                    to="/login?redirect=book"
                    className="px-4 py-2 border border-navy-200 dark:border-navy-700 hover:bg-navy-50 dark:hover:bg-navy-850 text-navy-700 dark:text-navy-300 font-bold text-[11px] rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Log In to Existing Account
                  </Link>
                </div>
              </div>
            )}

            {/* Dynamic Step Panels */}
            <div className="min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4 text-xs"
                >
                  {/* STEP 1: CURRICULUM SELECTION */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed">
                        To match with the appropriate national syllabus requirements, choose your current study stream. Amaris caters to both public upgrade boards (CAPS) and private school curricula (IEB).
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setCategory("caps");
                            setSelectedSubjectId(null); // Reset subject
                          }}
                          className={`p-6 rounded-2xl border text-left transition-all relative ${
                            category === "caps" 
                              ? "bg-royal-50/60 dark:bg-royal-950/20 border-royal-500 dark:border-gold-400 ring-2 ring-royal-200 dark:ring-gold-400/20" 
                              : "border-navy-150 dark:border-navy-850 hover:bg-navy-50 dark:hover:bg-navy-850/40"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="p-2 bg-royal-100 dark:bg-navy-800 text-royal-700 dark:text-gold-400 rounded-lg">
                              <Layers className="w-5 h-5" />
                            </div>
                            {category === "caps" && (
                              <span className="bg-royal-600 dark:bg-gold-500 text-white dark:text-navy-950 rounded-full p-0.5">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-black text-navy-900 dark:text-white mt-4">Matric Upgrade CAPS</h4>
                          <p className="text-[11px] text-navy-500 dark:text-navy-400 mt-1 leading-relaxed">
                            National Senior Certificate (NSC) alignment. Best choice for candidates upgrading public school marks. Includes core trigonometry, algebra, and analytics.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCategory("ieb");
                            setSelectedSubjectId(null); // Reset subject
                          }}
                          className={`p-6 rounded-2xl border text-left transition-all relative ${
                            category === "ieb" 
                              ? "bg-royal-50/60 dark:bg-royal-950/20 border-royal-500 dark:border-gold-400 ring-2 ring-royal-200 dark:ring-gold-400/20" 
                              : "border-navy-150 dark:border-navy-850 hover:bg-navy-50 dark:hover:bg-navy-850/40"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="p-2 bg-royal-100 dark:bg-navy-800 text-royal-700 dark:text-gold-400 rounded-lg">
                              <Award className="w-5 h-5" />
                            </div>
                            {category === "ieb" && (
                              <span className="bg-royal-600 dark:bg-gold-500 text-white dark:text-navy-950 rounded-full p-0.5">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-black text-navy-900 dark:text-white mt-4">IEB Independent Board</h4>
                          <p className="text-[11px] text-navy-500 dark:text-navy-400 mt-1 leading-relaxed">
                            Private schools examination board. Includes IEB Mathematics core and advanced AP Maths enrichment. Focuses heavily on critical reasoning.
                          </p>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: SUBJECT SELECTION */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed">
                        Select your preferred mathematics focus. The Amaris database dynamically filters subjects based on your curriculum stream to ensure perfect study guidelines.
                      </p>

                      <div className="space-y-3">
                        {filteredSubjects.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => setSelectedSubjectId(s.id)}
                            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex justify-between items-center ${
                              selectedSubjectId === s.id 
                                ? "bg-royal-50/40 dark:bg-royal-950/10 border-royal-500 dark:border-gold-400 ring-1 ring-royal-200 dark:ring-gold-400/20" 
                                : "border-navy-150 dark:border-navy-850 hover:bg-navy-50 dark:hover:bg-navy-850/30"
                            }`}
                          >
                            <div className="space-y-1 flex-1 pr-6 text-left">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs sm:text-sm font-black text-navy-900 dark:text-white">{s.name}</h4>
                                <span className="text-[8px] font-mono font-bold bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300 px-2 py-0.5 rounded uppercase tracking-wider">
                                  {s.grade_level}
                                </span>
                              </div>
                              <p className="text-[11px] text-navy-500 dark:text-navy-400 leading-relaxed">{s.description}</p>
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

                  {/* STEP 3: LESSON PACKAGE SELECTION */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed">
                        Lock in an active lesson bundle. Selecting a larger hour pack decreases the effective hourly cost and unlocks premium resources (such as past exam papers & formula checklists).
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {packages.map((pkg) => {
                          const isSelected = selectedPackageId === pkg.id;
                          return (
                            <div
                              key={pkg.id}
                              onClick={() => setSelectedPackageId(pkg.id)}
                              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                                isSelected 
                                  ? "bg-royal-50/40 dark:bg-royal-950/10 border-royal-500 dark:border-gold-400 ring-2 ring-royal-200 dark:ring-gold-400/10" 
                                  : "border-navy-150 dark:border-navy-850 hover:bg-navy-50 dark:hover:bg-navy-850/30"
                              }`}
                            >
                              {pkg.discount_percentage > 0 && (
                                <span className="absolute top-3 right-3 text-[8px] font-mono font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                  Save {pkg.discount_percentage}% OFF
                                </span>
                              )}
                              
                              <div className="space-y-2 text-left">
                                <div className="space-y-0.5">
                                  <h4 className="text-sm font-black text-navy-900 dark:text-white">{pkg.name}</h4>
                                  <p className="text-[11px] text-navy-400 font-mono">{pkg.lessons_count} Hours Total</p>
                                </div>
                                <p className="text-[11px] text-navy-500 dark:text-navy-400 leading-relaxed line-clamp-2">{pkg.description}</p>
                                
                                <ul className="space-y-1.5 pt-3 border-t border-navy-100 dark:border-navy-850">
                                  {pkg.features.slice(0, 3).map((f, i) => (
                                    <li key={i} className="text-[10px] text-navy-500 dark:text-navy-400 flex items-center gap-1.5">
                                      <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                      <span className="truncate">{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="pt-4 mt-4 border-t border-navy-100 dark:border-navy-850 flex justify-between items-center">
                                <span className="text-[9px] font-mono text-navy-400 uppercase font-bold">Total price</span>
                                <span className="text-sm font-black text-royal-600 dark:text-gold-400 font-mono">R{pkg.price} ZAR</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STEP 4: DATE & TIME SELECTOR */}
                  {step === 4 && (
                    <div className="space-y-4">
                      <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed">
                        Lock in your preferred date and choose an available whiteboard tutoring session in the visual scheduler below.
                      </p>

                      <TutorCalendar
                        selectedDate={selectedDate}
                        selectedSlot={selectedTimeSlot}
                        onSelectSlot={(date, slot) => {
                          setSelectedDate(date);
                          setSelectedTimeSlot(slot);
                        }}
                      />
                    </div>
                  )}

                  {/* STEP 5: NOTES & PREFERENCES */}
                  {step === 5 && (
                    <div className="space-y-4">
                      <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed">
                        All 1-on-1 private tutoring classes are conducted exclusively via <b>Zoom Live Whiteboard</b>. Enter any specific mathematical formulas, calculus proof guidelines, or trigonometry questions you wish to cover.
                      </p>

                      <div className="space-y-4 text-left">
                        {/* Platform Display */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-mono font-black text-navy-500 uppercase">
                            Virtual Room Platform (Zoom Only)
                          </label>
                          <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
                                <Video className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-sm font-extrabold text-navy-900 dark:text-white flex items-center gap-1.5">
                                  Zoom Live Whiteboard Class
                                  <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded bg-blue-500 text-white uppercase">
                                    Exclusive
                                  </span>
                                </h4>
                                <p className="text-[11px] text-navy-500 dark:text-navy-400 mt-0.5">
                                  Live vector digital board, stylus annotations, real-time formula solving, and recording.
                                </p>
                              </div>
                            </div>
                            <div className="text-right hidden sm:block">
                              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">
                                HD Audio/Video Active
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Topics Input */}
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono font-black text-navy-500 uppercase">
                            Chapters / Key Areas of Study (Comma-separated)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Sinking Funds, Calculus Limits, Optimization, R-Formula proofs"
                            value={topics}
                            onChange={(e) => setTopics(e.target.value)}
                            className="w-full px-3 py-2.5 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 text-xs shadow-sm"
                          />
                        </div>

                        {/* Instructions input */}
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono font-black text-navy-500 uppercase">
                            Instructions for Head Instructor Bethuel
                          </label>
                          <textarea
                            rows={3}
                            placeholder="e.g. I am upgrading my NSC maths. I struggle with calculus limits first principles using f(x+h). Let's go slow on algebraic factorizations..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3 py-2.5 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 text-xs shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 6: PAYMENT & CONFIRMATION (WITH INLINE AUTHENTICATION CHECK) */}
                  {step === 6 && (
                    <div className="space-y-5 text-left">
                      
                      {/* Check if student is signed in */}
                      {!user ? (
                        <div className="bg-navy-50 dark:bg-navy-950 p-5 rounded-2xl border border-navy-200 dark:border-navy-800 space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-royal-100 dark:bg-royal-950 text-royal-700 dark:text-gold-400 rounded-xl">
                              <User className="w-5 h-5 animate-pulse" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-sm font-black text-navy-900 dark:text-white">Quick Account Activation Required</h4>
                              <p className="text-[11px] text-navy-500 dark:text-navy-400 leading-relaxed">
                                Enter your email address to register or log in instantly. This ensures your booked lessons are securely synced with your personal student cockpit.
                              </p>
                            </div>
                          </div>

                          {authError && (
                            <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-mono rounded flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>{authError}</span>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                            <div className="sm:col-span-8">
                              <label className="block text-[9px] font-mono font-bold text-navy-400 uppercase mb-1">
                                YOUR EMAIL ADDRESS
                              </label>
                              <input
                                type="email"
                                placeholder="e.g. yourname@gmail.com"
                                value={authEmail}
                                onChange={(e) => setAuthEmail(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-900 dark:text-white focus:outline-none text-xs"
                              />
                            </div>
                            <div className="sm:col-span-4">
                              <button
                                type="button"
                                onClick={() => handleAuthSubmit(authEmail)}
                                className="w-full py-2 bg-royal-600 hover:bg-royal-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <LogIn className="w-3.5 h-3.5" />
                                Activate
                              </button>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-navy-200 dark:border-navy-800 space-y-2">
                            <span className="text-[10px] font-mono text-navy-400 font-bold block uppercase">Or Try Instant Speed Evaluation Login:</span>
                            <button
                              type="button"
                              onClick={handleDemoSignIn}
                              className="w-full py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-black rounded-xl text-[11px] flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] shadow cursor-pointer"
                            >
                              <Sparkles className="w-4 h-4 animate-pulse" />
                              One-Click Test Login (Bethuel Thipe)
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            <span>Logged in as <b>{user.first_name} {user.surname}</b> ({user.email})</span>
                          </div>

                          {/* Payment Form Segment */}
                          <div className="space-y-4">
                            {/* Payment method toggle */}
                            <div className="grid grid-cols-3 gap-1 bg-navy-100 dark:bg-navy-950 p-1 rounded-xl border border-navy-150 dark:border-navy-850">
                              <button
                                type="button"
                                onClick={() => setPaymentMethod("googlepay")}
                                className={`py-2 text-center rounded-lg font-bold text-[10px] uppercase transition-all flex items-center justify-center gap-1.5 ${
                                  paymentMethod === "googlepay" 
                                    ? "bg-black text-white shadow-sm ring-1 ring-amber-500/50" 
                                    : "text-navy-500 hover:text-navy-700"
                                }`}
                              >
                                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.39 7.37 24 12 24z"/>
                                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.61 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                                </svg>
                                <span>Google Pay</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setPaymentMethod("card")}
                                className={`py-2 text-center rounded-lg font-bold text-[10px] uppercase transition-all ${
                                  paymentMethod === "card" 
                                    ? "bg-white dark:bg-navy-900 text-navy-900 dark:text-white shadow-sm" 
                                    : "text-navy-500 hover:text-navy-700"
                                }`}
                              >
                                Credit Card
                              </button>

                              <button
                                type="button"
                                onClick={() => setPaymentMethod("eft")}
                                className={`py-2 text-center rounded-lg font-bold text-[10px] uppercase transition-all ${
                                  paymentMethod === "eft" 
                                    ? "bg-white dark:bg-navy-900 text-navy-900 dark:text-white shadow-sm" 
                                    : "text-navy-500 hover:text-navy-700"
                                }`}
                              >
                                Instant EFT
                              </button>
                            </div>

                            {paymentMethod === "googlepay" ? (
                              <div className="p-5 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black rounded-2xl text-white space-y-4 border border-zinc-800 shadow-xl">
                                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                                  <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                    <div>
                                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                        Google Pay API
                                        <span className="text-[9px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                                          Verified Merchant
                                        </span>
                                      </h4>
                                      <p className="text-[10px] font-mono text-zinc-400">Merchant ID: BCR2DN7TRHFIFPYC</p>
                                    </div>
                                  </div>
                                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                    Encrypted
                                  </span>
                                </div>

                                <div className="space-y-1.5 font-mono text-[11px] text-zinc-300 bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                                  <div className="flex justify-between">
                                    <span className="text-zinc-500">Item:</span>
                                    <span className="font-bold text-white truncate max-w-[200px]">{selectedPackage?.name || "Tutoring Session"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-zinc-500">Amount Due:</span>
                                    <span className="font-bold text-amber-400">R{selectedPackage?.price || 0}.00 ZAR</span>
                                  </div>
                                </div>

                                <p className="text-[10px] text-zinc-400 leading-relaxed">
                                  Click below to securely authenticate with your Google account saved cards or biometrics. Transaction cleared instantly for <b>Amaris Learning Hub</b>.
                                </p>

                                <GooglePayButton
                                  amount={selectedPackage?.price || 300}
                                  itemTitle={`Amaris Tutoring: ${selectedPackage?.name || "Single Session"}`}
                                  merchantId="BCR2DN7TRHFIFPYC"
                                  merchantName="Amaris Learning Hub"
                                  buttonText="Authorize Booking with Google Pay"
                                  size="lg"
                                  className="w-full"
                                  onSuccess={(details) => handleGooglePayBookingSuccess(details)}
                                />
                              </div>
                            ) : paymentMethod === "card" ? (
                              <div className="space-y-3">
                                <div className="space-y-0.5">
                                  <label className="text-[9px] font-mono font-bold text-navy-500 uppercase">Cardholder Name</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. B Thipe"
                                    value={cardName}
                                    onChange={(e) => setCardName(e.target.value)}
                                    className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
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
                                      className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 font-mono"
                                    />
                                    <CreditCard className="w-4 h-4 text-navy-400 absolute right-3 top-2.5" />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-0.5">
                                    <label className="text-[9px] font-mono font-bold text-navy-500 uppercase">Expiry Date</label>
                                    <input
                                      type="text"
                                      placeholder="MM/YY"
                                      maxLength={5}
                                      value={cardExpiry}
                                      onChange={(e) => setCardExpiry(formatCardExpiry(e.target.value))}
                                      className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 font-mono text-center"
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
                                      className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-royal-500 font-mono text-center"
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <label className="block text-[9px] font-mono font-bold text-navy-500 uppercase">
                                  Select South African Bank Partner
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {["First National Bank (FNB)", "Capitec Bank", "Standard Bank", "Nedbank", "ABSA Bank", "TymeBank"].map((bank) => (
                                    <button
                                      type="button"
                                      key={bank}
                                      onClick={() => setSelectedBank(bank)}
                                      className={`p-3 rounded-xl border text-center text-[10px] font-bold transition-all flex items-center gap-1.5 justify-center ${
                                        selectedBank === bank 
                                          ? "bg-royal-50 dark:bg-royal-950/20 border-royal-500 dark:border-gold-400 text-royal-700 dark:text-gold-400" 
                                          : "bg-white dark:bg-navy-900 border-navy-150 dark:border-navy-850 text-navy-700 dark:text-navy-300 hover:bg-navy-50"
                                      }`}
                                    >
                                      <Building className="w-3.5 h-3.5 text-royal-500 flex-shrink-0" />
                                      <span className="truncate">{bank.split(" (")[0]}</span>
                                    </button>
                                  ))}
                                </div>
                                {selectedBank && (
                                  <p className="text-[10px] font-mono text-amber-600 bg-amber-500/10 p-3 rounded-xl leading-relaxed">
                                    *EFT guidelines: Authorization requested via secure PayFast SA API. You will sign in via your <b>{selectedBank}</b> banking client to safely approve the payment.
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* PayFast Sandbox Mode Choice */}
                          <div className="mt-4 pt-4 border-t border-dashed border-navy-150 dark:border-navy-800 space-y-2">
                            <label className="block text-[9px] font-mono font-bold text-[#E21C26] dark:text-red-400 uppercase">
                              PAYFAST GATEWAY ENVIRONMENT
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setUseRealSandbox(false)}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                  !useRealSandbox
                                    ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-400"
                                    : "bg-white dark:bg-navy-900 border-navy-150 dark:border-navy-850 text-navy-500 hover:bg-navy-50"
                                }`}
                              >
                                <div className="text-[11px] font-bold flex items-center gap-1.5">
                                  <div className={`w-1.5 h-1.5 rounded-full ${!useRealSandbox ? "bg-emerald-500 animate-pulse" : "bg-navy-300"}`} />
                                  Secure In-App Simulator
                                </div>
                                <div className="text-[9px] font-mono mt-0.5 opacity-80 leading-tight">Ideal for standard iframe and rapid evaluation</div>
                              </button>

                              <button
                                type="button"
                                onClick={() => setUseRealSandbox(true)}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                  useRealSandbox
                                    ? "bg-red-500/5 dark:bg-red-500/10 border-red-500 text-red-800 dark:text-red-400"
                                    : "bg-white dark:bg-navy-900 border-navy-150 dark:border-navy-850 text-navy-500 hover:bg-navy-50"
                                }`}
                              >
                                <div className="text-[11px] font-bold flex items-center gap-1.5">
                                  <div className={`w-1.5 h-1.5 rounded-full ${useRealSandbox ? "bg-red-500 animate-pulse" : "bg-navy-300"}`} />
                                  Real Sandbox Checkout ↗
                                </div>
                                <div className="text-[9px] font-mono mt-0.5 opacity-80 leading-tight">Redirects to official payfast.co.za in new window</div>
                              </button>
                            </div>
                          </div>

                        </div>
                      )}

                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Stepper Footer Action Bar */}
            <div className="border-t border-navy-150 dark:border-navy-800 pt-5 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono text-navy-400">
                  Step {step} of 6
                </span>
                {!isStepValid() && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {step === 1 && "Select a curriculum stream"}
                    {step === 2 && "Select a subject focus"}
                    {step === 3 && "Select a lesson package"}
                    {step === 4 && "Select a date & vacant slot"}
                    {step === 5 && "Select platform preference"}
                    {step === 6 && (!user ? "Enter your email to activate account" : "Complete payment details")}
                  </span>
                )}
              </div>
              
              <div className="flex gap-2 justify-end w-full sm:w-auto">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-navy-50 transition-colors"
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
                    className={`px-5 py-2 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all ${
                      isStepValid() 
                        ? "bg-royal-600 hover:bg-royal-700 cursor-pointer" 
                        : "bg-navy-200 dark:bg-navy-800 text-navy-400 dark:text-navy-600 cursor-not-allowed"
                    }`}
                  >
                    Continue Step
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!isStepValid() || isSubmitting}
                    onClick={handleCheckoutSubmit}
                    className={`px-6 py-2.5 text-navy-950 text-xs font-black rounded-xl flex items-center gap-1.5 transition-all bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 shadow ${
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
                        Authorizing EFT Payment...
                      </>
                    ) : (
                      <>
                        Secure Booking Check out (R{selectedPackage?.price || 0})
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT AREA: Tactile summary receipt card (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-black font-mono text-navy-900 dark:text-white uppercase tracking-wider pb-2 border-b border-navy-150 dark:border-navy-800">
              Live Lesson Receipt Preview
            </h3>

            {/* Dynamic Items list */}
            <div className="space-y-4 text-xs font-mono">
              
              {/* Assigned Tutor Item */}
              <div className="p-3 bg-navy-50 dark:bg-navy-950 rounded-2xl border border-navy-150 dark:border-navy-850 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={activeSelectedTutor.avatar}
                    alt={activeSelectedTutor.fullName}
                    className="w-9 h-9 rounded-xl object-cover border border-royal-500/50"
                  />
                  <div className="text-left">
                    <span className="text-[9px] text-navy-400 uppercase font-bold block">Assigned Tutor</span>
                    <span className="text-navy-900 dark:text-white font-extrabold text-xs block">
                      {activeSelectedTutor.fullName}
                    </span>
                    <span className="text-[9px] text-royal-600 dark:text-gold-400 font-medium">
                      {activeSelectedTutor.syllabusFocus.join(" & ")} Coach
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("tutor-filter-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-[9px] font-bold text-royal-600 dark:text-gold-400 underline hover:opacity-80"
                >
                  Change
                </button>
              </div>

              {/* Stream item */}
              <div className="flex justify-between items-start gap-4">
                <span className="text-navy-400 text-[10px] uppercase font-bold">Curriculum:</span>
                <span className="text-right text-navy-900 dark:text-white font-extrabold text-[11px]">
                  {category === "caps" ? "Matric Upgrade CAPS" : category === "ieb" ? "IEB Independent" : "Not Selected"}
                </span>
              </div>

              {/* Subject item */}
              <div className="flex justify-between items-start gap-4 border-t border-navy-100 dark:border-navy-850 pt-2.5">
                <span className="text-navy-400 text-[10px] uppercase font-bold">Mathematics:</span>
                <span className="text-right text-navy-900 dark:text-white font-extrabold text-[11px] truncate max-w-[160px]">
                  {selectedSubject ? selectedSubject.name : "Not Selected"}
                </span>
              </div>

              {/* Package item */}
              <div className="flex justify-between items-start gap-4 border-t border-navy-100 dark:border-navy-850 pt-2.5">
                <span className="text-navy-400 text-[10px] uppercase font-bold">Bundle Pack:</span>
                <span className="text-right text-navy-900 dark:text-white font-extrabold text-[11px]">
                  {selectedPackage ? `${selectedPackage.name} (${selectedPackage.lessons_count} hrs)` : "Not Selected"}
                </span>
              </div>

              {/* Date / Time item */}
              <div className="flex justify-between items-start gap-4 border-t border-navy-100 dark:border-navy-850 pt-2.5">
                <span className="text-navy-400 text-[10px] uppercase font-bold">Slot Time:</span>
                <div className="text-right text-[11px]">
                  <span className="text-navy-900 dark:text-white font-extrabold block">
                    {selectedDate || "Not Set"}
                  </span>
                  {selectedTimeSlot && (
                    <span className="text-royal-600 dark:text-gold-400 font-bold block mt-0.5">
                      {selectedTimeSlot}
                    </span>
                  )}
                </div>
              </div>

              {/* Classroom Platform */}
              <div className="flex justify-between items-start gap-4 border-t border-navy-100 dark:border-navy-850 pt-2.5">
                <span className="text-navy-400 text-[10px] uppercase font-bold">Classroom:</span>
                <span className="text-right text-navy-900 dark:text-white font-extrabold text-[11px]">
                  {platform} Room
                </span>
              </div>

              {/* TOTAL DUE BOX */}
              <div className="bg-navy-50 dark:bg-navy-950 p-4 rounded-xl border border-navy-150 dark:border-navy-850 space-y-1.5 text-center mt-4">
                <span className="text-[9px] text-navy-400 uppercase font-black tracking-wider block">TOTAL INVESTMENT</span>
                <span className="text-2xl font-black text-royal-600 dark:text-gold-400 font-mono block">
                  R{selectedPackage ? selectedPackage.price : "0"}.00 ZAR
                </span>
                <p className="text-[9px] text-navy-400 leading-tight">Includes all study guides, video downloads, and digital blackboard notes.</p>
              </div>

              {/* Secure Transaction badge */}
              <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-navy-400 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>PayFast South Africa Secured</span>
              </div>

            </div>

          </div>

        </div>
        </div>
      )}

      {/* HIGH FIDELITY SECURE PAYFAST SIMULATOR OVERLAY */}
      {payfastStatus !== "idle" && (
        <div className="fixed inset-0 z-50 bg-navy-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-red-100 flex flex-col text-left text-navy-900"
          >
            {/* PayFast Official Colors Header */}
            <div className="bg-[#E21C26] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight">pay<span className="text-white/80 font-normal">fast</span></span>
                <span className="text-[9px] font-mono bg-white/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Secure Gateway</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono bg-black/20 px-2.5 py-1 rounded-full text-white/90">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SSL Encrypted</span>
              </div>
            </div>

            {/* Merchant and billing details bar */}
            <div className="bg-navy-50 p-4 border-b border-navy-100 flex justify-between items-center text-xs text-navy-700">
              <div>
                <p className="font-bold text-[10px] text-navy-400 uppercase tracking-wide">MERCHANT</p>
                <p className="font-extrabold text-navy-900">Amaris Learning Hub (Pty) Ltd</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[10px] text-navy-400 uppercase tracking-wide">AMOUNT DUE</p>
                <p className="font-black text-sm text-[#E21C26]">R{selectedPackage?.price || 300}.00 ZAR</p>
              </div>
            </div>

            {/* Simulated steps */}
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-6">
              {payfastStatus === "processing" && (
                <>
                  {/* Pulsing secure bank shield or loader */}
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-16 h-16 bg-red-600/10 rounded-full animate-ping" />
                    <div className="w-12 h-12 bg-[#E21C26] text-white rounded-full flex items-center justify-center shadow-lg relative">
                      <CreditCard className="w-6 h-6 animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-extrabold text-navy-900">Processing Secure Transaction</h4>
                    <p className="text-xs text-navy-500 max-w-xs leading-relaxed">{payfastMessage}</p>
                  </div>

                  {/* Custom progress bar */}
                  <div className="w-full bg-navy-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#E21C26] h-full transition-all duration-300 rounded-full" 
                      style={{ width: `${payfastProgress}%` }}
                    />
                  </div>
                  
                  <span className="text-[10px] font-mono text-navy-400 font-bold uppercase tracking-wider animate-pulse">
                    Do not close or reload this window...
                  </span>
                </>
              )}

              {payfastStatus === "success" && (
                <>
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-navy-900">Transaction Authorized!</h4>
                    <p className="text-xs text-emerald-600 font-mono font-bold">Ref: PF-TX-{Math.floor(Math.random() * 10000000)}</p>
                    <p className="text-xs text-navy-500 pt-2">Returning you to Amaris Learning Hub...</p>
                  </div>
                </>
              )}

              {payfastStatus === "error" && (
                <>
                  <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg">
                    <AlertCircle className="w-6 h-6" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-extrabold text-navy-950">Payment Verification Failed</h4>
                    <p className="text-xs text-red-600 font-mono font-bold">{payfastMessage}</p>
                    <p className="text-xs text-navy-500">Please review card details or try standard simulation.</p>
                  </div>
                </>
              )}
            </div>

            {/* Footer lock badge */}
            <div className="bg-navy-50 p-4 border-t border-navy-100 flex items-center justify-center gap-2 text-[10px] text-navy-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Verified Secure 256-Bit SSL Connection</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Official Tax Invoice & PDF Receipt Interactive Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receipt={generatedReceipt}
      />

    </div>
  );
};
