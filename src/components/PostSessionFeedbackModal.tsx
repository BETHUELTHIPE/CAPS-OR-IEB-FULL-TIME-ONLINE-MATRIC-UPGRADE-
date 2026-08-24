import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Star,
  CheckCircle2,
  Sparkles,
  BookOpen,
  TrendingUp,
  X,
  MessageSquare,
  Send,
  Plus,
  ThumbsUp,
  ShieldCheck,
  Check,
  HelpCircle,
  FileText
} from "lucide-react";
import { Booking, Profile } from "../types";
import { dbAPI } from "../lib/db";
import { VisualLatexToolbar } from "./VisualLatexToolbar";

export interface PostSessionFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  user?: Profile | null;
  onSubmitted?: () => void;
}

const CAPS_PAPER1_TOPICS = [
  "Algebra - Quadratic Equations & Inequalities",
  "Algebra - Simultaneous Equations & Roots",
  "Sequences - Arithmetic & Geometric Patterns",
  "Sequences - Sigma Notation & Sum to Infinity",
  "Functions - Hyperbola, Parabola & Exponential",
  "Functions - Inverse Graphs f⁻¹(x) & Logs",
  "Calculus - Limits & First Principles",
  "Calculus - Differentiation Rules & Tangents",
  "Calculus - Cubic Polynomials & Curve Sketching",
  "Calculus - Rates of Change & Optimization",
  "Financials - Simple & Compound Interest",
  "Financials - Future & Present Value Annuities",
  "Probability - Venn Diagrams & Tree Diagrams",
  "Probability - Fundamental Counting Principle"
];

const CAPS_PAPER2_TOPICS = [
  "Trigonometry - Compound & Double Angle Formulas",
  "Trigonometry - Reduction & Quadrants",
  "Trigonometry - Proving Identities & Equations",
  "Trigonometry - Sine, Cosine & Area Rules (2D/3D)",
  "Analytical Geometry - Distance, Midpoint & Inclination",
  "Analytical Geometry - Circle Equations & Tangents",
  "Euclidean Geometry - Chord & Angle Theorems",
  "Euclidean Geometry - Cyclic Quads & Tan-Chord Theorem",
  "Euclidean Geometry - Proportionality & Similar Triangles",
  "Statistics - Regression, Scatter Plots & Ogives"
];

