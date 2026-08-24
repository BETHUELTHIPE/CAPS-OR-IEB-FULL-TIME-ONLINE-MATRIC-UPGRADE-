import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, ChevronRight, Calendar, Clock, AlertCircle, 
  Check, Lock, Sparkles, HelpCircle, RefreshCw
} from "lucide-react";
import { Booking } from "../types";
import { dbAPI } from "../lib/db";

// Exact same slot definition used across the application
export const TIME_SLOTS = [
  "08:30 - 09:30",
  "10:00 - 11:00",
  "11:30 - 12:30",
  "13:30 - 14:30",
  "15:00 - 16:00",
  "16:30 - 17:30",
  "18:00 - 19:00"
];

// Helper to determine slot status
export const getSlotStatus = (dateStr: string, slot: string, allBookings: Booking[]) => {
  // 1. Check if there is an active booking in our database
  const hasDbBooking = allBookings.some(
    b => b.lesson_date === dateStr && b.lesson_time === slot && b.status !== "cancelled"
  );
  if (hasDbBooking) return "booked";

  // 2. Fallback to the same deterministic simulated schedule conflict
  let sum = 0;
  for (let i = 0; i < dateStr.length; i++) {
    sum += dateStr.charCodeAt(i);
  }
  const slotIdx = TIME_SLOTS.indexOf(slot);
  // Mark slot as booked pseudo-randomly for consistent simulation
  const isSimulatedBooked = (sum + slotIdx) % 4 === 0;
  return isSimulatedBooked ? "booked" : "available";
};

interface TutorCalendarProps {
  onSelectSlot?: (date: string, slot: string) => void;
  selectedDate?: string;
  selectedSlot?: string | null;
  className?: string;
  tutorName?: string;
  tutorTitle?: string;
  tutorAvatar?: string;
  tutorSyllabus?: string[];
}

