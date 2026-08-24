import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  TrendingUp,
  Users,
  CreditCard,
  Coins,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  RefreshCw,
  Search,
  Percent,
  ChevronRight,
  Sparkles,
  Award,
  BookOpen
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { dbAPI, dbAuth } from "../lib/db";
import { Profile, Payment, Booking } from "../types";

export const ExecutiveOperationsDashboard: React.FC = () => {
  // Live State
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // Interactive Simulation state
  const [simName, setSimName] = useState("");
  const [simSurname, setSimSurname] = useState("");
  const [simAmount, setSimAmount] = useState("450");
  const [simMethod, setSimMethod] = useState("PayFast");
  const [simStatus, setSimStatus] = useState<"successful" | "failed" | "pending">("successful");
  
  // Student registration simulation
  const [regName, setRegName] = useState("");
  const [regSurname, setRegSurname] = useState("");
  const [regGrade, setRegGrade] = useState("Grade 12");
  const [regSchool, setRegSchool] = useState("");

  // Filter
  const [timePeriod, setTimePeriod] = useState<"today" | "7days" | "all">("all");

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = () => {
    setProfiles(dbAPI.getAllProfiles());
    setPayments(dbAPI.getAllPayments());
    setBookings(dbAPI.getAllBookings());
  };

  useEffect(() => {
    loadData();
    // Set up brief polling or updates
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Simulations
  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName || !simAmount) {
      triggerToast("⚠️ Please enter a student name and amount");
      return;
    }

    // Step 1: Find or Register a student profile to attach the payment
    const existingProfiles = dbAPI.getAllProfiles();
    let student = existingProfiles.find(
      p => p.first_name.toLowerCase() === simName.toLowerCase() && p.role === "student"
    );

    if (!student) {
      // Create a temporary student
      student = dbAuth.register({
        first_name: simName,
        surname: simSurname || "Simulated",
        email: `${simName.toLowerCase()}@simulated.co.za`,
        phone: "072 000 0000",
        whatsapp_number: "072 000 0000",
        province: "Gauteng",
        school: "Simulation High School",
        grade: "Grade 12",
        role: "student"
      });
    }

    // Step 2: Create payment
    const amountVal = parseFloat(simAmount) || 350;
    const newPayment = dbAPI.createPayment({
      booking_id: `book-sim-${Date.now()}`,
      student_id: student.id,
      amount: amountVal,
      currency: "ZAR",
      payment_method: simMethod,
      transaction_id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      status: simStatus
    });

    // Step 3: Add to Activity Log
    const statusEmoji = simStatus === "successful" ? "✅" : simStatus === "failed" ? "❌" : "⏳";
    dbAPI.addActivityLog({
      user_name: student.first_name,
      action: "EFT Gateway Simulator",
      details: `${statusEmoji} ${simMethod} transaction of R${amountVal} for ${student.first_name} ${student.surname} is ${simStatus.toUpperCase()}`,
      type: "payment"
    });

    // Refresh
    loadData();
    triggerToast(`💰 Payment of R${amountVal} simulated successfully for ${student.first_name}!`);
    setSimName("");
    setSimSurname("");
  };

  const handleSimulateRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regSurname) {
      triggerToast("⚠️ Please provide a name and surname");
      return;
    }

    const newProfile = dbAuth.register({
      first_name: regName,
      surname: regSurname,
      email: `${regName.toLowerCase()}.${regSurname.toLowerCase()}@amh-school.co.za`,
      phone: "083 " + Math.floor(1000000 + Math.random() * 9000000),
      whatsapp_number: "083 " + Math.floor(1000000 + Math.random() * 9000000),
      province: "Gauteng",
      school: regSchool || "Pretoria High School",
      grade: regGrade,
      role: "student"
    });

    dbAPI.addActivityLog({
      user_name: regName,
      action: "New Student Matric Upgrade Enrolled",
      details: `${regName} ${regSurname} (${regGrade}) registered successfully. School: ${regSchool || "N/A"}.`,
      type: "booking"
    });

    loadData();
    triggerToast(`🎉 Registered ${regName} ${regSurname} successfully into ${regGrade}!`);
    setRegName("");
    setRegSurname("");
    setRegSchool("");
  };

  // DATA ANALYTICS & MATHS

  // Filtered Payments
  const todayStr = new Date().toISOString().split("T")[0];
  const filteredPayments = payments.filter(p => {
    if (timePeriod === "today") {
      return p.created_at === todayStr;
    } else if (timePeriod === "7days") {
      const pDate = new Date(p.created_at);
      const diffTime = Math.abs(new Date().getTime() - pDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }
    return true; // "all"
  });

  // Calculate Metrics
  const todayRevenue = payments
    .filter(p => p.status === "successful" && p.created_at === todayStr)
    .reduce((sum, p) => sum + p.amount, 0);

  const filteredRevenue = filteredPayments
    .filter(p => p.status === "successful")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPaymentsCount = filteredPayments.length;
  const successfulPaymentsCount = filteredPayments.filter(p => p.status === "successful").length;
  const failedPaymentsCount = filteredPayments.filter(p => p.status === "failed").length;
  const pendingPaymentsCount = filteredPayments.filter(p => p.status === "pending").length;

  const successRate = totalPaymentsCount > 0 
    ? Math.round((successfulPaymentsCount / totalPaymentsCount) * 100) 
    : 100;

  // Active Students (by role === 'student')
  const activeStudents = profiles.filter(p => p.role === "student");
  const studentCount = activeStudents.length;

  // Grade distributions
  const gradeSplit: Record<string, number> = {};
  activeStudents.forEach(s => {
    const g = s.grade || "Grade 12";
    gradeSplit[g] = (gradeSplit[g] || 0) + 1;
  });

  const studentGradeData = Object.keys(gradeSplit).map(g => ({
    grade: g,
    Students: gradeSplit[g]
  }));

  // Fallback if empty
  const finalStudentGradeData = studentGradeData.length > 0 ? studentGradeData : [
    { grade: "Grade 10", Students: 12 },
    { grade: "Grade 11", Students: 28 },
    { grade: "Grade 12", Students: 54 },
    { grade: "Matric Upgrade", Students: 39 },
    { grade: "AP Maths", Students: 15 }
  ];

  // Payment method distributions
  const methodSplit: Record<string, number> = {};
  filteredPayments.forEach(p => {
    if (p.status === "successful") {
      methodSplit[p.payment_method] = (methodSplit[p.payment_method] || 0) + p.amount;
    }
  });
  const paymentMethodData = Object.keys(methodSplit).map(method => ({
    name: method,
    value: methodSplit[method]
  }));

  const finalPaymentMethodData = paymentMethodData.length > 0 ? paymentMethodData : [
    { name: "PayFast", value: 4500 },
    { name: "Instant EFT", value: 3200 },
    { name: "EFT Bank", value: 1800 },
    { name: "Credit Card", value: 1200 }
  ];

  // Accumulated Daily Revenue Curve
  const revenueHistoryMap: Record<string, number> = {};
  payments
    .filter(p => p.status === "successful")
    .forEach(p => {
      revenueHistoryMap[p.created_at] = (revenueHistoryMap[p.created_at] || 0) + p.amount;
    });

  const sortedDates = Object.keys(revenueHistoryMap).sort();
  let cumulative = 0;
  const revenueTrendData = sortedDates.map(date => {
    cumulative += revenueHistoryMap[date];
    return {
      date: new Date(date).toLocaleDateString("en-ZA", { month: "short", day: "numeric" }),
      "Daily Rev": revenueHistoryMap[date],
      "Cumulative Rev": cumulative
    };
  });

  const finalRevenueTrendData = revenueTrendData.length > 0 ? revenueTrendData : [
    { date: "Jul 10", "Daily Rev": 1200, "Cumulative Rev": 1200 },
    { date: "Jul 11", "Daily Rev": 1500, "Cumulative Rev": 2700 },
    { date: "Jul 12", "Daily Rev": 800, "Cumulative Rev": 3500 },
    { date: "Jul 13", "Daily Rev": 2200, "Cumulative Rev": 5700 },
    { date: "Jul 14", "Daily Rev": 1100, "Cumulative Rev": 6800 },
    { date: "Jul 15", "Daily Rev": 3400, "Cumulative Rev": 10200 },
    { date: "Jul 16", "Daily Rev": 1950, "Cumulative Rev": 12150 },
    { date: "Jul 17", "Daily Rev": 2500, "Cumulative Rev": 14650 },
    { date: "Jul 18", "Daily Rev": todayRevenue || 1200, "Cumulative Rev": 14650 + todayRevenue }
  ];

  // Payment status distribution (successful, failed, pending)
  const paymentStatusData = [
    { name: "Successful", value: successfulPaymentsCount || 1, color: "#10b981" },
    { name: "Pending Verification", value: pendingPaymentsCount || 0, color: "#f59e0b" },
    { name: "Failed Checkout", value: failedPaymentsCount || 0, color: "#ef4444" }
  ].filter(p => p.value > 0);

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="space-y-6 text-left relative animate-fadeIn" id="amh-executive-operations-dashboard">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-navy-950 border border-gold-400 text-gold-400 font-mono text-xs p-4 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce" id="executive-toast-alert">
          <Sparkles className="w-4 h-4 text-gold-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="executive-header-panel">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded border border-gold-400/20">
              Executive View
            </span>
            <span className="bg-royal-500/10 text-royal-600 dark:text-royal-400 font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded border border-royal-400/20">
              Live BI Engine
            </span>
          </div>
          <h2 className="text-xl font-black text-navy-900 dark:text-white flex items-center gap-2 font-display">
            <TrendingUp className="w-5 h-5 text-gold-500" />
            Executive Operations Dashboard
          </h2>
          <p className="text-xs text-navy-500 dark:text-navy-400 font-sans">
            Real-time financial flows, Matric Upgrade student onboarding rates, and EFT checkout verification.
          </p>
        </div>

        {/* Time period controller */}
        <div className="flex bg-navy-50 dark:bg-navy-950 p-1 rounded-xl border border-navy-100 dark:border-navy-850" id="executive-time-period-selector">
          {[
            { id: "today", label: "Today" },
            { id: "7days", label: "7 Days" },
            { id: "all", label: "All Time" }
          ].map(period => (
            <button
              key={period.id}
              id={`executive-time-period-btn-${period.id}`}
              onClick={() => setTimePeriod(period.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-black uppercase transition-all cursor-pointer ${
                timePeriod === period.id
                  ? "bg-royal-600 text-white shadow-sm"
                  : "text-navy-500 dark:text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-900"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Business KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="executive-kpi-row">
        {/* Metric 1: Today's Revenue */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/25 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden" id="kpi-card-today-billings">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
            <Coins className="w-32 h-32 text-emerald-500" />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <span>Today's Billings</span>
            <Coins className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-navy-900 dark:text-white font-mono flex items-baseline gap-1">
            <span className="text-sm font-bold text-navy-400 dark:text-navy-500">R</span>
            {todayRevenue.toLocaleString("en-ZA")}
          </div>
          <div className="text-[10px] text-navy-500 dark:text-navy-400">
            Real-time EFT & PayFast settlement volume.
          </div>
        </div>

        {/* Metric 2: Enrolled Student Count */}
        <div className="bg-gradient-to-br from-royal-500/10 to-indigo-500/5 border border-royal-500/25 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden" id="kpi-card-enrolled-pupils">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
            <Users className="w-32 h-32 text-royal-500" />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono font-black text-royal-600 dark:text-royal-400 uppercase tracking-wider">
            <span>Matric upgrade pupils</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-navy-900 dark:text-white font-mono">
            {studentCount}
          </div>
          <div className="text-[10px] text-navy-500 dark:text-navy-400">
            Enrolled high-school CAPS/IEB users.
          </div>
        </div>

        {/* Metric 3: Payment Success Rate */}
        <div className="bg-gradient-to-br from-amber-500/10 to-gold-500/5 border border-amber-500/25 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden" id="kpi-card-success-rate">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
            <Percent className="w-32 h-32 text-amber-500" />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono font-black text-amber-600 dark:text-gold-400 uppercase tracking-wider">
            <span>Payment Success Rate</span>
            <Percent className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-navy-900 dark:text-white font-mono flex items-baseline gap-1">
            {successRate}%
          </div>
          <div className="text-[10px] text-navy-500 dark:text-navy-400">
            Successful callbacks over total attempts.
          </div>
        </div>

        {/* Metric 4: Total Period Revenue */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/25 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden" id="kpi-card-period-revenue">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
            <Activity className="w-32 h-32 text-purple-500" />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            <span>Selected Period Billing</span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-navy-900 dark:text-white font-mono flex items-baseline gap-1">
            <span className="text-sm font-bold text-navy-400 dark:text-navy-500">R</span>
            {filteredRevenue.toLocaleString("en-ZA")}
          </div>
          <div className="text-[10px] text-navy-500 dark:text-navy-400">
            Filtered billing total for period: {timePeriod.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Main Analytical Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="executive-chart-row-1">
        {/* Chart 1: Accumulated Revenue Curve */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-4 text-left" id="chart-card-revenue-ingress">
          <div className="flex justify-between items-center border-b border-navy-100 dark:border-navy-800 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-mono font-black text-navy-400 uppercase tracking-widest flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-royal-500" />
                Financial Ingress & Curve
              </h3>
              <p className="text-sm font-black text-navy-900 dark:text-white">Hourly/Daily Accumulated Revenue (ZAR)</p>
            </div>
            <div className="px-2.5 py-1 bg-royal-100 dark:bg-royal-950/40 rounded-full text-royal-700 dark:text-royal-300 font-mono text-[9px] font-black uppercase">
              Cumulative Growth
            </div>
          </div>
          
          <div className="h-72" id="accumulated-revenue-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={finalRevenueTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-navy-100 dark:stroke-navy-800/50" />
                <XAxis dataKey="date" className="text-[10px] font-mono text-navy-400" />
                <YAxis className="text-[10px] font-mono text-navy-400" />
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px", background: "#0b1329", borderColor: "#1e293b", color: "#fff" }} />
                <Legend wrapperStyle={{ fontSize: "10px", fontFamily: "monospace" }} />
                <Area type="monotone" dataKey="Cumulative Rev" name="Cumulative Total (R)" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCumulative)" />
                <Area type="monotone" dataKey="Daily Rev" name="Daily Cash (R)" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#colorDaily)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Payment Status Pie chart */}
        <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-4 text-left" id="chart-card-checkout-proportion">
          <div className="flex justify-between items-center border-b border-navy-100 dark:border-navy-800 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-mono font-black text-navy-400 uppercase tracking-widest flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-gold-500" />
                Checkout Gateway States
              </h3>
              <p className="text-sm font-black text-navy-900 dark:text-white">Verification Proportion</p>
            </div>
          </div>

          <div className="h-56 flex justify-center items-center relative" id="payment-status-pie-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentStatusData.map((entry, index) => {
                    const colorMap: Record<string, string> = {
                      "Successful": "#10b981",
                      "Pending Verification": "#f59e0b",
                      "Failed Checkout": "#ef4444"
                    };
                    return <Cell key={`cell-${index}`} fill={colorMap[entry.name] || COLORS[index % COLORS.length]} />;
                  })}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Transactions`]} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Inner text for KPI feel */}
            <div className="absolute flex flex-col items-center justify-center pointer-events-none" id="payment-status-attempts-center">
              <span className="text-xl font-mono font-black text-navy-900 dark:text-white">
                {totalPaymentsCount}
              </span>
              <span className="text-[9px] font-mono text-navy-400 uppercase font-black">
                Attempts
              </span>
            </div>
          </div>

          {/* Custom Legend */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-navy-50 dark:border-navy-800/60 text-[10px] font-mono" id="payment-status-custom-legend">
            <div className="space-y-1 text-center">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block mx-auto"></span>
              <p className="text-emerald-600 font-extrabold">{successfulPaymentsCount}</p>
              <p className="text-navy-400 text-[9px] leading-none">Success</p>
            </div>
            <div className="space-y-1 text-center">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block mx-auto"></span>
              <p className="text-amber-500 font-extrabold">{pendingPaymentsCount}</p>
              <p className="text-navy-400 text-[9px] leading-none">Pending</p>
            </div>
            <div className="space-y-1 text-center">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block mx-auto"></span>
              <p className="text-rose-500 font-extrabold">{failedPaymentsCount}</p>
              <p className="text-navy-400 text-[9px] leading-none">Failed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Row 2: Grades Distribution & Interactive Command Center Simulators */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="executive-chart-row-2">
        {/* Chart 3: Registered Student Distribution by Grade */}
        <div className="lg:col-span-4 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-4 text-left" id="chart-card-enrollments-by-grade">
          <div className="flex justify-between items-center border-b border-navy-100 dark:border-navy-800 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-mono font-black text-navy-400 uppercase tracking-widest flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-royal-500" />
                Enrollments by Grade
              </h3>
              <p className="text-sm font-black text-navy-900 dark:text-white">Matric & CAPS Syllabus Segment</p>
            </div>
          </div>

          <div className="h-64" id="student-grades-bar-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finalStudentGradeData} margin={{ left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-navy-100 dark:stroke-navy-800/40" />
                <XAxis dataKey="grade" className="text-[9px] font-mono text-navy-400" />
                <YAxis className="text-[9px] font-mono text-navy-400" />
                <Tooltip />
                <Bar dataKey="Students" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {finalStudentGradeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#3b82f6" : "#eab308"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interactive Simulations Hub */}
        <div className="lg:col-span-8 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-6 text-left" id="simulation-controls-hub">
          <div className="flex justify-between items-center border-b border-navy-100 dark:border-navy-800 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-mono font-black text-navy-400 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-royal-500 animate-pulse" />
                Real-Time Simulation & Data Binding Controls
              </h3>
              <p className="text-sm font-black text-navy-900 dark:text-white">Trigger immediate visual metric updates on the fly.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PayFast/EFT Transaction Simulator */}
            <form onSubmit={handleSimulatePayment} className="space-y-3 bg-navy-50/50 dark:bg-navy-950/40 border border-navy-100 dark:border-navy-850 p-4 rounded-2xl relative" id="sim-payfast-eft-gateway">
              <div className="flex items-center gap-1.5 text-xs font-mono font-black text-navy-700 dark:text-white uppercase tracking-wider border-b border-navy-100 dark:border-navy-850 pb-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                Instant EFT Gateway Simulator
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-black text-navy-500 uppercase">First Name</label>
                  <input
                    type="text"
                    required
                    id="sim-payment-first-name"
                    placeholder="e.g. Sipho"
                    value={simName}
                    onChange={e => setSimName(e.target.value)}
                    className="w-full bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 p-2 text-xs rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-black text-navy-500 uppercase">Surname</label>
                  <input
                    type="text"
                    id="sim-payment-surname"
                    placeholder="e.g. Ndlovu"
                    value={simSurname}
                    onChange={e => setSimSurname(e.target.value)}
                    className="w-full bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 p-2 text-xs rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-black text-navy-500 uppercase">Amount (ZAR)</label>
                  <input
                    type="number"
                    required
                    id="sim-payment-amount"
                    placeholder="e.g. 1100"
                    value={simAmount}
                    onChange={e => setSimAmount(e.target.value)}
                    className="w-full bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 p-2 text-xs rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-black text-navy-500 uppercase">Method</label>
                  <select
                    id="sim-payment-method"
                    value={simMethod}
                    onChange={e => setSimMethod(e.target.value)}
                    className="w-full bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 p-2 text-xs rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  >
                    <option value="PayFast">PayFast gateway</option>
                    <option value="Instant EFT">Ozow Instant EFT</option>
                    <option value="Card">Visa/Mastercard</option>
                    <option value="EFT Bank">FNB Direct Bank EFT</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-black text-navy-500 uppercase block">Callback Status</label>
                <div className="grid grid-cols-3 gap-1" id="sim-payment-status-selector">
                  {(["successful", "pending", "failed"] as const).map(status => {
                    const styleMap: Record<string, string> = {
                      successful: "border-emerald-500 text-emerald-600 hover:bg-emerald-500/10",
                      pending: "border-amber-500 text-amber-500 hover:bg-amber-500/10",
                      failed: "border-red-500 text-red-500 hover:bg-red-500/10"
                    };
                    const activeStyleMap: Record<string, string> = {
                      successful: "bg-emerald-500 text-white border-emerald-500",
                      pending: "bg-amber-500 text-white border-amber-500",
                      failed: "bg-red-500 text-white border-red-500"
                    };
                    return (
                      <button
                        key={status}
                        id={`sim-payfast-status-btn-${status}`}
                        type="button"
                        onClick={() => setSimStatus(status)}
                        className={`border py-1.5 px-1 rounded-xl text-[9px] font-mono font-black uppercase text-center transition-all cursor-pointer ${
                          simStatus === status
                            ? activeStyleMap[status]
                            : `border-navy-200 dark:border-navy-800 ${styleMap[status]}`
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                id="sim-payfast-submit-btn"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-black text-xs py-2 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Fire Simulated Payment
              </button>
            </form>

            {/* Student Registration Simulator */}
            <form onSubmit={handleSimulateRegistration} className="space-y-3 bg-navy-50/50 dark:bg-navy-950/40 border border-navy-100 dark:border-navy-850 p-4 rounded-2xl" id="sim-student-registration">
              <div className="flex items-center gap-1.5 text-xs font-mono font-black text-navy-700 dark:text-white uppercase tracking-wider border-b border-navy-100 dark:border-navy-850 pb-2">
                <Users className="w-4 h-4 text-royal-500" />
                Syllabus Enrollment Simulator
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-black text-navy-500 uppercase">First Name</label>
                  <input
                    type="text"
                    required
                    id="sim-reg-first-name"
                    placeholder="e.g. Mpho"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    className="w-full bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 p-2 text-xs rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-black text-navy-500 uppercase">Surname</label>
                  <input
                    type="text"
                    required
                    id="sim-reg-surname"
                    placeholder="e.g. Mokoena"
                    value={regSurname}
                    onChange={e => setRegSurname(e.target.value)}
                    className="w-full bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 p-2 text-xs rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-black text-navy-500 uppercase">Matric / CAPS Grade</label>
                  <select
                    id="sim-reg-grade"
                    value={regGrade}
                    onChange={e => setRegGrade(e.target.value)}
                    className="w-full bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 p-2 text-xs rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  >
                    <option value="Grade 10">Grade 10 (CAPS)</option>
                    <option value="Grade 11">Grade 11 (CAPS)</option>
                    <option value="Grade 12">Grade 12 (CAPS)</option>
                    <option value="Matric Upgrade">Matric Upgrade (IEB/NSC)</option>
                    <option value="AP Maths">Advanced Programme Maths</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-black text-navy-500 uppercase">School / College</label>
                  <input
                    type="text"
                    id="sim-reg-school"
                    placeholder="e.g. St Albans College"
                    value={regSchool}
                    onChange={e => setRegSchool(e.target.value)}
                    className="w-full bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 p-2 text-xs rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="sim-student-register-btn"
                className="w-full bg-royal-600 hover:bg-royal-700 text-white font-mono font-black text-xs py-2 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-auto"
              >
                <Plus className="w-4 h-4" />
                Register IEB/CAPS Student
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Live Transaction Ledger & Verification Auditing */}
      <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-5 shadow-sm text-left" id="transaction-ledger-card">
        <div className="flex justify-between items-center border-b border-navy-100 dark:border-navy-800 pb-3 mb-4">
          <div className="space-y-0.5">
            <h3 className="text-xs font-mono font-black text-navy-400 uppercase tracking-widest flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-royal-500" />
              PayFast EFT Callback Audit Outbox
            </h3>
            <p className="text-sm font-black text-navy-900 dark:text-white">Recent payment gateways audit trails</p>
          </div>
          <button
            onClick={loadData}
            id="transaction-ledger-refresh-btn"
            className="p-1.5 hover:bg-navy-50 dark:hover:bg-navy-800 text-navy-500 dark:text-navy-400 rounded-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs" id="transaction-ledger-table">
            <thead>
              <tr className="border-b border-navy-100 dark:border-navy-800 text-[10px] font-mono font-black text-navy-400 uppercase">
                <th className="py-2.5 px-3">Transaction ID</th>
                <th className="py-2.5 px-3">Student / Client</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3 text-right">Amount (ZAR)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.slice(-6).reverse().map((pay) => {
                const studentProfile = profiles.find(p => p.id === pay.student_id);
                const studentName = studentProfile 
                  ? `${studentProfile.first_name} ${studentProfile.surname}`
                  : "Guest Student";

                return (
                  <tr key={pay.id} className="border-b border-navy-50 dark:border-navy-850 hover:bg-navy-50/50 dark:hover:bg-navy-950/20 transition-all font-mono">
                    <td className="py-3 px-3 text-royal-500 dark:text-royal-400 font-bold">{pay.transaction_id}</td>
                    <td className="py-3 px-3 font-sans font-bold text-navy-800 dark:text-white">{studentName}</td>
                    <td className="py-3 px-3 text-navy-400">{pay.created_at}</td>
                    <td className="py-3 px-3 text-navy-500 dark:text-navy-400">{pay.payment_method}</td>
                    <td className="py-3 px-3 text-right font-extrabold text-navy-900 dark:text-white">R{pay.amount}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase inline-block ${
                        pay.status === "successful"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : pay.status === "pending"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}>
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-navy-400 font-mono">
                    No transactions registered during this filter timeframe. Use the simulators above to generate transactions!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