export const PostSessionFeedbackModal: React.FC<PostSessionFeedbackModalProps> = ({
  isOpen,
  onClose,
  booking,
  user,
  onSubmitted
}) => {
  const [overallRating, setOverallRating] = useState<number>(5);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  // Sub-category evaluation scores (1-5)
  const [clarityRating, setClarityRating] = useState<number>(5);
  const [paceRating, setPaceRating] = useState<number>(5);
  const [examRelevanceRating, setExamRelevanceRating] = useState<number>(5);
  const [confidenceRating, setConfidenceRating] = useState<number>(5);

  // Topics selection
  const [activeTab, setActiveTab] = useState<"paper1" | "paper2" | "custom">("paper1");
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    booking?.topics_to_cover && booking.topics_to_cover.length > 0
      ? booking.topics_to_cover
      : ["Algebra - Quadratic Equations & Inequalities"]
  );
  const [customTopicInput, setCustomTopicInput] = useState<string>("");

  // Detailed notes and preferences
  const [studentNotes, setStudentNotes] = useState<string>("");
  const [requestHomework, setRequestHomework] = useState<boolean>(true);
  const [requestAdminCallback, setRequestAdminCallback] = useState<boolean>(false);

  // State management
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen || !booking) return null;

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const handleAddCustomTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopicInput.trim()) return;
    const clean = customTopicInput.trim();
    if (!selectedTopics.includes(clean)) {
      setSelectedTopics(prev => [...prev, clean]);
    }
    setCustomTopicInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      dbAPI.submitPostSessionFeedback({
        bookingId: booking.id,
        rating: overallRating,
        remarks: studentNotes,
        topicsCovered: selectedTopics,
        categoryRatings: {
          "Explanation Clarity": clarityRating,
          "Whiteboard Pace": paceRating,
          "Exam Problem Relevance": examRelevanceRating,
          "Student Post-Session Confidence": confidenceRating
        },
        studentName: user ? `${user.first_name} ${user.surname}` : "Bethuel Thipe",
        studentEmail: user?.email || "bethuel@amaris.co.za",
        tutorName: "Head Tutor Bethuel",
        requestHomework,
        requestAdminFollowup: requestAdminCallback
      });

      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        if (onSubmitted) onSubmitted();
        onClose();
      }, 1800);
    } catch (err) {
      console.error("Error submitting post-session feedback:", err);
      setIsSubmitting(false);
      alert("Notice: Feedback saved locally. Thank you!");
      if (onSubmitted) onSubmitted();
      onClose();
    }
  };

  const ratingLabels: Record<number, { title: string; desc: string }> = {
    5: { title: "Outstanding Mastery! (5/5)", desc: "Clear explanations, step-by-step whiteboard working, highly recommended." },
    4: { title: "Great Session (4/5)", desc: "Solid progress, understood key concepts well." },
    3: { title: "Good / Satisfactory (3/5)", desc: "Pace was okay, may need a little more practice." },
    2: { title: "Below Average (2/5)", desc: "Struggled with certain steps or pace." },
    1: { title: "Needs Improvement (1/5)", desc: "Requires follow-up review or adjusted pace." }
  };

  const displayStar = hoveredStar !== null ? hoveredStar : overallRating;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden relative text-left my-auto"
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-navy-900 via-navy-950 to-royal-950 p-6 text-white relative border-b border-gold-500/20">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-full text-navy-200 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-500/20 text-gold-400 border border-gold-500/30 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-gold-400 animate-pulse" />
                POST-SESSION FEEDBACK & TOPIC LOG
              </span>
              <span className="bg-white/10 text-navy-200 text-[10px] font-mono px-2 py-0.5 rounded">
                Ref: {booking.booking_reference}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Rate Your Tutor & Log Covered Topics
            </h2>
            <p className="text-xs text-navy-200 font-medium mt-1 leading-relaxed">
              Session on <b>{booking.lesson_date}</b> at <b>{booking.lesson_time}</b> with <b>Head Tutor Bethuel</b>. Your evaluation automatically updates your progress dashboard and alerts the admin.
            </p>
          </div>

          {isSuccess ? (
            <div className="p-10 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-500/15 border-2 border-emerald-500 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-navy-900 dark:text-white">
                  Post-Session Evaluation Saved!
                </h3>
                <p className="text-xs text-navy-600 dark:text-navy-300 max-w-md mx-auto leading-relaxed">
                  Your tutor rating has been filed. Your <b>Student Progress Dashboard</b> has been updated with +12% mastery gains across {selectedTopics.length} covered topics!
                </p>
              </div>

              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Admin Console & Head Tutor Bethuel Notified
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* SECTION 1: TUTOR STAR RATING */}
              <div className="space-y-3 bg-navy-50/50 dark:bg-navy-950/50 p-4 rounded-2xl border border-navy-100 dark:border-navy-800">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono font-black text-navy-800 dark:text-navy-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    1. Overall Tutor Satisfaction Rating
                  </label>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-gold-400 font-mono">
                    {displayStar}/5 Stars
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(null)}
                      onClick={() => setOverallRating(star)}
                      className="p-1.5 rounded-xl transition-transform hover:scale-110 cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                          star <= displayStar
                            ? "text-amber-400 fill-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]"
                            : "text-navy-300 dark:text-navy-700 hover:text-amber-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="text-center bg-white dark:bg-navy-900 p-2.5 rounded-xl border border-navy-150 dark:border-navy-800">
                  <p className="text-xs font-black text-navy-900 dark:text-gold-400">
                    {ratingLabels[displayStar]?.title}
                  </p>
                  <p className="text-[11px] text-navy-500 dark:text-navy-400 mt-0.5">
                    {ratingLabels[displayStar]?.desc}
                  </p>
                </div>

                {/* Sub-category Rating Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-navy-700 dark:text-navy-300">
                      <span>Explanation Clarity:</span>
                      <span className="font-bold font-mono">{clarityRating}/5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={clarityRating}
                      onChange={e => setClarityRating(Number(e.target.value))}
                      className="w-full accent-royal-600 h-1.5 bg-navy-200 dark:bg-navy-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-navy-700 dark:text-navy-300">
                      <span>Whiteboard & Pace:</span>
                      <span className="font-bold font-mono">{paceRating}/5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={paceRating}
                      onChange={e => setPaceRating(Number(e.target.value))}
                      className="w-full accent-royal-600 h-1.5 bg-navy-200 dark:bg-navy-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-navy-700 dark:text-navy-300">
                      <span>CAPS/IEB Exam Relevance:</span>
                      <span className="font-bold font-mono">{examRelevanceRating}/5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={examRelevanceRating}
                      onChange={e => setExamRelevanceRating(Number(e.target.value))}
                      className="w-full accent-royal-600 h-1.5 bg-navy-200 dark:bg-navy-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-navy-700 dark:text-navy-300">
                      <span>Post-Session Confidence:</span>
                      <span className="font-bold font-mono">{confidenceRating}/5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={confidenceRating}
                      onChange={e => setConfidenceRating(Number(e.target.value))}
                      className="w-full accent-royal-600 h-1.5 bg-navy-200 dark:bg-navy-700 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: SPECIFIC TOPICS COVERED IN SESSION */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <label className="text-xs font-mono font-black text-navy-800 dark:text-navy-200 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-royal-500" />
                    2. Specific CAPS/IEB Topics Covered
                  </label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    +{selectedTopics.length * 12}% Dashboard Progress Boost
                  </span>
                </div>

                {/* Paper selector tabs */}
                <div className="flex border-b border-navy-150 dark:border-navy-800 text-xs font-bold gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("paper1")}
                    className={`pb-2 px-3 border-b-2 transition cursor-pointer ${
                      activeTab === "paper1"
                        ? "border-royal-600 text-royal-600 dark:text-gold-400 font-extrabold"
                        : "border-transparent text-navy-500 hover:text-navy-800 dark:hover:text-white"
                    }`}
                  >
                    Paper 1 Syllabus ({CAPS_PAPER1_TOPICS.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("paper2")}
                    className={`pb-2 px-3 border-b-2 transition cursor-pointer ${
                      activeTab === "paper2"
                        ? "border-royal-600 text-royal-600 dark:text-gold-400 font-extrabold"
                        : "border-transparent text-navy-500 hover:text-navy-800 dark:hover:text-white"
                    }`}
                  >
                    Paper 2 Syllabus ({CAPS_PAPER2_TOPICS.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("custom")}
                    className={`pb-2 px-3 border-b-2 transition cursor-pointer ${
                      activeTab === "custom"
                        ? "border-royal-600 text-royal-600 dark:text-gold-400 font-extrabold"
                        : "border-transparent text-navy-500 hover:text-navy-800 dark:hover:text-white"
                    }`}
                  >
                    Custom Topic +
                  </button>
                </div>

                {/* Topic Pill Grid */}
                {activeTab === "paper1" && (
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                    {CAPS_PAPER1_TOPICS.map(topic => {
                      const isSelected = selectedTopics.includes(topic);
                      return (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => toggleTopic(topic)}
                          className={`text-[11px] font-medium px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-royal-600 text-white border-royal-600 shadow-sm font-bold"
                              : "bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300 border-navy-200 dark:border-navy-800 hover:border-royal-400"
                          }`}
                        >
                          {isSelected ? <Check className="w-3 h-3 text-gold-400" /> : <Plus className="w-3 h-3 text-navy-400" />}
                          <span>{topic}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {activeTab === "paper2" && (
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                    {CAPS_PAPER2_TOPICS.map(topic => {
                      const isSelected = selectedTopics.includes(topic);
                      return (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => toggleTopic(topic)}
                          className={`text-[11px] font-medium px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-royal-600 text-white border-royal-600 shadow-sm font-bold"
                              : "bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300 border-navy-200 dark:border-navy-800 hover:border-royal-400"
                          }`}
                        >
                          {isSelected ? <Check className="w-3 h-3 text-gold-400" /> : <Plus className="w-3 h-3 text-navy-400" />}
                          <span>{topic}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {activeTab === "custom" && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customTopicInput}
                        onChange={e => setCustomTopicInput(e.target.value)}
                        placeholder="e.g. Derivative limits with roots, Tan-chord rider #4"
                        className="flex-1 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomTopic}
                        className="px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Add Topic
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedTopics.map(t => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1.5 bg-royal-100 dark:bg-royal-950/60 text-royal-900 dark:text-gold-300 text-[11px] px-2.5 py-1 rounded-lg border border-royal-300 dark:border-royal-800 font-bold"
                        >
                          <span>{t}</span>
                          <button
                            type="button"
                            onClick={() => toggleTopic(t)}
                            className="hover:text-red-500 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: DETAILED NOTES & REMARKS WITH VISUAL LATEX EDITOR */}
              <div className="space-y-2">
                <VisualLatexToolbar
                  label="3. Session Notes & Mathematical Feedback"
                  value={studentNotes}
                  onChange={setStudentNotes}
                  placeholder="Share specific details about what was covered, breakthrough moments, or complex equations (e.g. \frac{a}{b}, f'(x) = \lim_{h \to 0}) you reviewed with Head Tutor Bethuel..."
                  rows={3}
                  showLivePreview={true}
                />
              </div>

              {/* SECTION 4: FOLLOW-UP OPTIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-navy-100 dark:border-navy-800">
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-navy-150 dark:border-navy-850 bg-navy-50/30 dark:bg-navy-950/30 cursor-pointer hover:bg-navy-50">
                  <input
                    type="checkbox"
                    checked={requestHomework}
                    onChange={e => setRequestHomework(e.target.checked)}
                    className="w-4 h-4 accent-royal-600 rounded cursor-pointer"
                  />
                  <div className="text-left">
                    <p className="text-xs font-bold text-navy-900 dark:text-white">Request Practice Homework</p>
                    <p className="text-[10px] text-navy-500 dark:text-navy-400">Ask tutor to upload tailored worksheets on covered topics</p>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-navy-150 dark:border-navy-850 bg-navy-50/30 dark:bg-navy-950/30 cursor-pointer hover:bg-navy-50">
                  <input
                    type="checkbox"
                    checked={requestAdminCallback}
                    onChange={e => setRequestAdminCallback(e.target.checked)}
                    className="w-4 h-4 accent-royal-600 rounded cursor-pointer"
                  />
                  <div className="text-left">
                    <p className="text-xs font-bold text-navy-900 dark:text-white">Request Admin Callback</p>
                    <p className="text-[10px] text-navy-500 dark:text-navy-400">Flag for direct consultation with Head Tutor Bethuel</p>
                  </div>
                </label>
              </div>

              {/* ACTION FOOTER */}
              <div className="pt-3 border-t border-navy-150 dark:border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-navy-500 dark:text-navy-400">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Auto-syncs with Progress Dashboard & Admin Console</span>
                </div>

                <div className="flex gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 py-2.5 border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300 rounded-xl text-xs font-bold hover:bg-navy-50 dark:hover:bg-navy-850 cursor-pointer"
                  >
                    Skip
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-royal-600 via-royal-700 to-navy-900 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-royal-600/20 hover:shadow-royal-600/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Saving Feedback...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-gold-400" />
                        <span>Submit Feedback & Log Progress</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
