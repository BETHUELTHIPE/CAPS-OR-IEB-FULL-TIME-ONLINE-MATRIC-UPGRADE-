import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Star,
  Award,
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen,
  Layers,
  Sparkles,
  TrendingUp,
  GraduationCap,
  ChevronRight,
  X,
  Check,
  UserCheck,
  ShieldCheck,
  Flame,
  ArrowUpDown,
  Zap,
  Info
} from "lucide-react";
import {
  TutorExpert,
  ALL_TUTORS_DATABASE,
  TUTOR_SUBJECT_TOPICS
} from "../lib/tutorsData";

interface TutorFilterSystemProps {
  selectedTutorId?: string | null;
  onSelectTutor: (tutor: TutorExpert) => void;
  onClearTutorSelection?: () => void;
  initialSyllabusFilter?: "all" | "caps" | "ieb" | "ap_maths";
}

type SyllabusFilter = "all" | "caps" | "ieb" | "ap_maths";
type SortOption = "rating_desc" | "grade_jump_desc" | "lessons_desc" | "price_asc" | "name_asc";

export const TutorFilterSystem: React.FC<TutorFilterSystemProps> = ({
  selectedTutorId,
  onSelectTutor,
  onClearTutorSelection,
  initialSyllabusFilter = "all"
}) => {
  // Filter & Search states
  const [syllabusFilter, setSyllabusFilter] = useState<SyllabusFilter>(initialSyllabusFilter);
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("rating_desc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewingTutorModal, setViewingTutorModal] = useState<TutorExpert | null>(null);

  // Filter and Sort Pipeline
  const filteredAndSortedTutors = useMemo(() => {
    let result = [...ALL_TUTORS_DATABASE];

    // 1. Syllabus Focus Filter
    if (syllabusFilter === "caps") {
      result = result.filter((t) => t.syllabusFocus.includes("CAPS"));
    } else if (syllabusFilter === "ieb") {
      result = result.filter((t) => t.syllabusFocus.includes("IEB"));
    } else if (syllabusFilter === "ap_maths") {
      result = result.filter((t) => t.syllabusFocus.includes("AP Maths"));
    }

    // 2. Subject Expertise Topic Filter
    if (topicFilter !== "all") {
      const selectedTopicObj = TUTOR_SUBJECT_TOPICS.find((t) => t.id === topicFilter);
      if (selectedTopicObj) {
        const keywords = selectedTopicObj.keywords || [selectedTopicObj.name.toLowerCase()];
        result = result.filter((t) => {
          const tutorExpertiseLower = t.subjectExpertise.map((e) => e.toLowerCase()).join(" ");
          const tutorTopTopicsLower = t.topTopics.map((top) => top.toLowerCase()).join(" ");
          const combined = `${tutorExpertiseLower} ${tutorTopTopicsLower}`;
          return keywords.some((kw) => combined.includes(kw.toLowerCase()));
        });
      }
    }

    // 3. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((t) => {
        const matchName = t.fullName.toLowerCase().includes(q);
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchUniversity = t.university.toLowerCase().includes(q);
        const matchSpecialty = t.curriculumSummary.toLowerCase().includes(q);
        const matchExpertise = t.subjectExpertise.some((e) => e.toLowerCase().includes(q));
        const matchQualifications = t.qualifications.some((qual) => qual.toLowerCase().includes(q));
        return matchName || matchTitle || matchUniversity || matchSpecialty || matchExpertise || matchQualifications;
      });
    }

    // 4. Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case "rating_desc":
          if (b.rating !== a.rating) return b.rating - a.rating;
          return b.reviewCount - a.reviewCount;
        case "grade_jump_desc":
          return b.avgStudentGradeJump - a.avgStudentGradeJump;
        case "lessons_desc":
          return b.totalLessonsCompleted - a.totalLessonsCompleted;
        case "price_asc":
          return a.hourlyRate - b.hourlyRate;
        case "name_asc":
          return a.fullName.localeCompare(b.fullName);
        default:
          return 0;
      }
    });

    return result;
  }, [syllabusFilter, topicFilter, searchQuery, sortOption]);

  const activeSelectedTutor = ALL_TUTORS_DATABASE.find((t) => t.id === selectedTutorId);

  const resetAllFilters = () => {
    setSyllabusFilter("all");
    setTopicFilter("all");
    setSearchQuery("");
    setSortOption("rating_desc");
  };

  const hasActiveFilters = syllabusFilter !== "all" || topicFilter !== "all" || searchQuery.trim() !== "";

  return (
    <div id="tutor-filter-section" className="space-y-6 text-left">
      {/* SECTION HEADER & CONTEXT */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-navy-150 dark:border-navy-800 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-royal-600/10 text-royal-600 dark:text-gold-400 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-royal-600 dark:text-gold-400">
              Verified Mathematics Faculty
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-display text-navy-900 dark:text-white">
            Find & Match Your Mathematics Tutor
          </h2>
          <p className="text-xs sm:text-sm text-navy-500 dark:text-navy-400 max-w-2xl leading-relaxed">
            Filter by national syllabus stream (<strong>CAPS vs IEB</strong>) and target topic expertise (e.g. Calculus, Euclidean Geometry, Trigonometry). Select a tutor to load their dedicated scheduling calendar into the booking wizard.
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 px-3.5 py-2 rounded-2xl shrink-0">
          <Sparkles className="w-4 h-4 text-gold-500 animate-pulse" />
          <span className="text-xs font-bold text-navy-900 dark:text-white font-mono">
            {filteredAndSortedTutors.length} of {ALL_TUTORS_DATABASE.length} Tutors Available
          </span>
        </div>
      </div>

      {/* ACTIVE SELECTED TUTOR BANNER (IF ONE IS CURRENTLY SELECTED) */}
      {activeSelectedTutor && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-royal-900 via-indigo-950 to-navy-950 text-white border border-gold-400/40 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={activeSelectedTutor.avatar}
                alt={activeSelectedTutor.fullName}
                className="w-12 h-12 rounded-xl object-cover border-2 border-gold-400"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-navy-900 rounded-full" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-mono font-black bg-gold-400 text-navy-950 px-2 py-0.5 rounded uppercase">
                  Currently Selected
                </span>
                <span className="text-xs font-bold text-royal-200">
                  {activeSelectedTutor.title}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                {activeSelectedTutor.fullName}
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </h3>
              <p className="text-[11px] text-navy-200">
                Syllabus: <b>{activeSelectedTutor.syllabusFocus.join(" & ")}</b> | Rate: <b>R{activeSelectedTutor.hourlyRate}/hr</b>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setViewingTutorModal(activeSelectedTutor)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20"
            >
              View Full Bio
            </button>
            {onClearTutorSelection && (
              <button
                onClick={onClearTutorSelection}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1 border border-rose-400/30"
              >
                <X className="w-3.5 h-3.5" />
                Change Tutor
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* FILTER & SORT CONTROLS BAR */}
      <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
        
        {/* ROW 1: Syllabus Focus Tabs & Search */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          
          {/* SYLLABUS FOCUS TABS (CAPS vs IEB vs AP Maths) */}
          <div className="space-y-1.5 flex-1">
            <label className="block text-[10px] font-mono font-black text-navy-400 uppercase tracking-wider">
              1. Syllabus Focus Stream
            </label>
            <div className="inline-flex p-1 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-2xl gap-1 w-full sm:w-auto flex-wrap">
              <button
                type="button"
                onClick={() => setSyllabusFilter("all")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  syllabusFilter === "all"
                    ? "bg-white dark:bg-navy-800 text-royal-600 dark:text-gold-400 shadow-xs"
                    : "text-navy-500 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                All Syllabi
              </button>

              <button
                type="button"
                onClick={() => setSyllabusFilter("caps")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  syllabusFilter === "caps"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-navy-500 dark:text-navy-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                CAPS (NSC / Upgrade)
              </button>

              <button
                type="button"
                onClick={() => setSyllabusFilter("ieb")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  syllabusFilter === "ieb"
                    ? "bg-royal-600 text-white shadow-xs"
                    : "text-navy-500 dark:text-navy-400 hover:text-royal-600 dark:hover:text-royal-400"
                }`}
              >
                <Award className="w-3.5 h-3.5 text-gold-400" />
                IEB Independent Board
              </button>

              <button
                type="button"
                onClick={() => setSyllabusFilter("ap_maths")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  syllabusFilter === "ap_maths"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-navy-500 dark:text-navy-400 hover:text-amber-600 dark:hover:text-amber-400"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                AP Mathematics
              </button>
            </div>
          </div>

          {/* SEARCH BOX */}
          <div className="space-y-1.5 lg:w-72">
            <label className="block text-[10px] font-mono font-black text-navy-400 uppercase tracking-wider">
              Search by Keyword / University
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Calculus, Wits, Circle theorems..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal-500 dark:focus:ring-gold-400 text-navy-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2: Subject Topic Expertise Filter & Sorting Options */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-3 border-t border-navy-100 dark:border-navy-850">
          
          {/* SUBJECT TOPIC EXPERTISE DROPDOWN */}
          <div className="md:col-span-7 space-y-1.5">
            <label className="block text-[10px] font-mono font-black text-navy-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-royal-500" />
              2. Filter by Specific Subject Expertise
            </label>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs font-semibold bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal-500 text-navy-900 dark:text-white"
            >
              {TUTOR_SUBJECT_TOPICS.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          {/* SORT BY SELECTOR */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="block text-[10px] font-mono font-black text-navy-400 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-gold-500" />
              3. Sort Available Tutors By
            </label>
            <div className="flex gap-2">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="w-full py-2 px-3 text-xs font-semibold bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal-500 text-navy-900 dark:text-white"
              >
                <option value="rating_desc">★ Highest Rated (5.0 Stars)</option>
                <option value="grade_jump_desc">📈 Highest Student Grade Gain (+% Jump)</option>
                <option value="lessons_desc">🏆 Most Experienced (Lessons Completed)</option>
                <option value="price_asc">💵 Hourly Rate: Lowest First</option>
                <option value="name_asc">🔤 Alphabetical (A-Z)</option>
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-3 py-2 text-xs font-bold text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800 rounded-xl border border-navy-200 dark:border-navy-700 shrink-0 flex items-center gap-1 transition-all"
                  title="Reset all filters"
                >
                  <X className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* QUICK TOPIC CHIPS ROW */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[10px] font-mono text-navy-400 font-bold shrink-0 mr-1">
            Quick Topics:
          </span>
          {[
            { id: "all", label: "All" },
            { id: "calculus", label: "Calculus" },
            { id: "trigonometry", label: "Trigonometry" },
            { id: "euclidean", label: "Euclidean Geometry" },
            { id: "analytical", label: "Analytical Geometry" },
            { id: "functions", label: "Functions & Inverses" },
            { id: "finance", label: "Financial Maths" },
            { id: "ap_advanced", label: "AP Maths" }
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setTopicFilter(chip.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all whitespace-nowrap ${
                topicFilter === chip.id
                  ? "bg-royal-600 text-white shadow-xs"
                  : "bg-navy-50 dark:bg-navy-950 text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800 border border-navy-200/60 dark:border-navy-800"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* TUTORS GRID RESULTS */}
      <div className="space-y-4">
        {filteredAndSortedTutors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredAndSortedTutors.map((tutor) => {
              const isSelected = selectedTutorId === tutor.id;
              return (
                <div
                  key={tutor.id}
                  className={`bg-white dark:bg-navy-900 border rounded-3xl p-5 sm:p-6 space-y-4 transition-all relative flex flex-col justify-between shadow-sm hover:shadow-md ${
                    isSelected
                      ? "border-gold-400 ring-2 ring-gold-400/30 bg-gold-50/20 dark:bg-navy-850"
                      : "border-navy-150 dark:border-navy-800 hover:border-royal-300 dark:hover:border-navy-700"
                  }`}
                >
                  {/* TOP HEADER: Avatar + Status + Rating */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={tutor.avatar}
                            alt={tutor.fullName}
                            className="w-14 h-14 rounded-2xl object-cover border border-navy-200 dark:border-navy-700 shadow-sm"
                          />
                          {tutor.isAvailable && (
                            <span
                              className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-navy-900 rounded-full"
                              title="Available for Zoom Booking"
                            />
                          )}
                        </div>

                        <div className="space-y-0.5 text-left">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-sm sm:text-base font-black text-navy-900 dark:text-white">
                              {tutor.fullName}
                            </h3>
                            {tutor.badgeLabel && (
                              <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-royal-100 dark:bg-royal-950 text-royal-700 dark:text-gold-400 border border-royal-200 dark:border-royal-800">
                                {tutor.badgeLabel}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-navy-500 dark:text-navy-400 font-medium line-clamp-1">
                            {tutor.university}
                          </p>
                        </div>
                      </div>

                      {/* Hourly Rate */}
                      <div className="text-right shrink-0">
                        <span className="text-sm font-black font-mono text-royal-600 dark:text-gold-400">
                          R{tutor.hourlyRate}
                        </span>
                        <span className="block text-[9px] font-mono text-navy-400">/ hour</span>
                      </div>
                    </div>

                    {/* METRICS ROW: Rating + Grade Jump + Completed Lessons */}
                    <div className="grid grid-cols-3 gap-2 bg-navy-50/80 dark:bg-navy-950/60 p-2.5 rounded-2xl border border-navy-100 dark:border-navy-850 text-center">
                      <div>
                        <span className="text-[9px] font-mono text-navy-400 block font-bold">RATING</span>
                        <span className="text-xs font-black text-amber-500 flex items-center justify-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {tutor.rating.toFixed(1)}
                        </span>
                      </div>
                      <div className="border-x border-navy-200 dark:border-navy-800">
                        <span className="text-[9px] font-mono text-navy-400 block font-bold">AVG GAIN</span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-0.5">
                          <TrendingUp className="w-3 h-3" />
                          +{tutor.avgStudentGradeJump}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-navy-400 block font-bold">LESSONS</span>
                        <span className="text-xs font-black text-navy-800 dark:text-navy-200">
                          {tutor.totalLessonsCompleted}+
                        </span>
                      </div>
                    </div>

                    {/* SYLLABUS FOCUS TAGS */}
                    <div className="space-y-1.5 text-left">
                      <span className="text-[9px] font-mono font-bold text-navy-400 uppercase tracking-wider block">
                        Syllabus Alignment:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {tutor.syllabusFocus.map((s) => (
                          <span
                            key={s}
                            className={`text-[9px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase border ${
                              s === "CAPS"
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                : s === "IEB"
                                ? "bg-royal-50 dark:bg-royal-950/40 text-royal-700 dark:text-royal-300 border-royal-200 dark:border-royal-800"
                                : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                            }`}
                          >
                            {s} Specialist
                          </span>
                        ))}
                        <span className="text-[9px] font-mono text-navy-500 dark:text-navy-400">
                          ({tutor.gradeSpecialty})
                        </span>
                      </div>
                    </div>

                    {/* SUBJECT EXPERTISE PILLS */}
                    <div className="space-y-1.5 text-left">
                      <span className="text-[9px] font-mono font-bold text-navy-400 uppercase tracking-wider block">
                        Core Mathematical Expertise:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {tutor.subjectExpertise.slice(0, 4).map((exp, i) => {
                          const isHighlighted =
                            topicFilter !== "all" &&
                            exp.toLowerCase().includes(topicFilter.toLowerCase());
                          return (
                            <span
                              key={i}
                              className={`text-[9px] font-mono px-2 py-0.5 rounded-md ${
                                isHighlighted
                                  ? "bg-gold-400 text-navy-950 font-black"
                                  : "bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300"
                              }`}
                            >
                              {exp}
                            </span>
                          );
                        })}
                        {tutor.subjectExpertise.length > 4 && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded text-navy-400">
                            +{tutor.subjectExpertise.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* BIO SNIPPET */}
                    <p className="text-[11px] text-navy-600 dark:text-navy-400 leading-relaxed line-clamp-2 text-left">
                      {tutor.bio}
                    </p>

                    {/* UPCOMING SLOTS PREVIEW */}
                    <div className="pt-2 border-t border-navy-100 dark:border-navy-850 flex items-center justify-between text-[10px] font-mono text-navy-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-royal-500" />
                        Next Slot:
                      </span>
                      <span className="font-bold text-navy-800 dark:text-navy-200">
                        {tutor.availableWeeklySlots[0]}
                      </span>
                    </div>
                  </div>

                  {/* BOTTOM ACTION BUTTONS */}
                  <div className="flex items-center gap-2 pt-3 border-t border-navy-100 dark:border-navy-850">
                    <button
                      type="button"
                      onClick={() => setViewingTutorModal(tutor)}
                      className="px-3 py-2 text-xs font-bold text-navy-700 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800 rounded-xl border border-navy-200 dark:border-navy-700 transition-all flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5 text-navy-400" />
                      View Bio
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectTutor(tutor)}
                      className={`flex-1 py-2 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                        isSelected
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-gradient-to-r from-royal-600 to-indigo-600 hover:from-royal-700 hover:to-indigo-700 text-white"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Selected Tutor
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          Select Tutor & Book
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* NO MATCHES STATE */
          <div className="p-10 rounded-3xl bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 text-center space-y-3">
            <div className="p-3 bg-navy-100 dark:bg-navy-800 text-navy-400 rounded-2xl w-fit mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-navy-900 dark:text-white">
              No tutors match your active filters
            </h3>
            <p className="text-xs text-navy-500 dark:text-navy-400 max-w-md mx-auto">
              Try selecting <b>All Syllabi</b> or choosing <b>All Mathematical Topics</b> to view all verified faculty members.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="px-4 py-2 bg-royal-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-royal-700 transition-all"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* FULL TUTOR CREDENTIALS & DOSSIER MODAL */}
      <AnimatePresence>
        {viewingTutorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 text-left"
            >
              {/* MODAL HEADER */}
              <div className="flex justify-between items-start gap-4 border-b border-navy-150 dark:border-navy-800 pb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={viewingTutorModal.avatar}
                    alt={viewingTutorModal.fullName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-royal-500 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-black text-navy-900 dark:text-white">
                        {viewingTutorModal.fullName}
                      </h3>
                      {viewingTutorModal.badgeLabel && (
                        <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-gold-400 text-navy-950 uppercase">
                          {viewingTutorModal.badgeLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-royal-600 dark:text-gold-400 font-bold">
                      {viewingTutorModal.title}
                    </p>
                    <p className="text-[11px] text-navy-500 font-medium">
                      {viewingTutorModal.university}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setViewingTutorModal(null)}
                  className="p-2 hover:bg-navy-100 dark:hover:bg-navy-800 text-navy-400 hover:text-navy-600 dark:hover:text-white rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* STATS STRIP */}
              <div className="grid grid-cols-4 gap-2.5 bg-navy-50 dark:bg-navy-950 p-3 rounded-2xl border border-navy-150 dark:border-navy-800 text-center">
                <div>
                  <span className="text-[9px] font-mono text-navy-400 block font-bold">RATING</span>
                  <span className="text-xs font-black text-amber-500 flex items-center justify-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {viewingTutorModal.rating.toFixed(1)} ({viewingTutorModal.reviewCount})
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-navy-400 block font-bold">EXPERIENCE</span>
                  <span className="text-xs font-black text-navy-800 dark:text-navy-200">
                    {viewingTutorModal.yearsExperience} Years
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-navy-400 block font-bold">GRADE JUMP</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    +{viewingTutorModal.avgStudentGradeJump}%
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-navy-400 block font-bold">RATE</span>
                  <span className="text-xs font-black text-royal-600 dark:text-gold-400 font-mono">
                    R{viewingTutorModal.hourlyRate}/hr
                  </span>
                </div>
              </div>

              {/* SYLLABUS & ACADEMIC CREDENTIALS */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-black text-navy-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Academic Qualifications & Certifications
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {viewingTutorModal.qualifications.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white dark:bg-navy-950 border border-navy-150 dark:border-navy-850 rounded-xl flex items-center gap-2 text-xs font-medium text-navy-700 dark:text-navy-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TEACHING PHILOSOPHY & METHODOLOGY */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-black text-navy-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-royal-500" />
                  Teaching Philosophy
                </h4>
                <p className="text-xs text-navy-600 dark:text-navy-300 leading-relaxed bg-royal-50/50 dark:bg-navy-950 p-4 rounded-2xl border border-royal-100 dark:border-navy-800 italic">
                  "{viewingTutorModal.teachingPhilosophy}"
                </p>
              </div>

              {/* TOP SUBJECT EXPERTISE */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-black text-navy-400 uppercase tracking-wider">
                  Complete Topic Specializations:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {viewingTutorModal.subjectExpertise.map((exp, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono px-3 py-1 bg-navy-100 dark:bg-navy-800 text-navy-800 dark:text-navy-200 rounded-lg"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>

              {/* WEEKLY SLOTS PREVIEW */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-black text-navy-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-royal-500" />
                  Weekly Active Zoom Whiteboard Slots:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {viewingTutorModal.availableWeeklySlots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-xl text-center text-[11px] font-mono font-bold text-navy-700 dark:text-navy-300"
                    >
                      {slot}
                    </div>
                  ))}
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="flex gap-3 pt-4 border-t border-navy-150 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setViewingTutorModal(null)}
                  className="px-5 py-3 border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300 font-bold text-xs rounded-xl hover:bg-navy-50 dark:hover:bg-navy-800 transition-all"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTutor(viewingTutorModal);
                    setViewingTutorModal(null);
                  }}
                  className="flex-1 py-3 px-5 bg-gradient-to-r from-royal-600 to-indigo-600 hover:from-royal-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  Select {viewingTutorModal.name} & Continue Booking
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
