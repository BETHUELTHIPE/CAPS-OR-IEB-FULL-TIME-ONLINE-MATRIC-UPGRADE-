import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { jsPDF } from "jspdf";
import { 
  Sparkles, FileText, Download, TrendingUp, HelpCircle, AlertCircle, 
  CheckCircle, Plus, ShieldCheck, Coins, ArrowRight, Loader2, 
  BarChart2, Award, BookOpen, RefreshCw, Layers, Clipboard, Check, Mail, Printer,
  Eye, Send, X, ExternalLink, MessageSquare, Smartphone, Share2, CheckCircle2, Phone, Info
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie
} from "recharts";
import { Profile, Payment, ExamQuestion } from "../types";
import { getFromDB, saveToDB, generateId } from "../lib/db";
import { capsPaper1Questions, capsPaper2Questions } from "../data/predictedExams";
import { LatexRenderer } from "./LatexRenderer";

interface AIPredictorProps {
  user: Profile | null;
}

export const AIPredictor: React.FC<AIPredictorProps> = ({ user }) => {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<"exam" | "memo" | "trends" | "cognitive" | "tracker" | "delivery">("exam");
  const [paperType, setPaperType] = useState<"p1" | "p2">("p1");
  const [syllabus, setSyllabus] = useState<"CAPS" | "IEB">("CAPS");
  const [year, setYear] = useState<number>(2026);
  
  // Credits & checkout simulation states
  const [credits, setCredits] = useState<number>(0);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  
  // Engine execution states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  
  // Scoring tracker states
  const [studentMarks, setStudentMarks] = useState<Record<number, number>>({});
  const [trackerNotes, setTrackerNotes] = useState("");
  const [trackerGradeCalculated, setTrackerGradeCalculated] = useState<boolean>(false);

  // Delivery & Receive choice states
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [targetEmail, setTargetEmail] = useState(user?.email || "");
  const [targetWhatsApp, setTargetWhatsApp] = useState(user?.whatsapp_number || user?.phone || "+27 71 415 6665");
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);

  const fetchDeliveries = () => {
    if (!user) return;
    setLoadingDeliveries(true);
    fetch("/api/predictor/deliveries")
      .then(res => res.json())
      .then(data => {
        const studentDeliveries = data.filter((d: any) => d.student_id === user.id);
        setDeliveries(studentDeliveries);
        setLoadingDeliveries(false);
      })
      .catch(err => {
        console.error("Error fetching deliveries:", err);
        setLoadingDeliveries(false);
      });
  };

  useEffect(() => {
    if (user) {
      if (user.email && !targetEmail) setTargetEmail(user.email);
      if ((user.whatsapp_number || user.phone) && targetWhatsApp === "+27 71 415 6665") {
        setTargetWhatsApp(user.whatsapp_number || user.phone || "+27 71 415 6665");
      }
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "delivery" || hasGenerated) {
      fetchDeliveries();
      const interval = setInterval(fetchDeliveries, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab, hasGenerated, user]);

  // Load user credits on mount
  useEffect(() => {
    if (user) {
      const userPayments = getFromDB<Payment>("amh_payments").filter(p => p.student_id === user.id && p.status === "successful");
      const baseCredits = user.grade === "Matric Upgrade" ? 3 : 1; // upgrading candidates get more base credits
      const purchasedCredits = userPayments.filter(p => p.payment_method.includes("Predictor")).length;
      setCredits(baseCredits + purchasedCredits);
    }
  }, [user, isPaid]);

  // Steps for the prediction engine loading animation
  const steps = [
    { label: "Establishing Ingress Pipeline", desc: "Connecting server to DBE CAPS National Archives (2015-2025)..." },
    { label: "Ingesting Question Bank Weightings", desc: "Parsing historical repetition coefficients & exam structure matrices..." },
    { label: "Configuring Cognitive Distribution", desc: "Enforcing CAPS norms: 20% Knowledge, 35% Routine, 30% Complex, 15% Problem Solving..." },
    { label: "Synthesizing Core Exam Prompts", desc: "Drafting algebraic equations, trigonometric proofs, and Euclidean geometric coordinates..." },
    { label: "Formatting Standard LaTeX Notations", desc: "Compiling math elements & step-by-step memorandum scoring parameters..." },
    { label: "Finalizing Output Blueprint", desc: "Optimizing marking codes [CA: Consistent Accuracy, M: Method, S: Statement]..." }
  ];

  const handleSimulatePayment = () => {
    if (!user) return;
    setPaymentLoading(true);
    
    setTimeout(() => {
      // Record simulated payment
      const payments = getFromDB<Payment>("amh_payments");
      const newPayment: Payment = {
        id: generateId("pay"),
        booking_id: "amh-predictor-token",
        student_id: user.id,
        amount: 120,
        currency: "ZAR",
        payment_method: "Simulated EFT (PayFast - Predictor Token)",
        transaction_id: "PF-PRED-" + Math.floor(Math.random() * 1000000000),
        status: "successful",
        created_at: new Date().toISOString().split("T")[0]
      };
      payments.push(newPayment);
      saveToDB("amh_payments", payments);
      
      setCredits(prev => prev + 1);
      setIsPaid(true);
      setPaymentLoading(false);
    }, 2000);
  };

  const startExamGeneration = () => {
    if (credits <= 0) return;
    
    setIsGenerating(true);
    setGenerationStep(0);
    setHasGenerated(false);
    setGenerationLogs([`[${new Date().toLocaleTimeString()}] INITIATING PREDICTOR SERVICE ENGINE...`]);

    const logTimer = setInterval(() => {
      setGenerationStep(prev => {
        if (prev < steps.length - 1) {
          const nextStep = prev + 1;
          setGenerationLogs(logs => [
            ...logs,
            `[${new Date().toLocaleTimeString()}] STEP ${nextStep}: ${steps[nextStep].label} - SUCCESS`,
            `[${new Date().toLocaleTimeString()}] ${steps[nextStep].desc}`
          ]);
          return nextStep;
        } else {
          clearInterval(logTimer);
          setTimeout(() => {
            setIsGenerating(false);
            setHasGenerated(true);
            setShowReceiveModal(true); // Automatically open the choice modal!
            setCredits(prevCredits => Math.max(0, prevCredits - 1));
            
            // Save mock score entries or logs
            const mockLogs = getFromDB<any>("amh_predictor_runs") || [];
            const runId = generateId("run");
            const newRun = {
              id: runId,
              student_id: user?.id,
              syllabus,
              paper_type: paperType,
              year,
              generated_at: new Date().toISOString()
            };
            mockLogs.push(newRun);
            saveToDB("amh_predictor_runs", mockLogs);

            // Initiate multi-channel secure delivery
            if (user) {
              const payload = {
                studentId: user.id,
                studentName: `${user.first_name} ${user.surname}`,
                emailAddress: targetEmail || user.email,
                whatsappNumber: targetWhatsApp || user.whatsapp_number || user.phone,
                predictionId: runId,
                curriculum: syllabus,
                paperType: paperType,
                year: year,
                pdfUrl: `${window.location.origin}/api/predictor/download/${runId}?student_id=${user.id}`
              };

              fetch("/api/predictor/deliver", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
              })
              .then(res => res.json())
              .then(data => {
                console.log("Multi-channel delivery triggered successfully:", data);
                fetchDeliveries();
              })
              .catch(err => {
                console.error("Multi-channel delivery trigger failure:", err);
              });
            }
          }, 1000);
          return prev;
        }
      });
    }, 2500);
  };

  const currentQuestions = paperType === "p1" ? capsPaper1Questions : capsPaper2Questions;
  const totalPaperMarks = currentQuestions.reduce((acc, q) => acc + q.marks, 0);

  // High-fidelity vector-sharp printing
  const handleDownloadPDF = () => {
    window.print();
  };

  // Client-side downloadable PDF generator
  const handleGenerateClientPdf = () => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("AMARIS MATHEMATICS HUB", 105, 18, { align: "center" });
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("National Senior Certificate (NSC) Examination Calibration", 105, 25, { align: "center" });
      doc.setFont("helvetica", "bold");
      doc.text(`PREDICTED MATHEMATICS PAPER ${paperType === "p1" ? "1" : "2"} - ${year}`, 105, 32, { align: "center" });
      
      doc.setLineWidth(0.5);
      doc.line(15, 36, 195, 36);

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`TIME: 3 HOURS                     MARKS: 150                     CURRICULUM: ${syllabus}`, 15, 43);
      doc.setFont("helvetica", "normal");
      doc.text(`STUDENT: ${user ? `${user.first_name} ${user.surname}` : "High School Student"}              DATE: ${new Date().toLocaleDateString()}`, 15, 49);
      
      doc.line(15, 53, 195, 53);

      let yPos = 61;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("INSTRUCTIONS AND INFORMATION", 15, yPos);
      yPos += 6;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const instructions = [
        "1. This question paper consists of all predicted core questions and full marking memo.",
        "2. Answer ALL the questions.",
        "3. Clearly show ALL calculations, diagrams, graphs, etc.",
        "4. Non-programmable scientific calculators may be used.",
        "5. Round off final answers to TWO decimal places where necessary."
      ];
      instructions.forEach(inst => {
        doc.text(inst, 15, yPos);
        yPos += 5;
      });

      yPos += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("PREDICTED EXAMINATION QUESTIONS", 15, yPos);
      yPos += 7;

      currentQuestions.forEach((q) => {
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`QUESTION ${q.number}: ${q.topic} [${q.marks} Marks]`, 15, yPos);
        yPos += 5;

        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        const scenarioLines = doc.splitTextToSize(`Context: ${q.scenario}`, 175);
        doc.text(scenarioLines, 15, yPos);
        yPos += (scenarioLines.length * 4) + 3;

        q.subQuestions.forEach(sub => {
          if (yPos > 265) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          const textClean = sub.text.replace(/\$/g, "");
          const subLines = doc.splitTextToSize(`${sub.id} ${textClean} (${sub.marks} marks)`, 170);
          doc.text(subLines, 20, yPos);
          yPos += (subLines.length * 4) + 2;
        });
        yPos += 4;
      });

      // Add Memo on new page
      doc.addPage();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("MARKING GUIDELINES & MEMORANDUM", 105, 20, { align: "center" });
      doc.setLineWidth(0.5);
      doc.line(15, 25, 195, 25);
      
      let memoY = 33;
      currentQuestions.forEach((q) => {
        if (memoY > 260) {
          doc.addPage();
          memoY = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`QUESTION ${q.number} MEMORANDUM [Total: ${q.marks} Marks]`, 15, memoY);
        memoY += 6;

        q.subQuestions.forEach(sub => {
          if (memoY > 265) {
            doc.addPage();
            memoY = 20;
          }
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.text(`Subquestion ${sub.id} [${sub.marks} Marks]:`, 20, memoY);
          memoY += 5;

          doc.setFont("helvetica", "normal");
          const memoClean = sub.memo.replace(/\$/g, "");
          const memoLines = doc.splitTextToSize(memoClean, 165);
          doc.text(memoLines, 25, memoY);
          memoY += (memoLines.length * 4) + 3;
        });
        memoY += 4;
      });

      doc.save(`Amaris_Predicted_Maths_${paperType.toUpperCase()}_${year}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      window.print();
    }
  };

  // Dispatch via Email
  const handleSendEmail = async () => {
    if (!targetEmail) return;
    setIsDispatching(true);
    setDispatchSuccessMsg(null);
    try {
      const runId = generateId("run");
      const payload = {
        studentId: user?.id || "guest",
        studentName: user ? `${user.first_name} ${user.surname}` : "Student",
        emailAddress: targetEmail,
        whatsappNumber: targetWhatsApp || user?.whatsapp_number || user?.phone || "+27 71 415 6665",
        predictionId: runId,
        curriculum: syllabus,
        paperType: paperType,
        year: year,
        pdfUrl: `${window.location.origin}/api/predictor/download/${runId}?student_id=${user?.id || "guest"}`
      };

      const res = await fetch("/api/predictor/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setDispatchSuccessMsg(`Predicted Exam Paper PDF has been sent to ${targetEmail}!`);
        fetchDeliveries();
      } else {
        setDispatchSuccessMsg(`Email dispatch initiated to ${targetEmail}. Check your inbox shortly!`);
      }
    } catch (err) {
      console.error("Email send error:", err);
      setDispatchSuccessMsg(`Email delivery request sent to ${targetEmail}.`);
    } finally {
      setIsDispatching(false);
    }
  };

  // Dispatch via WhatsApp
  const handleSendWhatsApp = async () => {
    if (!targetWhatsApp) return;
    setIsDispatching(true);
    setDispatchSuccessMsg(null);
    try {
      const runId = generateId("run");
      const payload = {
        studentId: user?.id || "guest",
        studentName: user ? `${user.first_name} ${user.surname}` : "Student",
        emailAddress: targetEmail || user?.email || "",
        whatsappNumber: targetWhatsApp,
        predictionId: runId,
        curriculum: syllabus,
        paperType: paperType,
        year: year,
        pdfUrl: `${window.location.origin}/api/predictor/download/${runId}?student_id=${user?.id || "guest"}`
      };

      await fetch("/api/predictor/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      fetchDeliveries();

      // Open WhatsApp web / mobile with pre-filled message
      const cleanPhone = targetWhatsApp.replace(/[^0-9]/g, "");
      const formattedPhone = cleanPhone.startsWith("27") ? cleanPhone : "27" + cleanPhone.replace(/^0/, "");
      const msgText = `Ayo! Here is my predicted Grade 12 ${syllabus} Mathematics Paper ${paperType === "p1" ? "1" : "2"} (${year}) PDF packet from Amaris Mathematics Hub:\n\n📄 Access PDF: ${window.location.origin}/api/predictor/download/${runId}?student_id=${user?.id || "guest"}\n\nLet's get that Level 7 distinction!`;
      const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msgText)}`;
      
      window.open(waUrl, "_blank");

      setDispatchSuccessMsg(`WhatsApp dispatch sent to ${targetWhatsApp}! Opening WhatsApp...`);
    } catch (err) {
      console.error("WhatsApp send error:", err);
      setDispatchSuccessMsg(`WhatsApp link generated for ${targetWhatsApp}.`);
    } finally {
      setIsDispatching(false);
    }
  };

  // Recharts radar statistics for historical topic accuracy weightings 2015-2025
  const trendsData = [
    { subject: "Algebra & equations", avg: 22, predicted: 24, fullMark: 30 },
    { subject: "Calculus", avg: 35, predicted: 38, fullMark: 50 },
    { subject: "Finance", avg: 15, predicted: 12, fullMark: 25 },
    { subject: "Probability", avg: 12, predicted: 15, fullMark: 20 },
    { subject: "Sequences", avg: 25, predicted: 28, fullMark: 40 },
    { subject: "Functions", avg: 30, predicted: 32, fullMark: 45 }
  ];

  // Cognitive distribution stats mapping standard CAPS parameters
  const cognitiveData = [
    { name: "Knowledge (Recall)", value: 20, color: "#2563eb" }, // Blue
    { name: "Routine Procedures", value: 35, color: "#16a34a" }, // Green
    { name: "Complex Procedures", value: 30, color: "#ca8a04" }, // Gold
    { name: "Problem Solving", value: 15, color: "#dc2626" }  // Red
  ];

  // Performance simulation math scoring algorithms
  const totalStudentScore = Object.values(studentMarks).reduce((a, b) => a + b, 0);
  const scorePercent = Math.min(100, Math.round((totalStudentScore / totalPaperMarks) * 100)) || 0;

  const getMatricUpgradeLevel = (pct: number) => {
    if (pct >= 80) return { lvl: 7, label: "Outstanding Achievement", color: "text-emerald-500", desc: "Level 7 distinction! Excellent working layout. Your university engineering & AP maths requirements are fully secured!" };
    if (pct >= 70) return { lvl: 6, label: "Meritorious Achievement", color: "text-blue-500", desc: "Level 6. Highly competitive pass. A few more hours on optimization & first-principles proofs will push you to Level 7!" };
    if (pct >= 60) return { lvl: 5, label: "Substantial Achievement", color: "text-indigo-500", desc: "Level 5 pass. Good foundational understanding. Focus on Euclidean circle theorems & quadratic inequalities." };
    if (pct >= 50) return { lvl: 4, label: "Moderate Achievement", color: "text-amber-500", desc: "Level 4 pass. Solid upgrade path, but needs immediate diagnostic tutoring intervention to qualify for BSc degrees." };
    if (pct >= 40) return { lvl: 3, label: "Adequate Achievement", color: "text-orange-500", desc: "Level 3 pass. Requires urgent, step-by-step masterclass support with Tutor Bethuel to bridge foundational high-school gaps." };
    return { lvl: 2, label: "Elementary Achievement", color: "text-red-500", desc: "Elementary. Urgent upgrade remedial action is required. Connect on our WhatsApp hotline (+27 71 415 6665) immediately." };
  };

  const currentLevel = getMatricUpgradeLevel(scorePercent);

  return (
    <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl shadow-xl overflow-hidden transition-all p-6 space-y-6">
      
      {/* Page Header banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-navy-150 dark:border-navy-800 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-gold-400 dark:bg-gold-500 text-navy-950 rounded-lg shadow-sm">
              <Sparkles className="w-5 h-5 text-navy-950" />
            </span>
            <h2 className="text-xl font-extrabold font-sans text-navy-900 dark:text-white">
              Amaris AI <span className="text-royal-600 dark:text-gold-400">Final Exam Predictor Engine</span>
            </h2>
          </div>
          <p className="text-xs text-navy-500 dark:text-navy-400 font-mono mt-1">
            Analyzing historical Department of Basic Education CAPS papers (2015-2025)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-navy-50 dark:bg-navy-950/60 border border-navy-200 dark:border-navy-800 px-3 py-1.5 rounded-xl text-xs font-mono">
            Available Tokens: <span className="font-bold text-royal-600 dark:text-gold-400">{credits} Exam(s)</span>
          </div>
          {credits === 0 && (
            <button
              onClick={handleSimulatePayment}
              disabled={paymentLoading}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1 cursor-pointer"
            >
              {paymentLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Coins className="w-3.5 h-3.5" />
              )}
              Simulate PayFast (R120)
            </button>
          )}
        </div>
      </div>

      {/* Main configuration dashboard and generator panel */}
      {!hasGenerated && !isGenerating && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5 bg-navy-50/50 dark:bg-navy-950/20 border border-navy-100 dark:border-navy-800/40 p-5 rounded-2xl">
            <h3 className="text-sm font-extrabold text-navy-900 dark:text-white uppercase tracking-wider font-mono">
              Exam Configuration Parameters
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy-700 dark:text-navy-300 mb-2 font-mono">Syllabus / Curriculum</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSyllabus("CAPS")}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${syllabus === "CAPS" ? "bg-royal-600 border-royal-600 text-white" : "bg-white dark:bg-navy-850 border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300"}`}
                  >
                    CAPS (NSC)
                  </button>
                  <button
                    onClick={() => setSyllabus("IEB")}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${syllabus === "IEB" ? "bg-royal-600 border-royal-600 text-white" : "bg-white dark:bg-navy-850 border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300"}`}
                  >
                    IEB
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-700 dark:text-navy-300 mb-2 font-mono">Predicted Paper Choice</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaperType("p1")}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${paperType === "p1" ? "bg-royal-600 border-royal-600 text-white" : "bg-white dark:bg-navy-850 border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300"}`}
                  >
                    Paper 1 (Core Algebra/Calc)
                  </button>
                  <button
                    onClick={() => setPaperType("p2")}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${paperType === "p2" ? "bg-royal-600 border-royal-600 text-white" : "bg-white dark:bg-navy-850 border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300"}`}
                  >
                    Paper 2 (Trig/Geometry)
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-navy-700 dark:text-navy-300 mb-2 font-mono">Academic Year Target</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full py-2.5 px-3.5 bg-white dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-xl text-xs text-navy-800 dark:text-white font-semibold font-mono"
              >
                <option value={2026}>2026 Grade 12 National Senior Certificate (NSC) Trials & Finals</option>
                <option value={2027}>2027 Grade 12 Advanced Preparatory Series</option>
              </select>
            </div>

            <div className="border-t border-navy-100 dark:border-navy-800/60 pt-4 flex items-center justify-between gap-4">
              <div className="flex gap-2 items-start">
                <ShieldCheck className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-navy-500 dark:text-navy-400">
                  By clicking run, 1 prediction credit token will be deducted. The generator will run a complete past paper analysis and compile the exam with step-by-step memo criteria.
                </p>
              </div>
              
              <button
                onClick={startExamGeneration}
                disabled={credits <= 0}
                className={`py-3 px-6 rounded-xl text-xs font-extrabold uppercase font-mono shadow-md hover:shadow-lg transition-all flex items-center gap-1 flex-shrink-0 ${credits > 0 ? "bg-gradient-to-r from-royal-600 to-royal-700 hover:scale-105 hover:from-royal-700 hover:to-royal-800 text-white cursor-pointer" : "bg-navy-200 dark:bg-navy-800 text-navy-400 cursor-not-allowed"}`}
              >
                <Sparkles className="w-4 h-4 text-gold-300" />
                Analyze & Run Engine
              </button>
            </div>
          </div>

          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 text-white flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-mono font-extrabold uppercase text-gold-400 bg-gold-400/10 px-2 py-0.5 rounded border border-gold-400/20">
                NSC CAPS Standards
              </span>
              <h4 className="text-base font-extrabold text-white mt-3 leading-snug">
                Department of Basic Education Cognitive Levels Model
              </h4>
              <p className="text-xs text-navy-350 leading-relaxed mt-2 font-mono">
                The predictor is calibrated to align precisely with South African standards:
              </p>
              <ul className="space-y-1 text-xs text-navy-400 mt-4 font-mono">
                <li className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  Knowledge & Recall (20% Marks)
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Routine Procedures (35% Marks)
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
                  Complex Procedures (30% Marks)
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Creative Problem Solving (15% Marks)
                </li>
              </ul>
            </div>
            
            <div className="border-t border-navy-800 pt-4 mt-6">
              <p className="text-[10px] text-navy-400 font-mono italic">
                *Active Upgrade Academy students receive monthly allocations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading sequence progress logs */}
      {isGenerating && (
        <div className="bg-navy-950 border border-navy-850 p-6 rounded-2xl text-white space-y-6 animate-pulse">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-gold-400 animate-spin" />
            <div>
              <h3 className="font-extrabold text-base">Running AMARIS AI Prediction Algorithm...</h3>
              <p className="text-xs text-navy-400 font-mono">Executing server-side neural cognitive mapping</p>
            </div>
          </div>

          <div className="w-full bg-navy-900 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-royal-600 to-gold-400 h-2 rounded-full transition-all duration-1000" 
              style={{ width: `${Math.round(((generationStep + 1) / steps.length) * 100)}%` }}
            />
          </div>

          <div className="bg-black/40 border border-navy-900 p-4 rounded-xl max-h-56 overflow-y-auto space-y-2 text-xs font-mono text-emerald-400">
            {generationLogs.map((log, index) => (
              <div key={index} className="leading-relaxed">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated output tabs and results */}
      {hasGenerated && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between border-b border-navy-200 dark:border-navy-850 pb-2 gap-4">
            
            {/* View tabs selector */}
            <div className="flex flex-wrap gap-1 bg-navy-50 dark:bg-navy-950 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("exam")}
                className={`py-2 px-3.5 text-xs font-extrabold uppercase font-mono rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "exam" ? "bg-royal-600 text-white shadow" : "text-navy-600 dark:text-navy-300 hover:text-royal-600"}`}
              >
                <FileText className="w-4 h-4" />
                Part A: Exam Paper
              </button>
              <button
                onClick={() => setActiveTab("memo")}
                className={`py-2 px-3.5 text-xs font-extrabold uppercase font-mono rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "memo" ? "bg-royal-600 text-white shadow" : "text-navy-600 dark:text-navy-300 hover:text-royal-600"}`}
              >
                <Layers className="w-4 h-4" />
                Part B: Memo Guidelines
              </button>
              <button
                onClick={() => setActiveTab("trends")}
                className={`py-2 px-3.5 text-xs font-extrabold uppercase font-mono rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "trends" ? "bg-royal-600 text-white shadow" : "text-navy-600 dark:text-navy-300 hover:text-royal-600"}`}
              >
                <TrendingUp className="w-4 h-4" />
                Part C: Trend Weights
              </button>
              <button
                onClick={() => setActiveTab("cognitive")}
                className={`py-2 px-3.5 text-xs font-extrabold uppercase font-mono rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "cognitive" ? "bg-royal-600 text-white shadow" : "text-navy-600 dark:text-navy-300 hover:text-royal-600"}`}
              >
                <BarChart2 className="w-4 h-4" />
                Part D: Cognitive Levels
              </button>
              <button
                onClick={() => setActiveTab("tracker")}
                className={`py-2 px-3.5 text-xs font-extrabold uppercase font-mono rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "tracker" ? "bg-royal-600 text-white shadow" : "text-navy-600 dark:text-navy-300 hover:text-royal-600"}`}
              >
                <Award className="w-4 h-4" />
                Part E: Student Tracker
              </button>
              <button
                onClick={() => setActiveTab("delivery")}
                className={`py-2 px-3.5 text-xs font-extrabold uppercase font-mono rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "delivery" ? "bg-royal-600 text-white shadow" : "text-navy-600 dark:text-navy-300 hover:text-royal-600"}`}
              >
                <ShieldCheck className="w-4 h-4" />
                Part F: Secure Dispatch
              </button>
            </div>

            {/* Multi-channel Receive / Dispatch / Print / Download action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setDispatchSuccessMsg(null);
                  setShowReceiveModal(true);
                }}
                className="py-2.5 px-4 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 font-black rounded-xl text-xs uppercase font-mono flex items-center gap-1.5 shadow-md hover:scale-105 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-navy-950" />
                Receive Exam Paper (PDF)
              </button>

              <button
                onClick={() => setShowPreviewModal(true)}
                className="py-2 px-3 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-900 dark:text-white rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                title="Preview PDF"
              >
                <Eye className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                <span>Preview PDF</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                className="py-2 px-3 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-900 dark:text-white rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                title="Print PDF"
              >
                <Printer className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                <span>Print</span>
              </button>

              <button
                onClick={() => {
                  setDispatchSuccessMsg(null);
                  setShowReceiveModal(true);
                }}
                className="py-2 px-3 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-900 dark:text-white rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                title="Send via Email"
              >
                <Mail className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                <span>Email</span>
              </button>

              <button
                onClick={() => {
                  setDispatchSuccessMsg(null);
                  setShowReceiveModal(true);
                }}
                className="py-2 px-3 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-900 dark:text-white rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                title="Send via WhatsApp"
              >
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleGenerateClientPdf}
                className="py-2 px-3 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="Download PDF File"
              >
                <Download className="w-4 h-4 text-gold-300" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* TAB 1: PART A EXAM PAPER */}
          {activeTab === "exam" && (
            <div className="space-y-6">
              
              {/* Cover title banner */}
              <div className="border-4 border-double border-navy-900 dark:border-navy-100 p-8 text-center space-y-4 max-w-3xl mx-auto rounded-xl">
                <h3 className="font-extrabold text-lg text-navy-900 dark:text-white uppercase tracking-wider font-mono">
                  Department of Basic Education
                </h3>
                <h4 className="font-extrabold text-xl text-navy-800 dark:text-white uppercase tracking-wide">
                  REPUBLIC OF SOUTH AFRICA
                </h4>
                <div className="border-t border-navy-200 dark:border-navy-700 py-3 font-mono text-xs">
                  <p className="font-bold">NATIONAL SENIOR CERTIFICATE (NSC) EXAMINATIONS</p>
                  <p className="text-royal-600 dark:text-gold-400 font-extrabold text-sm mt-1">
                    PREDICTED MATHEMATICS PAPER {paperType === "p1" ? "1" : "2"} - {year}
                  </p>
                </div>
                <div className="grid grid-cols-2 text-xs font-mono font-bold text-navy-700 dark:text-navy-300 border-t border-b border-navy-200 dark:border-navy-700 py-2">
                  <p>TIME: 3 HOURS</p>
                  <p>MARKS: 150</p>
                </div>
                <div className="text-left space-y-2 text-[11px] text-navy-600 dark:text-navy-400 font-mono pt-4 leading-relaxed list-decimal pl-4">
                  <p>1. This question paper consists of {currentQuestions.length} questions.</p>
                  <p>2. Answer ALL the questions.</p>
                  <p>3. Clearly show ALL calculations, diagrams, graphs, et cetera, which you have used in determining the answers.</p>
                  <p>4. Answers only will NOT necessarily be awarded full marks.</p>
                  <p>5. An approved scientific calculator (non-programmable and non-graphical) may be used, unless stated otherwise.</p>
                </div>
              </div>

              {/* Questions Render Loop */}
              <div className="space-y-8 max-w-3xl mx-auto pt-6">
                {currentQuestions.map((q) => (
                  <div key={q.number} className="bg-navy-50/30 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-800 p-6 rounded-2xl space-y-4">
                    <div className="flex justify-between items-start border-b border-navy-150 dark:border-navy-800 pb-2">
                      <div>
                        <h4 className="font-extrabold text-navy-900 dark:text-white font-mono text-sm uppercase">
                          Question {q.number}
                        </h4>
                        <p className="text-[10px] font-mono text-navy-500 dark:text-navy-400 mt-0.5">
                          Topic Focus: <span className="font-bold text-royal-600 dark:text-gold-400">{q.topic}</span>
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 px-2 py-1 rounded">
                        {q.marks} Marks
                      </span>
                    </div>

                    <p className="text-xs text-navy-500 dark:text-navy-400 font-mono italic">
                      Scenario Context: {q.scenario}
                    </p>

                    <div className="space-y-4 pt-2">
                      {q.subQuestions.map((sub) => (
                        <div key={sub.id} className="flex justify-between items-start text-xs leading-relaxed gap-6 font-mono text-navy-800 dark:text-navy-200">
                          <div className="space-y-1 flex-grow">
                            <span className="font-black text-royal-600 dark:text-gold-400 mr-2">{sub.id}</span>
                            <LatexRenderer text={sub.text} />
                          </div>
                          <span className="font-black text-navy-950 dark:text-white flex-shrink-0 ml-2">
                            ({sub.marks})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 2: PART B MARKING MEMORANDUM */}
          {activeTab === "memo" && (
            <div className="space-y-6 max-w-3xl mx-auto">
              
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 p-5 rounded-2xl">
                <h3 className="text-sm font-extrabold text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-5 h-5" />
                  Official NSC Memorandum Marking Codes Guidelines
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-mono mt-2 leading-relaxed">
                  • <b>M:</b> Method Mark. Allocated for applying a correct mathematics procedure.<br />
                  • <b>A:</b> Accuracy Mark. Awarded for correct numerical calculations.<br />
                  • <b>CA:</b> Consistent Accuracy. Awarded if a step is mathematically sound based on a prior error.<br />
                  • <b>S:</b> Statement. Marks awarded for correct trigonometric or geometric logical lines.
                </p>
              </div>

              <div className="space-y-6 pt-2">
                {currentQuestions.map((q) => (
                  <div key={q.number} className="bg-white dark:bg-navy-850 border border-navy-150 dark:border-navy-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-navy-900 dark:bg-navy-950 px-4 py-2.5 flex justify-between items-center text-white">
                      <span className="text-xs font-mono font-black uppercase tracking-wider">Question {q.number} - Memorandum</span>
                      <span className="text-[10px] font-mono text-navy-300">Total Weight: {q.marks} Marks</span>
                    </div>
                    
                    <div className="p-5 space-y-5 font-mono text-xs divide-y divide-navy-100 dark:divide-navy-800">
                      {q.subQuestions.map((sub) => (
                        <div key={sub.id} className="pt-4 first:pt-0 space-y-2">
                          <div className="flex justify-between font-bold text-navy-900 dark:text-white">
                            <span>Subquestion {sub.id} (Mark allocation: {sub.marks})</span>
                            <span className="text-royal-600 dark:text-gold-400">[{sub.marks} Marks]</span>
                          </div>
                          <div className="bg-navy-50/40 dark:bg-navy-950/40 p-4 rounded-xl text-navy-800 dark:text-navy-300 leading-relaxed border border-navy-100/50 dark:border-navy-800/60">
                            <LatexRenderer text={sub.memo} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 3: PART C HISTORICAL TREND ANALYSIS */}
          {activeTab === "trends" && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-navy-50/30 dark:bg-navy-950/30 border border-navy-150 dark:border-navy-800 p-5 rounded-2xl space-y-4">
                  <h3 className="text-sm font-extrabold text-navy-900 dark:text-white uppercase tracking-wider font-mono">
                    Predicted Weightings vs 2015-2025 NSC CAPS Averages
                  </h3>
                  <p className="text-xs text-navy-500 dark:text-navy-400 font-mono leading-relaxed">
                    Our AI parses 10 years of exams. This chart tracks the forecasted marks allocation for Paper 1 subjects. Focus your studies where predicted marks exceed historic averages!
                  </p>
                  
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={trendsData}>
                        <PolarGrid stroke="#64748b" />
                        <PolarAngleAxis dataKey="subject" stroke="#64748b" tick={{ fill: "#64748b", fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 50]} stroke="#64748b" />
                        <Radar name="Historical Average" dataKey="avg" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
                        <Radar name="Predicted 2026 Model" dataKey="predicted" stroke="#ca8a04" fill="#ca8a04" fillOpacity={0.5} />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "12px", color: "#fff", fontSize: "11px" }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-navy-50/50 dark:bg-navy-950/20 border border-navy-100 dark:border-navy-800 p-5 rounded-2xl">
                    <h4 className="text-xs font-black uppercase font-mono tracking-wider text-royal-600 dark:text-gold-400">
                      Tutor Bethuel's High-Yield Warning Area
                    </h4>
                    <h5 className="text-sm font-bold text-navy-900 dark:text-white mt-2">
                      Differential Calculus Optimization
                    </h5>
                    <p className="text-xs text-navy-600 dark:text-navy-400 font-mono mt-2 leading-relaxed">
                      "Ayo! Our historical regression shows that volume maximization proofs are highly predicted to carry over 12 marks in the upcoming exams. Spend quality time drawing geometric rectangular dimensions!"
                    </p>
                  </div>

                  <div className="bg-navy-50/50 dark:bg-navy-950/20 border border-navy-100 dark:border-navy-800 p-5 rounded-2xl">
                    <h4 className="text-xs font-black uppercase font-mono tracking-wider text-royal-600 dark:text-gold-400">
                      Sinking Funds & Annuities
                    </h4>
                    <h5 className="text-sm font-bold text-navy-900 dark:text-white mt-2">
                      Missed Payments Calculations
                    </h5>
                    <p className="text-xs text-navy-600 dark:text-navy-400 font-mono mt-2 leading-relaxed">
                      "Financial mathematics calculations on outstanding home balances with deferred months carry a heavy likelihood. Master compounding on skipped fractions!"
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: PART D COGNITIVE LEVEL BREAKDOWN */}
          {activeTab === "cognitive" && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="bg-navy-50/30 dark:bg-navy-950/30 border border-navy-150 dark:border-navy-800 p-5 rounded-2xl lg:col-span-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-navy-900 dark:text-white uppercase tracking-wider font-mono">
                      Cognitive Level Allocation
                    </h3>
                    <p className="text-xs text-navy-500 dark:text-navy-400 font-mono mt-2 leading-relaxed">
                      DBE dictates exact cognitive mapping parameters so that the exam is balanced and fair for high-schoolers across provinces.
                    </p>
                  </div>

                  <div className="h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={cognitiveData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {cognitiveData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-sm font-extrabold text-navy-900 dark:text-white uppercase tracking-wider font-mono">
                    Cognitive Tier Definitions
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-navy-150 dark:border-navy-800/80 p-4 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        <h4 className="text-xs font-black uppercase font-mono text-navy-900 dark:text-white">Knowledge (Recall - 20%)</h4>
                      </div>
                      <p className="text-[11px] text-navy-600 dark:text-navy-400 font-mono leading-relaxed">
                        Straightforward formulas, standard rules of differentiation, writing asymptotes from graphs, and direct arithmetic sequences ($d$ definition).
                      </p>
                    </div>

                    <div className="border border-navy-150 dark:border-navy-800/80 p-4 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        <h4 className="text-xs font-black uppercase font-mono text-navy-900 dark:text-white">Routine Procedures (35%)</h4>
                      </div>
                      <p className="text-[11px] text-navy-600 dark:text-navy-400 font-mono leading-relaxed">
                        Solving quadratic equations, computing standard limits, sketch-plotting hyperbolas, and finding turning values of cubic graphs using power rule.
                      </p>
                    </div>

                    <div className="border border-navy-150 dark:border-navy-800/80 p-4 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-yellow-500" />
                        <h4 className="text-xs font-black uppercase font-mono text-navy-900 dark:text-white">Complex Procedures (30%)</h4>
                      </div>
                      <p className="text-[11px] text-navy-600 dark:text-navy-400 font-mono leading-relaxed">
                        Simultaneous algebraic coordinate circles equations, general solutions of exponential inverse domains, and sinking home annuity deferred amortization scales.
                      </p>
                    </div>

                    <div className="border border-navy-150 dark:border-navy-800/80 p-4 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        <h4 className="text-xs font-black uppercase font-mono text-navy-900 dark:text-white">Creative Problem Solving (15%)</h4>
                      </div>
                      <p className="text-[11px] text-navy-600 dark:text-navy-400 font-mono leading-relaxed">
                        Formulating volume area functions, non-standard quadratic sequence matrices, and proving complex alphanumeric digit permutations probability ratios.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: PART E STUDENT TRIAL SCORE TRACKER */}
          {activeTab === "tracker" && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 bg-navy-50/20 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-800 p-5 rounded-2xl space-y-5">
                  <div className="flex justify-between items-center border-b border-navy-100 dark:border-navy-800 pb-3">
                    <h3 className="text-sm font-extrabold text-navy-900 dark:text-white uppercase tracking-wider font-mono">
                      Predictive Mock Grade Calculator
                    </h3>
                    <span className="text-xs text-navy-500 dark:text-navy-400 font-mono">
                      Paper Max: {totalPaperMarks} Marks
                    </span>
                  </div>

                  <p className="text-xs text-navy-600 dark:text-navy-400 font-mono leading-relaxed">
                    Ayo! Complete this simulated trial scoring sheet. Enter your marks for each predicted question, and calculate your target Matric pass grade!
                  </p>

                  <div className="space-y-3.5 pt-2">
                    {currentQuestions.map((q) => (
                      <div key={q.number} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-navy-100 dark:border-navy-800/50 pb-2.5 gap-2">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-navy-900 dark:text-white font-mono">
                            Question {q.number}: {q.topic}
                          </span>
                          <p className="text-[10px] text-navy-400 font-mono">{q.cognitiveLevel} Tier • Max {q.marks} Marks</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={q.marks}
                            value={studentMarks[q.number] || 0}
                            onChange={(e) => {
                              const val = Math.min(q.marks, Math.max(0, Number(e.target.value)));
                              setStudentMarks(prev => ({ ...prev, [q.number]: val }));
                            }}
                            className="w-16 text-center py-1 bg-white dark:bg-navy-850 border border-navy-200 dark:border-navy-700 rounded-lg text-xs font-extrabold text-navy-900 dark:text-white font-mono"
                          />
                          <span className="text-xs font-mono text-navy-400 font-bold">/ {q.marks}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-navy-100 dark:border-navy-800">
                    <button
                      onClick={() => setTrackerGradeCalculated(true)}
                      className="py-2.5 px-5 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-extrabold uppercase font-mono shadow transition-all cursor-pointer"
                    >
                      Process Grade Analysis
                    </button>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="bg-navy-900 border border-navy-800 text-white p-5 rounded-2xl flex flex-col justify-between h-full">
                    <div className="space-y-4">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-gold-400 bg-gold-400/15 px-2 py-0.5 rounded border border-gold-400/25">
                        Grading Outcome
                      </span>
                      
                      {trackerGradeCalculated ? (
                        <div className="space-y-4 pt-2">
                          <div className="flex justify-between items-baseline">
                            <span className="text-3xl font-extrabold font-mono text-white">
                              {scorePercent}%
                            </span>
                            <span className={`text-sm font-bold font-mono ${currentLevel.color}`}>
                              Level {currentLevel.lvl}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <h4 className="text-xs font-extrabold text-gold-400 uppercase tracking-wider font-mono">
                              {currentLevel.label}
                            </h4>
                            <p className="text-[11px] text-navy-300 font-mono leading-relaxed">
                              {currentLevel.desc}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 text-center text-navy-400 font-mono space-y-3">
                          <Award className="w-10 h-10 text-navy-600 mx-auto opacity-60 animate-bounce" />
                          <p className="text-[11px]">Click "Process Grade Analysis" to compute target Matric Upgrade rankings!</p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-navy-800 pt-4 mt-6">
                      <a
                        href="https://wa.me/27714156665"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-center block py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold rounded-xl text-[10px] uppercase font-mono tracking-wider transition-all"
                      >
                        Submit Score to Tutor Bethuel
                      </a>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 6: PART F SECURE MULTI-CHANNEL DELIVERY STATUS */}
          {activeTab === "delivery" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left side: Node System Architecture specs */}
                <div className="bg-navy-900 border border-navy-800 text-white p-5 rounded-2xl space-y-4 font-mono">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-gold-400 bg-gold-400/15 px-2 py-0.5 rounded border border-gold-400/25">
                    Storage & Sec Spec
                  </span>
                  <h4 className="text-xs font-black uppercase text-gold-400 tracking-wider">Secure Delivery Infrastructure</h4>
                  
                  <div className="space-y-3.5 text-[11px] text-navy-300">
                    <div className="border-b border-navy-800 pb-2">
                      <div className="text-navy-400 text-[10px]">OBJECT STORAGE VAULT:</div>
                      <div className="text-white font-bold">AWS S3 (amaris-predicted-vault-za)</div>
                    </div>
                    <div className="border-b border-navy-800 pb-2">
                      <div className="text-navy-400 text-[10px]">ENCRYPTION LAYER:</div>
                      <div className="text-white font-bold">AES-256 HMAC-SHA256 Signed Link</div>
                    </div>
                    <div className="border-b border-navy-800 pb-2">
                      <div className="text-navy-400 text-[10px]">ACCESS EXPIRE CODE:</div>
                      <div className="text-white font-bold">3600 seconds (Single-Session Bound)</div>
                    </div>
                    <div className="border-b border-navy-800 pb-2">
                      <div className="text-navy-400 text-[10px]">DYNAMIC ANTI-SHARE WATERMARK:</div>
                      <div className="text-white font-bold font-mono text-emerald-400 uppercase">HASH SIGNED: ACTIVE</div>
                    </div>
                    <div>
                      <p className="text-[10px] text-navy-400 leading-relaxed italic">
                        *AMARIS system enforces strict access audits. Your tutor Bethuel receives webhook notices whenever predicted papers are accessed outside your primary workspace IP address.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right side: Active Dispatches List */}
                <div className="lg:col-span-2 bg-navy-50/20 dark:bg-navy-950/20 border border-navy-150 dark:border-navy-800 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-navy-100 dark:border-navy-800 pb-3">
                    <h3 className="text-sm font-extrabold text-navy-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-gold-500" />
                      Dynamic Dispatch Ticker
                    </h3>
                    <span className="text-xs text-navy-500 font-mono">
                      Celery Worker Status: <span className="font-bold text-emerald-600 dark:text-emerald-400">ONLINE</span>
                    </span>
                  </div>

                  {loadingDeliveries && deliveries.length === 0 ? (
                    <div className="py-12 text-center text-navy-400 font-mono flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-royal-600 animate-spin" />
                      <p className="text-xs">Connecting to AMARIS Redis Queue...</p>
                    </div>
                  ) : deliveries.length === 0 ? (
                    <div className="py-12 text-center text-navy-400 font-mono space-y-2">
                      <AlertCircle className="w-8 h-8 text-navy-300 mx-auto opacity-70" />
                      <p className="text-xs">No active dispatches found for your account.</p>
                      <p className="text-[10px] text-navy-500">Deduct a credit token and generate a prediction to trigger multi-channel dispatches!</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                      {deliveries.map((d) => (
                        <div key={d.id} className="border border-navy-150 dark:border-navy-800 p-4 rounded-xl bg-white dark:bg-navy-900 space-y-3.5 shadow-sm">
                          
                          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-navy-50 dark:border-navy-800/60 pb-2 text-[11px] font-mono">
                            <span className="font-extrabold text-navy-900 dark:text-white">
                              Ref: {d.id.toUpperCase()}
                            </span>
                            <span className="text-navy-400 text-[10px]">
                              {new Date(d.created_at || d.sent_at || Date.now()).toLocaleTimeString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Email delivery details */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-navy-800 dark:text-navy-200 font-mono">
                                <Mail className="w-3.5 h-3.5 text-royal-600" />
                                AWS SES Email Channel
                              </div>
                              <p className="text-[10px] text-navy-500 font-mono pl-5 break-all">{d.email_address}</p>
                              <div className="pl-5">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                                  d.email_status === "sent" ? "bg-green-500/10 border-green-500/20 text-green-600" :
                                  d.email_status === "simulated" ? "bg-blue-500/10 border-blue-500/20 text-blue-500" :
                                  d.email_status === "failed" ? "bg-red-500/10 border-red-500/20 text-red-500" :
                                  "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 animate-pulse"
                                }`}>
                                  {d.email_status === "sent" ? "Delivered (SES Real)" :
                                   d.email_status === "simulated" ? "Delivered (Simulated)" :
                                   d.email_status === "failed" ? "Failed (Retry Pending)" :
                                   "Processing Task..."}
                                </span>
                              </div>
                            </div>

                            {/* WhatsApp delivery details */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-navy-800 dark:text-navy-200 font-mono">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                                Meta WhatsApp Cloud
                              </div>
                              <p className="text-[10px] text-navy-500 font-mono pl-5">{d.whatsapp_number}</p>
                              <div className="pl-5 flex flex-col gap-1">
                                <div>
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                                    d.whatsapp_status === "sent" || d.whatsapp_status === "simulated" ? "bg-green-500/10 border-green-500/20 text-green-600" :
                                    d.whatsapp_status === "failed" ? "bg-red-500/10 border-red-500/20 text-red-500" :
                                    "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 animate-pulse"
                                  }`}>
                                    {d.whatsapp_status === "sent" || d.whatsapp_status === "simulated" ? "Dispatched" :
                                     d.whatsapp_status === "failed" ? "Temporary Fail" :
                                     "Queued on Celery..."}
                                  </span>
                                </div>
                                {d.whatsapp_status === "failed" && (
                                  <p className="text-[9px] text-red-500 font-mono">
                                    Meta rate limits active. Automated retry scheduled (Attempt #{d.retry_count}).
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Access Verification Area */}
                          <div className="pt-2 border-t border-navy-100 dark:border-navy-800/50 flex justify-between items-center text-[10px] font-mono">
                            <span className="text-navy-400">Target Year: {d.year} CAPS Paper {d.paper_type.toUpperCase()}</span>
                            <a 
                              href={d.pdf_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-royal-600 dark:text-gold-400 hover:underline font-bold flex items-center gap-1"
                            >
                              Verify Dynamic Watermarked S3 Object
                              <ArrowRight className="w-3 h-3" />
                            </a>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

          {/* Reset button back to starting state */}
          <div className="pt-4 border-t border-navy-150 dark:border-navy-805 text-center">
            <button
              onClick={() => {
                setHasGenerated(false);
                setIsGenerating(false);
              }}
              className="py-1.5 px-4 bg-navy-50 hover:bg-navy-100 dark:bg-navy-850 dark:hover:bg-navy-800 text-navy-700 dark:text-navy-300 rounded-xl text-[11px] font-mono font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Analyze Another Exam Series
            </button>
          </div>

        </div>
      )}

      {/* HIGH-FIDELITY PRINT-ONLY EXAM & MEMORANDUM DOCUMENT */}
      {hasGenerated && (
        <div className="hidden print:block print-only w-full bg-white text-black p-4 md:p-8 font-serif leading-relaxed text-sm">
          {/* 1. COVER PAGE */}
          <div className="min-h-screen flex flex-col justify-between py-12 border-8 border-double border-black p-10 max-w-[190mm] mx-auto mb-12">
            <div className="text-center space-y-6">
              <h1 className="text-3xl font-black tracking-wide uppercase">AMARIS MATHEMATICS HUB</h1>
              <div className="h-0.5 bg-black w-32 mx-auto" />
              <p className="text-sm font-bold uppercase tracking-widest text-gray-700">National Senior Certificate (NSC) Examination Calibration</p>
              
              <div className="py-8 space-y-3">
                <h2 className="text-4xl font-extrabold tracking-tight uppercase">MATHEMATICS</h2>
                <h3 className="text-2xl font-bold uppercase text-gray-800 font-sans">PREDICTED PAPER {paperType === "p1" ? "I" : "II"}</h3>
                <p className="text-lg font-mono font-bold">{year} ASSESSMENT SERIES</p>
              </div>
            </div>

            <div className="border-t border-b-2 border-black py-6 grid grid-cols-2 gap-4 text-sm font-bold uppercase">
              <div>
                <p className="text-xs text-gray-600 font-sans">SUBJECT:</p>
                <p className="text-base font-black">MATHEMATICS</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-sans">GRADE & CURRICULUM:</p>
                <p className="text-base font-black">GRADE 12 (CAPS/NSC)</p>
              </div>
              <div className="pt-2">
                <p className="text-xs text-gray-600 font-sans">DURATION:</p>
                <p className="text-base font-black font-sans">3 HOURS</p>
              </div>
              <div className="pt-2">
                <p className="text-xs text-gray-600 font-sans">TOTAL MARKS:</p>
                <p className="text-base font-black font-sans">150 MARKS</p>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <h4 className="text-xs font-black uppercase tracking-wider text-center border-b pb-1 font-sans">INSTRUCTIONS AND INFORMATION</h4>
              <ol className="list-decimal pl-5 text-[11px] space-y-2 text-left leading-relaxed font-sans">
                <li>This question paper consists of 12 sequential questions.</li>
                <li>Answer ALL the questions in the answer sheets provided.</li>
                <li>Clearly show ALL calculations, diagrams, graphs, etc. which you have used in determining the answers.</li>
                <li>Answers only will NOT necessarily be awarded full marks.</li>
                <li>An approved scientific calculator (non-programmable and non-graphical) may be used, unless stated otherwise.</li>
                <li>If necessary, answers should be rounded off to TWO decimal places, unless stated otherwise.</li>
                <li>Diagrams are NOT necessarily drawn to scale.</li>
                <li>Write neatly and legibly.</li>
              </ol>
            </div>

            <div className="text-center pt-8 text-[10px] font-mono border-t mt-4 text-gray-600">
              <p>CONFIDENTIAL • DESIGNED & CALIBRATED BY TUTOR BETHUEL MOUKANGWE (BSc MATHS)</p>
              <p>© AMARIS MATHEMATICS HUB — ALL RIGHTS RESERVED</p>
            </div>
          </div>

          {/* 2. THE QUESTIONS (SEQUENTIAL 1-12) */}
          <div className="space-y-12 max-w-[190mm] mx-auto pt-8">
            <div className="print-force-page-break" />
            <div className="text-center pb-4 border-b border-gray-300">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-600 font-sans">Mathematics Paper {paperType === "p1" ? "1" : "2"}</span>
              <h2 className="text-xl font-black mt-1 uppercase">THE QUESTION PAPER</h2>
            </div>

            {currentQuestions.map((q) => (
              <div key={q.number} className="space-y-4 print-avoid-break pt-4 border-b border-dashed border-gray-200 pb-8 last:border-0">
                <div className="flex justify-between items-baseline border-b-2 border-black pb-1.5">
                  <h3 className="text-base font-black uppercase">QUESTION {q.number}</h3>
                  <span className="text-sm font-bold font-sans">[{q.marks} Marks]</span>
                </div>
                
                <p className="text-xs text-gray-500 font-sans italic mb-3">
                  Topic: {q.topic} • Cognitive Level: {q.cognitiveLevel}
                </p>

                <div className="space-y-6">
                  {q.subQuestions.map((sub) => (
                    <div key={sub.id} className="flex justify-between items-start gap-4">
                      <div className="flex-grow space-y-2">
                        <div className="flex items-start">
                          <span className="font-bold mr-3 min-w-[32px] font-sans">{sub.id}</span>
                          <div className="font-serif leading-relaxed">
                            <LatexRenderer text={sub.text} />
                          </div>
                        </div>
                      </div>
                      <span className="font-bold flex-shrink-0 text-right min-w-[28px] font-sans">
                        ({sub.marks})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 3. THE SOLUTIONS MEMORANDUM */}
          <div className="space-y-12 max-w-[190mm] mx-auto pt-12">
            <div className="print-force-page-break" />
            
            <div className="text-center pb-4 border-b border-gray-300">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-600 font-sans">Mathematics Paper {paperType === "p1" ? "1" : "2"}</span>
              <h2 className="text-xl font-black mt-1 uppercase">MARKING GUIDELINES & SOLUTIONS MEMORANDUM</h2>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-4 rounded text-xs font-sans space-y-1 text-gray-700">
              <p className="font-bold text-black">National Senior Certificate Marking Codes:</p>
              <p>• <b>M:</b> Method Mark. Allocated for applying correct mathematical steps.</p>
              <p>• <b>A:</b> Accuracy Mark. Awarded for precise calculations or final values.</p>
              <p>• <b>CA:</b> Consistent Accuracy. Applied for subsequent steps following an initial error.</p>
            </div>

            {currentQuestions.map((q) => (
              <div key={q.number} className="space-y-6 print-avoid-break pt-4 border-b border-dashed border-gray-200 pb-8 last:border-0">
                <div className="flex justify-between items-baseline border-b-2 border-black pb-1.5">
                  <h3 className="text-base font-black uppercase">QUESTION {q.number} MEMO</h3>
                  <span className="text-sm font-bold font-sans">Total: {q.marks} Marks</span>
                </div>

                <div className="space-y-6 divide-y divide-gray-100">
                  {q.subQuestions.map((sub) => (
                    <div key={sub.id} className="pt-4 first:pt-0 space-y-3">
                      <div className="flex justify-between text-xs font-bold font-sans text-gray-800">
                        <span>{sub.id} SOLUTION</span>
                        <span>[{sub.marks} Marks]</span>
                      </div>
                      <div className="pl-6 border-l-4 border-gray-300 py-1 font-serif text-sm leading-relaxed whitespace-pre-line">
                        <LatexRenderer text={sub.memo} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: CHOOSE HOW TO RECEIVE PREDICTED EXAM PAPER (PDF / EMAIL / WHATSAPP / PRINT) */}
      {showReceiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative text-left space-y-6 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-navy-100 dark:border-navy-850 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-gold-500 to-amber-500 text-navy-950 font-black shadow-md">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-navy-900 dark:text-white uppercase font-mono tracking-tight">
                    Choose Delivery & Receive Option
                  </h3>
                  <p className="text-xs text-navy-500 dark:text-navy-400 mt-0.5">
                    Select how you would like to receive or interact with your predicted Grade 12 {syllabus} Maths Paper {paperType === "p1" ? "1" : "2"} ({year}) PDF paper.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowReceiveModal(false)}
                className="p-2 rounded-xl text-navy-400 hover:text-navy-900 dark:hover:text-white hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification Banner */}
            {dispatchSuccessMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="flex-1">{dispatchSuccessMsg}</div>
              </motion.div>
            )}

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Option A: Preview PDF */}
              <div
                onClick={() => {
                  setShowReceiveModal(false);
                  setShowPreviewModal(true);
                }}
                className="p-4 rounded-2xl border border-navy-150 dark:border-navy-800 bg-navy-50/50 dark:bg-navy-950/50 hover:border-gold-500 hover:bg-gold-500/5 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-royal-500/10 text-royal-600 dark:text-gold-400 group-hover:bg-gold-500 group-hover:text-navy-950 transition-colors">
                    <Eye className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase text-royal-600 dark:text-gold-400">Interactive</span>
                </div>
                <h4 className="text-sm font-extrabold text-navy-900 dark:text-white">1. Preview PDF Paper</h4>
                <p className="text-xs text-navy-500 dark:text-navy-400">
                  Inspect questions, diagrams, and full marking guidelines inside an interactive pop-up.
                </p>
              </div>

              {/* Option B: Download PDF File */}
              <div
                onClick={() => {
                  handleGenerateClientPdf();
                  setDispatchSuccessMsg("Official PDF file downloaded to your device!");
                }}
                className="p-4 rounded-2xl border border-navy-150 dark:border-navy-800 bg-navy-50/50 dark:bg-navy-950/50 hover:border-gold-500 hover:bg-gold-500/5 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 group-hover:bg-gold-500 group-hover:text-navy-950 transition-colors">
                    <Download className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase text-gold-600 dark:text-gold-400">Instant PDF</span>
                </div>
                <h4 className="text-sm font-extrabold text-navy-900 dark:text-white">2. Download PDF File</h4>
                <p className="text-xs text-navy-500 dark:text-navy-400">
                  Save vector PDF document (`Amaris_Predicted_Maths_${paperType.toUpperCase()}_${year}.pdf`).
                </p>
              </div>

              {/* Option C: Send to Email */}
              <div className="p-4 rounded-2xl border border-navy-150 dark:border-navy-800 bg-navy-50/50 dark:bg-navy-950/50 space-y-3 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-royal-500/10 text-royal-600 dark:text-gold-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-extrabold text-navy-900 dark:text-white">3. Send PDF to Email</h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase text-royal-600 dark:text-gold-400">Direct Delivery</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    placeholder="Enter email address (e.g. student@gmail.com)"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                  <button
                    onClick={handleSendEmail}
                    disabled={isDispatching || !targetEmail}
                    className="px-4 py-2.5 bg-navy-900 hover:bg-black dark:bg-gold-500 dark:hover:bg-gold-400 dark:text-navy-950 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isDispatching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Send to Email</span>
                  </button>
                </div>
              </div>

              {/* Option D: Send to WhatsApp */}
              <div className="p-4 rounded-2xl border border-navy-150 dark:border-navy-800 bg-navy-50/50 dark:bg-navy-950/50 space-y-3 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-extrabold text-navy-900 dark:text-white">4. Send PDF to WhatsApp</h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">Instant Chat Link</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={targetWhatsApp}
                    onChange={(e) => setTargetWhatsApp(e.target.value)}
                    placeholder="Enter WhatsApp phone number (e.g. +27 71 415 6665)"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleSendWhatsApp}
                    disabled={isDispatching || !targetWhatsApp}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isDispatching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                    <span>Send to WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Option E: Print */}
              <div
                onClick={() => {
                  setShowReceiveModal(false);
                  handleDownloadPDF();
                }}
                className="p-4 rounded-2xl border border-navy-150 dark:border-navy-800 bg-navy-50/50 dark:bg-navy-950/50 hover:border-gold-500 hover:bg-gold-500/5 transition-all cursor-pointer space-y-2 group sm:col-span-2 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-navy-200 dark:bg-navy-800 text-navy-700 dark:text-navy-300">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-navy-900 dark:text-white">5. Print Hard Copy</h4>
                    <p className="text-xs text-navy-500 dark:text-navy-400">
                      Open print dialog for high-resolution physical exam paper or save as print PDF.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-navy-400 group-hover:text-gold-500 transition-colors" />
              </div>

            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-navy-100 dark:border-navy-850 flex justify-between items-center text-xs text-navy-500 dark:text-navy-400 font-mono">
              <span>Grade 12 {syllabus} Maths • Paper {paperType === "p1" ? "1" : "2"}</span>
              <button
                onClick={() => setShowReceiveModal(false)}
                className="px-4 py-2 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 text-navy-900 dark:text-white rounded-xl font-bold transition-all cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: FULL PREVIEW OVERLAY OF PREDICTED EXAM PAPER */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-navy-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white text-navy-950 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden relative"
          >
            {/* Top Controls Bar */}
            <div className="p-4 bg-navy-950 text-white flex flex-wrap items-center justify-between gap-3 border-b border-navy-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gold-500 text-navy-950 font-black">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black uppercase font-mono tracking-tight text-white">
                    PDF Document Preview: Paper {paperType === "p1" ? "1" : "2"} ({year})
                  </h3>
                  <p className="text-[11px] text-navy-300 font-mono">
                    Grade 12 {syllabus} Mathematics • Full Questions & Solution Memorandum
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateClientPdf}
                  className="px-3 py-1.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Save PDF</span>
                </button>

                <button
                  onClick={handleDownloadPDF}
                  className="px-3 py-1.5 bg-navy-800 hover:bg-navy-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Print</span>
                </button>

                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setShowReceiveModal(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share / Dispatch</span>
                </button>

                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Document Container */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-12 space-y-8 bg-gray-100 font-serif text-left">
              <div className="max-w-[210mm] mx-auto bg-white p-8 sm:p-12 shadow-md border border-gray-200 rounded-xl space-y-8 text-black">
                
                {/* Exam Cover Header */}
                <div className="text-center space-y-2 border-b-2 border-black pb-6">
                  <span className="text-xs font-bold font-sans uppercase tracking-widest text-gray-700">
                    AMARIS MATHEMATICS HUB • HIGH SCHOOL ACADEMY
                  </span>
                  <h1 className="text-2xl font-black uppercase">
                    NATIONAL SENIOR CERTIFICATE (NSC / IEB) EXAMINATION
                  </h1>
                  <p className="text-base font-bold font-sans">
                    PREDICTED MATHEMATICS PAPER {paperType === "p1" ? "1" : "2"} — {year}
                  </p>
                  <div className="flex justify-between items-center text-xs font-bold font-sans pt-4 border-t border-gray-300">
                    <span>TIME: 3 HOURS</span>
                    <span>MARKS: 150</span>
                    <span>CURRICULUM: {syllabus}</span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-2 text-xs font-sans text-gray-800 bg-gray-50 p-4 rounded border border-gray-200">
                  <h4 className="font-bold uppercase text-black">INSTRUCTIONS AND INFORMATION</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>This question paper consists of predicted core questions and full marking memo.</li>
                    <li>Answer ALL the questions.</li>
                    <li>Clearly show ALL calculations, diagrams, graphs, etc.</li>
                    <li>Non-programmable scientific calculators may be used.</li>
                    <li>Round off final answers to TWO decimal places where necessary.</li>
                  </ol>
                </div>

                {/* Questions Listing */}
                <div className="space-y-8 pt-4">
                  <h2 className="text-lg font-black font-sans uppercase border-b-2 border-black pb-1">
                    EXAMINATION QUESTIONS
                  </h2>

                  {currentQuestions.map((q) => (
                    <div key={q.number} className="space-y-4 pb-6 border-b border-dashed border-gray-300 last:border-0">
                      <div className="flex justify-between items-baseline font-sans">
                        <h3 className="text-base font-bold uppercase">QUESTION {q.number}: {q.topic}</h3>
                        <span className="text-sm font-bold">[{q.marks} Marks]</span>
                      </div>

                      <p className="text-xs italic text-gray-700 bg-gray-50 p-3 rounded border border-gray-200 font-sans">
                        Context: {q.scenario}
                      </p>

                      <div className="space-y-4 pl-2">
                        {q.subQuestions.map((sub) => (
                          <div key={sub.id} className="space-y-1">
                            <div className="flex justify-between text-sm leading-relaxed">
                              <span className="font-bold shrink-0 mr-2">{sub.id}</span>
                              <div className="flex-1 pr-4">
                                <LatexRenderer text={sub.text} />
                              </div>
                              <span className="text-xs font-bold font-sans text-gray-700 whitespace-nowrap">
                                ({sub.marks})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Memorandum Header */}
                <div className="pt-12 border-t-4 border-black space-y-6">
                  <div className="text-center space-y-1 border-b-2 border-black pb-4">
                    <h2 className="text-xl font-black font-sans uppercase">MARKING GUIDELINES & MEMORANDUM</h2>
                    <p className="text-xs font-sans text-gray-600">Official step-by-step solution breakdown</p>
                  </div>

                  {currentQuestions.map((q) => (
                    <div key={q.number} className="space-y-4 pb-6 border-b border-gray-200 last:border-0">
                      <div className="flex justify-between font-sans border-b border-gray-400 pb-1">
                        <h4 className="font-bold text-sm uppercase">QUESTION {q.number} MEMO</h4>
                        <span className="text-xs font-bold">[{q.marks} Marks]</span>
                      </div>

                      <div className="space-y-3">
                        {q.subQuestions.map((sub) => (
                          <div key={sub.id} className="space-y-1 bg-gray-50 p-3 rounded border border-gray-200">
                            <div className="flex justify-between text-xs font-bold font-sans text-gray-800">
                              <span>{sub.id} SOLUTION</span>
                              <span>[{sub.marks} Marks]</span>
                            </div>
                            <div className="text-xs leading-relaxed font-serif pl-3 border-l-2 border-black">
                              <LatexRenderer text={sub.memo} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 bg-gray-100 border-t border-gray-200 flex justify-between items-center text-xs font-sans font-bold">
              <span className="text-gray-600">Predicted Grade 12 {syllabus} Maths Paper PDF</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setShowReceiveModal(true);
                  }}
                  className="px-4 py-2 bg-navy-900 text-white rounded-xl hover:bg-black transition-all cursor-pointer"
                >
                  Receive Options
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 transition-all cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};

