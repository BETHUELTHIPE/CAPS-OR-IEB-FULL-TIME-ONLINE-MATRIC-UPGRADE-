import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Award, BookOpen, Clock, Heart, Users, ShieldCheck, Mail, Phone, MessageSquare, Github, ExternalLink } from "lucide-react";

export const About: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pb-20 space-y-20"
    >
      
      {/* HEADER HERO BANNER */}
      <section className="bg-gradient-to-r from-navy-900 to-navy-950 text-white py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-royal-800/10 mix-blend-color-dodge" />
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <span className="text-xs font-mono font-bold uppercase text-gold-400 bg-gold-400/10 px-3 py-1 rounded-full">
            Our Story
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-none">
            Empowering South African Students <br />
            <span className="text-gold-400">Through Mathematics</span>
          </h1>
          <p className="text-xs sm:text-sm text-navy-200 max-w-2xl mx-auto leading-relaxed">
            Founded with a singular mission: to provide high-quality, professional, and personalized mathematics tutoring dedicated to South African Matric Upgrade learners (CAPS & IEB).
          </p>
        </div>
      </section>

      {/* FOUNDER STORY WITH OFFICE PHOTO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Founder Photo at Workstation */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-navy-200 dark:border-navy-800 shadow-xl aspect-[4/3] sm:aspect-video lg:aspect-[4/5] bg-navy-100">
              <img 
                src="/founder_office.jpg" 
                alt="Bethuel Moukangwe at his workstation desk managing Amaris Mathematics Hub" 
                className="w-full h-full object-cover scale-100 hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/src/assets/images/founder_office_photo_1785534413833.jpg";
                }}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-white bg-navy-900/85 px-2.5 py-1 rounded border border-navy-750 backdrop-blur-sm">
                  Bethuel Moukangwe • Amaris Workspace
                </span>
                <span className="text-[10px] font-mono text-gold-400 bg-gold-400/15 px-2 py-0.5 rounded border border-gold-400/30 font-bold">
                  Head Instructor
                </span>
              </div>
            </div>
            <p className="text-[11px] text-navy-500 dark:text-navy-400 text-center italic font-mono">
              Founder Bethuel Moukangwe at the Amaris Mathematics Hub online instruction workstation.
            </p>
          </div>

          {/* Right: Founder Profile */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-royal-600 dark:text-gold-400 uppercase tracking-widest block font-mono">Meet the Founder</span>
              <h2 className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white">Bethuel Moukangwe</h2>
              <p className="text-xs font-mono text-navy-500 dark:text-navy-400 uppercase">Head Instructor & BSc Graduate</p>
            </div>

            <div className="text-xs sm:text-sm text-navy-600 dark:text-navy-300 space-y-4 leading-relaxed">
              <p>
                My educational journey was driven by a deep love for problem-solving. Having graduated with distinctions, I realized that mathematics is often taught as a series of rigid formulas to be memorized, rather than a beautifully logical language to be understood.
              </p>
              <p>
                I established <b>Amaris Learning Hub</b> in response to the high number of Grade 12 learners struggling to meet university admission points (APS) due to mathematics. Over the last decade, we have developed a specialized, online-first curriculum system designed to identify cognitive gaps and resolve them systematically.
              </p>
              <p>
                Whether you wrote matric years ago and are now upgrading to enroll in a BCom, BSc, or Engineering degree, or you are a high school pupil aiming for a Level 7 (80%+) distinction, we customize our pacing to help you thrive.
              </p>
            </div>

            {/* Qualifications badges & Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-navy-100 dark:border-navy-800">
              <div className="flex gap-3">
                <div className="p-2 bg-royal-100 dark:bg-royal-950 text-royal-700 dark:text-royal-300 rounded-lg h-10 w-10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-navy-900 dark:text-white">BSc Mathematics Focus</h4>
                  <p className="text-[11px] text-navy-500 dark:text-navy-400">Solid theoretical and application credentials.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2 bg-gold-100 dark:bg-gold-950 text-gold-700 dark:text-gold-400 rounded-lg h-10 w-10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-navy-900 dark:text-white">Certified CAPS & IEB Educator</h4>
                  <p className="text-[11px] text-navy-500 dark:text-navy-400">Aligned with South African school boards.</p>
                </div>
              </div>
            </div>

            {/* Social & GitHub Links */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a 
                href="https://github.com/BETHUELTHIPE" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-navy-950 dark:bg-navy-800 dark:hover:bg-navy-750 text-white rounded-xl text-xs font-mono font-bold border border-navy-700 shadow-sm transition-all hover:scale-105"
              >
                <Github className="w-4 h-4 text-gold-400" />
                <span>GitHub: @BETHUELTHIPE</span>
                <ExternalLink className="w-3.5 h-3.5 text-navy-400" />
              </a>

              <a 
                href="mailto:bethuelmoukangwe8@gmail.com" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-royal-50 hover:bg-royal-100 dark:bg-navy-850 dark:hover:bg-navy-800 text-royal-700 dark:text-royal-300 rounded-xl text-xs font-mono font-bold border border-royal-200 dark:border-navy-700 transition-all"
              >
                <Mail className="w-4 h-4 text-royal-500" />
                <span>Email Founder</span>
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* TEACHING PHILOSOPHY */}
      <section className="bg-navy-50 dark:bg-navy-900/40 py-16 px-4 border-y border-navy-100 dark:border-navy-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-mono font-bold uppercase text-royal-600 dark:text-gold-400 bg-royal-100 dark:bg-royal-950/40 px-3 py-1 rounded-full">
              Teaching Methodology
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-navy-900 dark:text-white font-display">
              The Amaris Learning Blueprint
            </h2>
            <p className="text-xs sm:text-sm text-navy-500 dark:text-navy-400">
              We reject rote learning. Our online lessons focus on building strong structural mastery, ensuring students can independently parse, formulate, and solve complex mathematical models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-navy-900 p-6 rounded-xl border border-navy-150 dark:border-navy-800 shadow-sm space-y-4">
              <div className="w-10 h-10 bg-royal-100 dark:bg-royal-950 text-royal-700 dark:text-royal-300 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-navy-900 dark:text-white uppercase tracking-wider">1. Safe, Patient Environment</h3>
              <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed">
                Fear of mathematics is the single greatest obstacle to learning. We create a supportive, positive space where mistakes are celebrated as valuable steps toward ultimate understanding.
              </p>
            </div>

            <div className="bg-white dark:bg-navy-900 p-6 rounded-xl border border-navy-150 dark:border-navy-800 shadow-sm space-y-4">
              <div className="w-10 h-10 bg-gold-100 dark:bg-gold-950 text-gold-700 dark:text-gold-300 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-navy-900 dark:text-white uppercase tracking-wider">2. Active Screen Collaboration</h3>
              <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed">
                Passive listening does not teach math. Our students write on digital whiteboards, participate in formulas live, and solve equations concurrently with the tutor for real-time feedback.
              </p>
            </div>

            <div className="bg-white dark:bg-navy-900 p-6 rounded-xl border border-navy-150 dark:border-navy-800 shadow-sm space-y-4">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-navy-900 dark:text-white uppercase tracking-wider">3. Systematic Reinforcement</h3>
              <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed">
                A 1-hour class once a week is not enough. We assign custom diagnostic homework worksheets, review answers within 24 hours, and provide video guides on how to handle the questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK CTA FOR SERVICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h3 className="text-xl sm:text-2xl font-black text-navy-900 dark:text-white">
          Ready to construct a personalized mathematics tutoring schedule?
        </h3>
        <p className="text-xs text-navy-500 dark:text-navy-400 max-w-xl mx-auto">
          Explore our tailored subject modules covering CAPS Grade 12 Mathematics and IEB Matric upgrade preparations.
        </p>
        <div className="flex justify-center gap-4">
          <Link 
            to="/subjects" 
            className="px-5 py-2.5 bg-royal-700 hover:bg-royal-800 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            Explore Subjects
          </Link>
          <Link 
            to="/pricing" 
            className="px-5 py-2.5 bg-transparent hover:bg-navy-100 dark:hover:bg-navy-850 border border-navy-300 dark:border-navy-700 text-navy-700 dark:text-navy-200 text-xs font-bold rounded-lg"
          >
            View Package Pricing
          </Link>
        </div>
      </section>

    </motion.div>
  );
};
