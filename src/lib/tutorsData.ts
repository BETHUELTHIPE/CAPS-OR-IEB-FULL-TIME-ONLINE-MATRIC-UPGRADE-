export interface TutorExpert {
  id: string;
  name: string;
  surname: string;
  fullName: string;
  title: string;
  email: string;
  avatar: string;
  syllabusFocus: ("CAPS" | "IEB" | "AP Maths")[];
  subjectExpertise: string[];
  curriculumSummary: string;
  gradeSpecialty: string;
  university: string;
  qualifications: string[];
  yearsExperience: number;
  rating: number;
  reviewCount: number;
  totalLessonsCompleted: number;
  avgStudentGradeJump: number; // e.g. 22.4 (+22.4% average mark leap)
  hourlyRate: number;
  bio: string;
  teachingPhilosophy: string;
  topTopics: string[];
  availableWeeklySlots: string[];
  isAvailable: boolean;
  badgeLabel?: string;
  highlightStrengths: string[];
}

export const TUTOR_SUBJECT_TOPICS = [
  { id: "all", name: "All Mathematical Topics" },
  { id: "calculus", name: "Differential Calculus & Limits", keywords: ["calculus", "differential", "limits", "optimization", "rates of change"] },
  { id: "trigonometry", name: "Trigonometry & 2D/3D Proofs", keywords: ["trigonometry", "identities", "reduction", "sine rule", "cosine rule"] },
  { id: "euclidean", name: "Euclidean Geometry (Circle Theorems)", keywords: ["euclidean", "geometry", "circle theorems", "proportionality", "similarity"] },
  { id: "analytical", name: "Analytical Geometry", keywords: ["analytical", "circles", "tangents", "inclination", "gradients"] },
  { id: "functions", name: "Functions & Inverses (Parabolas, Exponentials)", keywords: ["functions", "inverses", "parabolas", "hyperbolas", "cubic graphs"] },
  { id: "algebra", name: "Algebra, Surds & Equations", keywords: ["algebra", "surds", "quadratic", "inequalities", "simultaneous"] },
  { id: "sequences", name: "Sequences, Series & Sigma Notation", keywords: ["sequences", "series", "sigma", "arithmetic", "geometric"] },
  { id: "finance", name: "Financial Maths (Annuities & Sinking Funds)", keywords: ["financial", "finance", "annuities", "sinking funds", "compound interest"] },
  { id: "statistics", name: "Statistics & Probability", keywords: ["statistics", "probability", "regression", "correlation", "counting principles"] },
  { id: "ap_advanced", name: "AP Maths & Integration", keywords: ["ap maths", "integration", "differential equations", "matrices", "partial fractions"] }
];