export const TutorCalendar: React.FC<TutorCalendarProps> = ({
  onSelectSlot,
  selectedDate: propSelectedDate,
  selectedSlot: propSelectedSlot,
  className = "",
  tutorName = "Bethuel Moukangwe",
  tutorTitle = "Head Mathematics Coach",
  tutorAvatar,
  tutorSyllabus = ["CAPS", "IEB"]
}) => {
  // Current time context is 2026-07-09, initialize calendar to July 2026
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed, so 6 is July
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync prop selections
  useEffect(() => {
    if (propSelectedDate) {
      setSelectedDate(propSelectedDate);
      const parts = propSelectedDate.split("-");
      if (parts.length === 3) {
        setCurrentYear(parseInt(parts[0]));
        setCurrentMonth(parseInt(parts[1]) - 1);
      }
    } else {
      // Default selected date: tomorrow or today
      const todayStr = "2026-07-09";
      setSelectedDate(todayStr);
    }
  }, [propSelectedDate]);

  useEffect(() => {
    if (propSelectedSlot !== undefined) {
      setSelectedTimeSlot(propSelectedSlot);
    }
  }, [propSelectedSlot]);

  // Load bookings
  const loadBookings = () => {
    try {
      const b = dbAPI.getAllBookings();
      setBookings(b);
    } catch (err) {
      console.error("Error loading bookings for calendar:", err);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadBookings();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    // Prevent going before July 2026 to stay in bounds
    if (currentYear === 2026 && currentMonth <= 6) return;
    
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Calendar math
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // Sunday=0, Monday=1, ...
  
  // Adjust so Monday is 0
  const adjustedFirstDayIndex = (firstDayIndex + 6) % 7;

  // Generate calendar cells
  const dayCells: { day: number | null; dateString: string | null }[] = [];
  
  // Empty offset slots
  for (let i = 0; i < adjustedFirstDayIndex; i++) {
    dayCells.push({ day: null, dateString: null });
  }

  // Active days
  for (let day = 1; day <= daysInMonth; day++) {
    const monthStr = String(currentMonth + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const dateString = `${currentYear}-${monthStr}-${dayStr}`;
    dayCells.push({ day, dateString });
  }

  // Fill up grid with trailing cells to match 6 rows (42 items total)
  const totalGridCells = 42;
  while (dayCells.length < totalGridCells) {
    dayCells.push({ day: null, dateString: null });
  }

  // Helper to get summary metrics for a date string
  const getDayMetrics = (dateStr: string) => {
    let availableCount = 0;
    let bookedCount = 0;
    
    TIME_SLOTS.forEach(slot => {
      const status = getSlotStatus(dateStr, slot, bookings);
      if (status === "available") availableCount++;
      else bookedCount++;
    });

    return { availableCount, bookedCount };
  };

  const selectedDateMetrics = selectedDate ? getDayMetrics(selectedDate) : { availableCount: 0, bookedCount: 0 };

  const handleDaySelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTimeSlot(null); // Reset selected slot for new day
  };

  const handleSlotSelect = (slot: string) => {
    setSelectedTimeSlot(slot);
    if (onSelectSlot && selectedDate) {
      onSelectSlot(selectedDate, slot);
    }
  };

  // Check if date is in the past relative to 2026-07-09
  const isDatePast = (dateStr: string) => {
    return dateStr < "2026-07-09";
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-12 gap-6 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-5 sm:p-6 shadow-sm ${className}`}>
      
      {/* LEFT PANEL: The Calendar Month Grid (7 cols) */}
      <div className="md:col-span-7 space-y-4 text-left">
        <div className="flex justify-between items-center pb-2 border-b border-navy-100 dark:border-navy-800">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-mono font-bold text-royal-600 dark:text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {tutorName}'s Availability
              </h4>
              {tutorSyllabus && tutorSyllabus.length > 0 && (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-royal-100 dark:bg-royal-950 text-royal-700 dark:text-gold-400 rounded">
                  {tutorSyllabus.join(" / ")}
                </span>
              )}
            </div>
            <h3 className="text-lg font-black text-navy-900 dark:text-white">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleRefresh}
              title="Refresh calendar slots"
              className={`p-1.5 hover:bg-navy-50 dark:hover:bg-navy-800 text-navy-500 rounded-lg transition-all ${isRefreshing ? "animate-spin" : ""}`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentYear === 2026 && currentMonth <= 6}
              onClick={handlePrevMonth}
              className="p-1.5 border border-navy-150 dark:border-navy-800 bg-white dark:bg-navy-950 text-navy-700 dark:text-navy-300 rounded-lg hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 border border-navy-150 dark:border-navy-800 bg-white dark:bg-navy-950 text-navy-700 dark:text-navy-300 rounded-lg hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of the week label row */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono font-black text-navy-400 uppercase tracking-wider">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>

        {/* Days grid layout */}
        <div className="grid grid-cols-7 gap-1.5">
          {dayCells.map((cell, idx) => {
            if (!cell.day || !cell.dateString) {
              return (
                <div 
                  key={`empty-${idx}`} 
                  className="aspect-square bg-navy-50/20 dark:bg-navy-950/5 rounded-xl border border-transparent" 
                />
              );
            }

            const isSelected = selectedDate === cell.dateString;
            const isPast = isDatePast(cell.dateString);
            const { availableCount, bookedCount } = getDayMetrics(cell.dateString);
            
            // Color metrics
            let bgClass = "bg-white dark:bg-navy-950 hover:border-royal-300 dark:hover:border-navy-700 border-navy-150 dark:border-navy-800";
            let textClass = "text-navy-900 dark:text-white";
            let borderClass = "border";

            if (isPast) {
              bgClass = "bg-navy-50/40 dark:bg-navy-950/10 opacity-40 cursor-not-allowed";
              textClass = "text-navy-300 dark:text-navy-600 line-through";
              borderClass = "border border-dashed border-navy-100 dark:border-navy-900";
            } else if (isSelected) {
              bgClass = "bg-royal-600 dark:bg-gold-500 text-white dark:text-navy-950 font-black scale-[1.03] shadow";
              textClass = "text-white dark:text-navy-950";
              borderClass = "border border-royal-600 dark:border-gold-500";
            } else if (availableCount === 0) {
              // Fully Booked
              bgClass = "bg-red-500/5 dark:bg-red-500/10 border-red-200 dark:border-red-950/40 hover:bg-red-500/10";
              borderClass = "border";
            } else if (bookedCount > 0) {
              // Partial slots booked
              bgClass = "bg-amber-500/5 dark:bg-amber-500/10 border-amber-100 dark:border-amber-950/40 hover:bg-amber-500/10";
              borderClass = "border";
            } else {
              // 100% Free
              bgClass = "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-950/40 hover:bg-emerald-500/10";
              borderClass = "border";
            }

            return (
              <motion.button
                key={`day-${cell.day}`}
                type="button"
                disabled={isPast}
                whileHover={!isPast ? { scale: 1.04 } : {}}
                whileTap={!isPast ? { scale: 0.96 } : {}}
                onClick={() => cell.dateString && handleDaySelect(cell.dateString)}
                className={`aspect-square p-1 rounded-xl flex flex-col justify-between items-center transition-all ${bgClass} ${textClass} ${borderClass} relative`}
              >
                {/* Day number */}
                <span className="text-[11px] font-mono font-bold mt-0.5">{cell.day}</span>
                
                {/* Visual indicators for availability */}
                {!isPast && (
                  <div className="flex gap-0.5 mb-1 items-center">
                    {/* Emerald dots for vacant slots */}
                    {availableCount > 0 && (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? "bg-white dark:bg-navy-950" : "bg-emerald-500"}`} />
                    )}
                    {/* Red dot if there are booked slots */}
                    {bookedCount > 0 && (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? "bg-white/55 dark:bg-navy-950/55" : "bg-red-500"}`} />
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-3 border-t border-navy-100 dark:border-navy-800 text-[10px] text-navy-500 font-mono">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-emerald-500/10 border border-emerald-300 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-emerald-500" />
            </div>
            <span>Vacant (All Free)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-amber-500/10 border border-amber-300 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-amber-500" />
            </div>
            <span>Partially Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-red-500/10 border border-red-300 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-red-500" />
            </div>
            <span>Fully Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 border border-dashed border-navy-300 rounded opacity-55" />
            <span>Past Dates</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Hourly Slots Inspector (5 cols) */}
      <div className="md:col-span-5 bg-navy-50/50 dark:bg-navy-950/40 rounded-2xl border border-navy-100 dark:border-navy-850 p-4 flex flex-col justify-between text-left space-y-4">
        <div className="space-y-1">
          <h4 className="text-[10px] font-mono font-bold text-navy-400 uppercase tracking-widest flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-royal-600 dark:text-gold-400" />
            Slot Inspector
          </h4>
          <h3 className="text-sm font-black text-navy-900 dark:text-white">
            {selectedDate ? new Date(selectedDate).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }) : "No Date Selected"}
          </h3>
          <div className="flex items-center gap-2 text-[10px] font-mono pt-1 text-navy-500">
            <span>Vacancy Score:</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{selectedDateMetrics.availableCount} of {TIME_SLOTS.length} Vacant</span>
          </div>
        </div>

        {/* List of Time Slots */}
        <div className="space-y-2 flex-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
          {TIME_SLOTS.map(slot => {
            const status = selectedDate ? getSlotStatus(selectedDate, slot, bookings) : "available";
            const isBooked = status === "booked";
            const isSlotSelected = selectedTimeSlot === slot;

            return (
              <button
                key={slot}
                type="button"
                disabled={isBooked}
                onClick={() => handleSlotSelect(slot)}
                className={`w-full p-2.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center justify-between ${
                  isBooked
                    ? "bg-navy-100/50 dark:bg-navy-950/20 text-navy-400 dark:text-navy-600 border-transparent cursor-not-allowed line-through"
                    : isSlotSelected
                      ? "bg-royal-600 dark:bg-gold-500 text-white dark:text-navy-950 border-royal-600 dark:border-gold-500 shadow-sm"
                      : "bg-white dark:bg-navy-900 text-navy-800 dark:text-navy-300 border-navy-200 dark:border-navy-800 hover:border-royal-300 dark:hover:border-navy-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isBooked ? (
                    <Lock className="w-3.5 h-3.5 text-red-500" />
                  ) : (
                    <Clock className={`w-3.5 h-3.5 ${isSlotSelected ? "text-white dark:text-navy-950" : "text-royal-500"}`} />
                  )}
                  <span>{slot}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isBooked ? (
                    <span className="text-[9px] font-sans font-bold bg-red-500/10 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded uppercase">
                      Tutor Busy
                    </span>
                  ) : isSlotSelected ? (
                    <span className="text-[9px] font-sans font-bold bg-white/20 dark:bg-navy-950/20 text-white dark:text-navy-950 px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" /> Selected
                    </span>
                  ) : (
                    <span className="text-[9px] font-sans font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded uppercase">
                      Vacant
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick action helper or info box */}
        <div className="bg-white dark:bg-navy-900/60 p-3 rounded-xl border border-navy-150 dark:border-navy-800 text-[10px] text-navy-500 leading-normal flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-gold-500 flex-shrink-0 mt-0.5" />
          <span>
            {selectedTimeSlot ? (
              <>
                You selected the <b>{selectedTimeSlot}</b> slot. Click the button in the booking wizard to continue checking out!
              </>
            ) : (
              <>
                Select any <b>Vacant</b> slot in the list. The system will pre-fill this date and hour in the live whiteboard class booking form below.
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
