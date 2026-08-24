import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Award, BookOpen, Globe, Calendar, FileText, Video, 
  ChevronRight, Laptop, Users, MessageSquare 
} from "lucide-react";

export const Services: React.FC = () => {
  const services = [
    {
      icon: <Award className="w-6 h-6 text-royal-600 dark:text-gold-400" />,
      title: "Grade 12 Trial & Final Exam Preparation",
      description: "Our core exam-prep sessions are built to strip away exam anxiety. We analyze the last 10 years of National Senior Certificate (NSC) past papers and official memoranda to teach students exactly how mark allocation grids function.",
      bullets: [
        "Analysis of paper structures and marking policies",
        "Formulation of standard algebraic & geometric templates",
        "Time management planning for 3-hour mathematics assessments",
        "Full graded mock exams with tutor diagnostic report cards"
      ],
      bg: "from-royal-50 to-royal-100/50 dark:from-royal-950/20 dark:to-royal-900/10"
    },
    {
      icon: <BookOpen className="w-6 h-6 text-gold-600 dark:text-gold-400" />,
      title: "Structured Homework Coaching",
      description: "Getting stuck on school worksheets is discouraging. Our tutors provide step-by-step logic coaching to resolve conceptual blocks in daily homework assignments, ensuring students never fall behind their syllabus timetables.",
      bullets: [
        "Real-time correction of homework conceptual errors",
        "Step-by-step guidance on algebra, geometry, and graph models",
        "Development of clean, readable handwritten working styles",
        "Reinforcement of class lessons via focused review exercises"
      ],
      bg: "from-gold-50 to-gold-100/30 dark:from-gold-950/20 dark:to-gold-900/10"
    },
    {
      icon: <Globe className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: "100% Online Tutoring Hub",
      description: "Our custom online portal provides a high-definition, interactive whiteboard environment. Tutors and students can sketch formulas, drag coordinate points, and type mathematics equations collaboratively in real-time.",
      bullets: [
        "Live interactive whiteboards with student participation",
        "High-definition video and audio web streams",
        "Cloud-saved notes PDFs dispatched instantly after class",
        "Full lesson video archives available for 30 days"
      ],
      bg: "from-emerald-50 to-emerald-100/30 dark:from-emerald-950/20 dark:to-emerald-900/10"
    },
    {
      icon: <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      title: "Intensive Chapter Revision Classes",
      description: "Are you struggling with a specific challenging chapter like calculus optimization or circle theorems? We organize concentrated 2-hour crash courses to comprehensively cover entire high school or college units.",
      bullets: [
        "Intensive focus on targeted syllabus subjects",
        "Provision of summaries and formula cheat sheets",
        "Solving high-scoring exam questions as a group",
        "Direct Q&A with certified mathematics specialists"
      ],
      bg: "from-amber-50 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10"
    },
    {
      icon: <Video className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      title: "On-Demand Video Lesson Requests",
      description: "If you are struggling with a mathematical proof late at night, or want a private solution guide to a difficult past paper question, you can request an on-demand video breakdown through your student dashboard.",
      bullets: [
        "Upload questions or worksheets in JPG/PDF directly to the hub",
        "Get a personalized 15-to-25 minute video walkthrough",
        "Tutors explain concepts step-by-step using visual boards",
        "Instant delivery straight to your personal student portal"
      ],
      bg: "from-purple-50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10"
    },
    {
      icon: <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />,
      title: "Diagnostic Progress Tracking",
      description: "We keep parents and sponsors fully aligned with the student's progress. We track completed mock tests, homework marks, and core subject competence, providing a digestible monthly review card.",
      bullets: [
        "Detailed monthly progress scorecards",
        "Identification of lingering critical weaknesses",
        "Calculated estimation of final matric mark booster goals",
        "Parent-tutor consultation calls (included with premium packages)"
      ],
      bg: "from-red-50 to-red-100/30 dark:from-red-950/20 dark:to-red-900/10"
    }
  ];

  return (
    <div className="pb-20 space-y-20">
      
      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-navy-900 to-navy-950 text-white py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-xs font-mono font-bold uppercase text-gold-400 bg-gold-400/10 px-3 py-1 rounded-full">
            Our Offerings
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-none">
            Expertly Engineered Mathematics Services
          </h1>
          <p className="text-xs sm:text-sm text-navy-200 max-w-2xl mx-auto leading-relaxed">
            From focused past paper drills to comprehensive CAPS and IEB matric grade upgrade programs, discover the perfect learning support structure to boost your final mathematics marks.
          </p>
        </div>
      </section>

      {/* DETAILED CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {services.map((svc, i) => (
            <motion.div 
              key={i} 
              variants={{
                hidden: { opacity: 0, y: 25 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
              }}
              whileHover={{ y: -5, scale: 1.015 }}
              className={`bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group`}
            >
              <div className="p-6 sm:p-8 space-y-6">
                <div className={`p-4 bg-gradient-to-br ${svc.bg} rounded-xl w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  {svc.icon}
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-lg sm:text-xl font-bold text-navy-900 dark:text-white leading-tight group-hover:text-royal-600 dark:group-hover:text-gold-400 transition-colors">
                    {svc.title}
                  </h3>
                  <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed">
                    {svc.description}
                  </p>
                </div>

                <div className="border-t border-navy-100 dark:border-navy-800 pt-4">
                  <h4 className="text-xs font-bold font-mono text-navy-900 dark:text-white uppercase mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    {svc.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-navy-600 dark:text-navy-300">
                        <ChevronRight className="w-3.5 h-3.5 text-gold-500 mt-0.5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ONLINE HUB SPECS / HOW IT WORKS */}
      <section className="bg-navy-50 dark:bg-navy-900/30 py-16 px-4 border-y border-navy-100 dark:border-navy-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-mono font-bold uppercase text-royal-600 dark:text-gold-400 bg-royal-100 dark:bg-royal-950/40 px-3 py-1 rounded-full">
              The Virtual Classroom
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-navy-900 dark:text-white font-display">
              Built for Ultimate Online Collaboration
            </h2>
            <p className="text-xs sm:text-sm text-navy-500 dark:text-navy-400 leading-relaxed">
              Our system is optimized for South African internet conditions, ensuring high-fidelity voice and smooth coordinate drafting even on moderate network speeds. No fancy downloads required; join instantly from your standard browser.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-royal-100 dark:bg-royal-950 text-royal-700 dark:text-royal-300 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-navy-900 dark:text-white">Active Screen Writing</h4>
                  <p className="text-[11px] text-navy-500 dark:text-navy-400">Both student and tutor can draw simultaneously with mouse, finger, or stylus on a shared canvas.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gold-100 dark:bg-gold-950 text-gold-700 dark:text-gold-300 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-navy-900 dark:text-white">Instant Class Dispatch</h4>
                  <p className="text-[11px] text-navy-500 dark:text-navy-400">At the end of each session, the visual whiteboard is compiled and sent directly to your student email inbox as a study PDF.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive display mockup */}
          <div className="lg:col-span-6">
            <div className="bg-navy-900 rounded-2xl overflow-hidden border border-navy-850 shadow-2xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-navy-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <span className="text-[10px] font-mono text-navy-400 uppercase tracking-wider">Live Whiteboard Session</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Connected</span>
              </div>
              <div className="bg-navy-950 aspect-video rounded-lg border border-navy-800 relative flex flex-col justify-center items-center overflow-hidden">
                {/* Simulated Math Whiteboard */}
                <div className="absolute top-4 left-4 text-[10px] font-mono text-gold-500 font-bold">f(x) = ax² + bx + c</div>
                <div className="text-center space-y-2 p-4">
                  <div className="text-2xl font-black font-mono text-white">x = <span className="text-gold-400">[-b ± √(b² - 4ac)] / 2a</span></div>
                  <p className="text-[10px] text-navy-400">Solving the roots of a parabola</p>
                </div>
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <span className="text-[9px] font-mono text-navy-400 bg-navy-900 px-1.5 py-0.5 rounded border border-navy-800">Tutor: Bethuel</span>
                  <span className="text-[9px] font-mono text-navy-400 bg-navy-900 px-1.5 py-0.5 rounded border border-navy-800">Learner: Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h3 className="text-xl sm:text-2xl font-black text-navy-900 dark:text-white">
          Secure your online tutoring seat with Bethuel Moukangwe today
        </h3>
        <p className="text-xs text-navy-500 dark:text-navy-400 max-w-xl mx-auto">
          Sign up, select a package, and get full access to our interactive homework tools, video lesson request systems, and live trial-exam reviews.
        </p>
        <div className="flex justify-center gap-4">
          <Link 
            to="/register" 
            className="px-5 py-2.5 bg-royal-700 hover:bg-royal-800 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            Register Student Account
          </Link>
          <Link 
            to="/pricing" 
            className="px-5 py-2.5 bg-transparent hover:bg-navy-100 dark:hover:bg-navy-850 border border-navy-300 dark:border-navy-700 text-navy-700 dark:text-navy-200 text-xs font-bold rounded-lg"
          >
            View Pricing Packages
          </Link>
        </div>
      </section>

    </div>
  );
};