export const ALL_TUTORS_DATABASE: TutorExpert[] = [
  {
    id: "usr-bethuel",
    name: "Bethuel",
    surname: "Moukangwe",
    fullName: "Bethuel Moukangwe",
    title: "Founder & Head Mathematics Coach",
    email: "bethuelmoukangwe8@gmail.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=350",
    syllabusFocus: ["CAPS", "IEB", "AP Maths"],
    subjectExpertise: [
      "Differential Calculus & Limits",
      "Integration & Advanced Calculus",
      "Analytical Geometry",
      "Algebra, Surds & Equations",
      "Trigonometry & 2D/3D Proofs",
      "Functions & Inverses",
      "Optimization & Rates of Change"
    ],
    curriculumSummary: "CAPS & IEB Senior Specialist (Paper 1 & Paper 2 Mastery)",
    gradeSpecialty: "Grade 10 - 12 & Matric Upgrade",
    university: "University of Pretoria & Wits University",
    qualifications: [
      "BSc Mathematical Sciences (UP)",
      "100% Matric Distinction Coach",
      "Senior CAPS & IEB Lead Curriculum Assessor",
      "Golden Key International Honour Society"
    ],
    yearsExperience: 7,
    rating: 5.0,
    reviewCount: 148,
    totalLessonsCompleted: 385,
    avgStudentGradeJump: 22.4,
    hourlyRate: 250,
    bio: "Head Coach and architect of the Amaris Whiteboard method. Specializing in breaking down high-stakes matric exam problems into foolproof algebraic steps with live interactive chalkboard proofs.",
    teachingPhilosophy: "Every student can conquer matric maths by focusing on first-principles proofs, geometric spatial visualization, and timed past-paper simulation rather than memorizing formulas.",
    topTopics: ["Calculus Optimization", "Trig Identities", "Analytical Geometry", "Exam Paper 1 & 2 Strategy"],
    availableWeeklySlots: ["Mon 16:00 - 17:00", "Mon 18:00 - 19:00", "Wed 18:00 - 19:00", "Thu 16:30 - 17:30", "Fri 15:00 - 16:00", "Sat 10:00 - 11:00"],
    isAvailable: true,
    badgeLabel: "Head Coach ★",
    highlightStrengths: ["100% Pass Rate", "Matric Upgrade Leader", "Calculus Pro"]
  },
  {
    id: "usr-naledi",
    name: "Naledi",
    surname: "Nkosi",
    fullName: "Naledi Nkosi",
    title: "Senior CAPS Curriculum Specialist",
    email: "naledi.n@amaris.co.za",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=350",
    syllabusFocus: ["CAPS"],
    subjectExpertise: [
      "Trigonometry & 2D/3D Proofs",
      "Euclidean Geometry (Circle Theorems)",
      "Algebra, Surds & Equations",
      "Financial Maths (Annuities & Sinking Funds)",
      "Functions & Inverses",
      "Sequences, Series & Sigma Notation"
    ],
    curriculumSummary: "CAPS NSC High School & Matric Upgrade Specialist",
    gradeSpecialty: "Grade 10 - 12 CAPS",
    university: "University of Pretoria (UP)",
    qualifications: [
      "BSc Applied Mathematics & Mathematical Statistics (UP)",
      "PGCE Senior & FET Phase Mathematics (Distinction)",
      "Gauteng Provincial Top Mathematics Educator Award"
    ],
    yearsExperience: 5,
    rating: 4.92,
    reviewCount: 96,
    totalLessonsCompleted: 240,
    avgStudentGradeJump: 18.6,
    hourlyRate: 220,
    bio: "Passionate CAPS mathematics coach dedicated to closing syllabus gaps in Euclidean circle theorems, reduction formula proofs, and financial arithmetic. Has mentored over 200 matric students to university exemption.",
    teachingPhilosophy: "Clear step-by-step diagrams and consistent homework reinforcement create unbreakable foundational confidence for Paper 1 and Paper 2.",
    topTopics: ["Euclidean Circle Geometry", "Trigonometric Graphs", "Financial Annuities", "Quadratic Inequalities"],
    availableWeeklySlots: ["Mon 15:00 - 16:00", "Tue 15:00 - 16:00", "Wed 18:00 - 19:00", "Thu 15:00 - 16:00", "Sat 10:00 - 11:00"],
    isAvailable: true,
    badgeLabel: "CAPS Specialist",
    highlightStrengths: ["Euclidean Geometry", "High School Foundation", "Clear Whiteboard Style"]
  },
  {
    id: "usr-thabo",
    name: "Thabo",
    surname: "Mokoena",
    fullName: "Thabo Mokoena",
    title: "IEB & AP Mathematics Lead",
    email: "thabo.m@amaris.co.za",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=350",
    syllabusFocus: ["IEB", "AP Maths"],
    subjectExpertise: [
      "AP Maths & Integration",
      "Differential Calculus & Limits",
      "Sequences, Series & Sigma Notation",
      "Functions & Inverses",
      "Differential Equations & Modelling",
      "Algebra, Surds & Equations"
    ],
    curriculumSummary: "IEB Independent Board & Advanced Programme (AP) Mathematics Lead",
    gradeSpecialty: "Grade 11 - 12 IEB & AP Maths",
    university: "University of the Witwatersrand (Wits)",
    qualifications: [
      "BSc Actuarial Science & Pure Mathematics (Wits)",
      "IEB National Mathematics Assessor & Moderator",
      "Senior AP Mathematics Curriculum Facilitator"
    ],
    yearsExperience: 6,
    rating: 4.96,
    reviewCount: 112,
    totalLessonsCompleted: 290,
    avgStudentGradeJump: 20.1,
    hourlyRate: 280,
    bio: "Specializes in high-rigor IEB analytical challenges and Advanced Programme Mathematics (AP Maths). Prepares students for elite STEM, Engineering, and Actuarial science university entrance requirements.",
    teachingPhilosophy: "IEB rewards conceptual depth over pattern matching. We dissect non-standard problem formulations, mathematical proofs, and abstract calculus mechanics.",
    topTopics: ["Integration by Parts", "Differential Equations", "Recursive Sequences", "Complex Numbers"],
    availableWeeklySlots: ["Mon 18:00 - 19:00", "Wed 16:00 - 17:00", "Thu 16:30 - 17:30", "Fri 15:00 - 16:00", "Sat 11:30 - 12:30"],
    isAvailable: true,
    badgeLabel: "IEB & AP Lead",
    highlightStrengths: ["AP Maths", "Engineering Prep", "Higher Order Reasoning"]
  },
  {
    id: "usr-sarah",
    name: "Dr. Sarah",
    surname: "Jenkins",
    fullName: "Dr. Sarah Jenkins",
    title: "Senior Geometry & Probability Fellow",
    email: "sarah.j@amaris.co.za",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=350",
    syllabusFocus: ["CAPS", "IEB"],
    subjectExpertise: [
      "Euclidean Geometry (Circle Theorems)",
      "Analytical Geometry",
      "Statistics & Probability",
      "Trigonometry & 2D/3D Proofs",
      "Algebra, Surds & Equations"
    ],
    curriculumSummary: "CAPS & IEB Senior Geometry and Data Handling Specialist",
    gradeSpecialty: "Grade 10 - 12 Foundation & Advanced",
    university: "University of Cape Town (UCT)",
    qualifications: [
      "PhD in Mathematics Education (UCT)",
      "BSc (Hons) Pure Mathematics (UCT)",
      "National Mathematics Olympiad Coach"
    ],
    yearsExperience: 8,
    rating: 4.88,
    reviewCount: 84,
    totalLessonsCompleted: 195,
    avgStudentGradeJump: 17.2,
    hourlyRate: 260,
    bio: "Published mathematics educator with a deep passion for unlocking visual intuition in Euclidean proofs, analytical geometry coordinates, and probability counting principles.",
    teachingPhilosophy: "Geometry is not about memorizing theorem codes; it is the art of seeing geometric relationships. Once you see the pattern, the proof writes itself.",
    topTopics: ["Proportionality Theorems", "Circles with Tangents", "Regression Analysis", "Fundamental Counting Principle"],
    availableWeeklySlots: ["Mon 15:00 - 16:00", "Tue 16:00 - 17:00", "Thu 15:00 - 16:00", "Fri 15:00 - 16:00", "Sat 14:00 - 15:00"],
    isAvailable: true,
    badgeLabel: "Geometry Expert",
    highlightStrengths: ["Olympiad Training", "Visual Proofs", "Statistics Expert"]
  },
  {
    id: "usr-kgomotso",
    name: "Kgomotso",
    surname: "Dlamini",
    fullName: "Kgomotso Dlamini",
    title: "Paper 1 Specialist (Calculus, Functions & Finance)",
    email: "kgomotso.d@amaris.co.za",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=350",
    syllabusFocus: ["CAPS"],
    subjectExpertise: [
      "Differential Calculus & Limits",
      "Functions & Inverses",
      "Financial Maths (Annuities & Sinking Funds)",
      "Algebra, Surds & Equations",
      "Sequences, Series & Sigma Notation"
    ],
    curriculumSummary: "CAPS Matric Paper 1 Booster & Algebraic Fluency Coach",
    gradeSpecialty: "Grade 11 - 12 & Matric Upgrade",
    university: "University of Johannesburg (UJ)",
    qualifications: [
      "BSc Mathematical Sciences (UJ)",
      "FET Mathematics Specialist Certificate",
      "Matric Second-Chance Project Lead Tutor"
    ],
    yearsExperience: 4,
    rating: 4.90,
    reviewCount: 72,
    totalLessonsCompleted: 168,
    avgStudentGradeJump: 19.4,
    hourlyRate: 230,
    bio: "Focuses on boosting Paper 1 scorecards from 40% to 75%+. Known for patient, encouraging whiteboard walk-throughs on cubic graph sketching, optimization equations, and complex financial timelines.",
    teachingPhilosophy: "Mastering Paper 1 is about routine algebraic precision and recognizing problem types instantly so exam panic never sets in.",
    topTopics: ["Cubic Polynomials", "Financial Timelines & Loans", "First Principles Derivatives", "Sigma Calculations"],
    availableWeeklySlots: ["Tue 16:30 - 17:30", "Wed 15:00 - 16:00", "Thu 17:00 - 18:00", "Fri 16:00 - 17:00", "Sun 10:00 - 11:00"],
    isAvailable: true,
    badgeLabel: "Paper 1 Pro",
    highlightStrengths: ["Rapid Mark Booster", "Patience & Clarity", "Financial Maths"]
  },
  {
    id: "usr-farai",
    name: "Farai",
    surname: "Moyo",
    fullName: "Farai Moyo",
    title: "IEB Critical Thinking & Proof Strategist",
    email: "farai.m@amaris.co.za",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=350",
    syllabusFocus: ["IEB"],
    subjectExpertise: [
      "Trigonometry & 2D/3D Proofs",
      "Euclidean Geometry (Circle Theorems)",
      "Analytical Geometry",
      "Sequences, Series & Sigma Notation",
      "Statistics & Probability",
      "Functions & Inverses"
    ],
    curriculumSummary: "IEB Senior High School Exam Prep & Paper 2 Strategist",
    gradeSpecialty: "Grade 10 - 12 IEB",
    university: "Rhodes University & Wits University",
    qualifications: [
      "BSc (Hons) Applied Mathematics (Rhodes)",
      "IEB Mathematics Distinction Mentor",
      "Private College FET Educator"
    ],
    yearsExperience: 5,
    rating: 4.94,
    reviewCount: 89,
    totalLessonsCompleted: 210,
    avgStudentGradeJump: 19.0,
    hourlyRate: 260,
    bio: "Dedicated to private school students preparing for the demanding IEB mathematics curriculum. Highly skilled in Paper 2 Trigonometry 3D problem modeling, circle tangents, and Venn probability setups.",
    teachingPhilosophy: "We turn intimidating multi-part exam questions into a sequence of small, conquerable logic steps.",
    topTopics: ["3D Trigonometric Heights", "Circle Analytical Geometry", "Venn & Tree Probability", "Logarithmic Functions"],
    availableWeeklySlots: ["Mon 17:00 - 18:00", "Tue 18:00 - 19:00", "Thu 16:00 - 17:00", "Sat 09:00 - 10:00", "Sun 11:00 - 12:00"],
    isAvailable: true,
    badgeLabel: "IEB Specialist",
    highlightStrengths: ["3D Trigonometry", "Paper 2 Strategy", "Confidence Coaching"]
  }
];
