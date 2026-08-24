import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, GraduationCap, ArrowRight, ShieldAlert, CheckCircle } from "lucide-react";
import { dbAPI } from "../lib/db";
import { Subject } from "../types";
import { SyllabusCoverageCards } from "./SyllabusCoverageCards";
import { LatexRenderer } from "./LatexRenderer";

export const Subjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState<string>("All");

  useEffect(() => {
    setSubjects(dbAPI.getSubjects());
  }, []);

  const categories = ["All", "Matric Upgrade", "IEB"];

  const filteredSubjects = activeTab === "All" 
    ? subjects 
    : subjects.filter(sub => sub.grade_level.includes(activeTab));

  return (
    <div className="pb-20 space-y-16">
      
      {/* HEADER HERO BANNER */}
      <section className="bg-gradient-to-r from-navy-900 via-navy-950 to-navy-900 text-white py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-xs font-mono font-bold uppercase text-gold-400 bg-gold-400/10 border border-gold-400/20 px-3 py-1 rounded-full">
            Full Syllabus Coverage Hub
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-none">
            Tailored Mathematics Curriculums
          </h1>
          <p className="text-xs sm:text-sm text-navy-200 max-w-2xl mx-auto leading-relaxed">
            We focus exclusively on National Senior Certificate (NSC) CAPS syllabus upgrades and rigorous IEB Advanced Programme mathematics proofs. Explore our comprehensive chapter cards below.
          </p>
        </div>
      </section>

      {/* FULL SYLLABUS COVERAGE CARDS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SyllabusCoverageCards />
      </section>

      {/* TABS FILTER FOR BROAD SUBJECT BLOCKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-8 border-t border-navy-150 dark:border-navy-800">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-navy-900 dark:text-white">
            Structured Tutoring Streams
          </h2>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Select a tailored stream for dedicated 1-on-1 coaching packages and personalized study paths.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 border-b border-navy-150 dark:border-navy-800 pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === cat
                  ? "bg-royal-600 text-white shadow"
                  : "text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-850"
              }`}
            >
              {cat === "All" ? "View All Streams" : `${cat} Streams`}
            </button>
          ))}
        </div>

        {/* SUBJECTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredSubjects.map((sub) => (
            <div 
              key={sub.id}
              className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black uppercase text-gold-600 bg-gold-50 dark:text-gold-400 dark:bg-gold-950/20 px-2.5 py-1 rounded">
                    {sub.grade_level}
                  </span>
                  <span className="text-xs font-mono font-bold text-navy-500">
                    R{sub.price_per_hour}/hr base
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-navy-900 dark:text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-royal-600 flex-shrink-0" />
                    {sub.name}
                  </h3>
                  <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed">
                    {sub.description}
                  </p>
                </div>

                {/* Topics list */}
                <div className="border-t border-navy-100 dark:border-navy-800 pt-4">
                  <h4 className="text-xs font-mono font-black text-navy-900 dark:text-white uppercase mb-3">Syllabus Chapters Included:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sub.topics.map((topic, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-navy-600 dark:text-navy-300">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <LatexRenderer text={topic} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-navy-100 dark:border-navy-800 mt-6 pt-4 flex items-center justify-between">
                <span className="text-[10px] text-navy-400 font-mono">Interactive whiteboard materials included</span>
                <Link 
                  to="/book" 
                  className="px-4 py-2 bg-royal-50 dark:bg-navy-850 hover:bg-royal-100 dark:hover:bg-navy-800 text-royal-700 dark:text-gold-400 text-xs font-extrabold rounded-lg flex items-center gap-1 transition-colors"
                >
                  Book Tutoring
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MATRIC UPGRADE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex gap-4">
            <div className="p-3 bg-amber-500/20 text-amber-500 rounded-xl h-12 w-12 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-navy-900 dark:text-white">South African "Second Chance" Matric Candidates</h3>
              <p className="text-xs text-navy-500 dark:text-navy-400 max-w-xl">
                Are you rewriting your NSC maths exams to qualify for university? Our curriculum is meticulously structured to help upgrade candidates target specific high-yield exam sections. We provide customized timelines to fit into your part-time or working schedule.
              </p>
            </div>
          </div>
          <Link 
            to="/contact" 
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg shadow-sm whitespace-nowrap transition-colors"
          >
            Consult Upgrade Plan
          </Link>
        </div>
      </section>

    </div>
  );
};
