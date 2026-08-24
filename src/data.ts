import { Subject, LessonPackage, FAQ, Testimonial } from "./types";

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: "sub-1",
    name: "Core Mathematics (Grade 10-12 CAPS)",
    description: "Full curriculum coverage of South African National Senior Certificate Core Mathematics, focusing on algebraic functions, trigonometry, analytical geometry, calculus, and probability.",
    grade_level: "Matric Upgrade",
    price_per_hour: 300,
    topics: [
      "Algebraic Expressions & Equations",
      "Functions & Graphs (Parabola, Hyperbola, Exponential)",
      "Trigonometry (Reduction, Identities, 2D/3D)",
      "Analytical Geometry",
      "Differential Calculus",
      "Probability & Fundamental Counting Principle",
      "Financial Mathematics (Annuities & Depreciation)",
      "Statistics & Regression analysis"
    ],
    is_active: true
  },
  {
    id: "sub-2",
    name: "Technical Mathematics (CAPS)",
    description: "Specialized mathematics curriculum designed for technical high schools, integrating industrial application principles, complex numbers, circle geometry, and integration.",
    grade_level: "High School",
    price_per_hour: 300,
    topics: [
      "Complex Numbers",
      "Binary Numbers & Logarithms",
      "Functions & Analytical Geometry",
      "Trigonometry with Technology",
      "Euclidean & Circle Geometry",
      "Differential & Integral Calculus with Applications"
    ],
    is_active: true
  },
  {
    id: "sub-3",
    name: "Mathematics (Grade 10-12 IEB)",
    description: "Independent Examinations Board (IEB) curriculum, emphasizing deep critical thinking, modeling, complex problem solving, and logical proofs.",
    grade_level: "IEB",
    price_per_hour: 320,
    topics: [
      "Advanced Functions & Modeling",
      "Calculus with Optimization",
      "Three-Dimensional Trigonometry",
      "Euclidean Geometry & Conjectures",
      "Financial Annuities & Sinking Funds",
      "Permutations & Combinations"
    ],
    is_active: true
  },
  {
    id: "sub-4",
    name: "Advanced Programme Mathematics (AP Maths IEB)",
    description: "Enrichment curriculum designed to bridge the gap between high school and university mathematics. Highly recommended for future engineering, finance, or science students.",
    grade_level: "IEB",
    price_per_hour: 350,
    topics: [
      "Advanced Calculus (Limits, Integration by parts)",
      "Matrix Algebra & Vectors",
      "Complex Numbers (De Moivre's Theorem)",
      "Mathematical Induction & Sequences",
      "Financial Derivatives & Statistics"
    ],
    is_active: true
  },
  {
    id: "sub-5",
    name: "TVET Mathematics (N1 - N6)",
    description: "Technical Vocational Education and Training mathematics preparation for engineering and vocational certifications, focusing on practical formulas, trigonometry, and calculus.",
    grade_level: "TVET",
    price_per_hour: 280,
    topics: [
      "N1-N3: Factorisation, Logarithms & Basic Trigonometry",
      "N4: Determinants, Complex Numbers & Sketching",
      "N5: Limits, Differentiation & Integration by Parts",
      "N6: Advanced Calculus & First-Order Differential Equations"
    ],
    is_active: false
  },
  {
    id: "sub-6",
    name: "University Calculus & Linear Algebra",
    description: "First-year university level support for courses like MAM1000W, WTW114, or MAT1503, focusing on rigorous proofs, limits, vectors, matrices, and multi-variable integration.",
    grade_level: "University",
    price_per_hour: 380,
    topics: [
      "Epsilon-Delta Limits & Continuity",
      "Rigorous Euclidean Vector Spaces",
      "Systems of Linear Equations (Gaussian Elimination)",
      "Eigenvalues & Eigenvectors",
      "Techniques of Integration & Improper Integrals"
    ],
    is_active: false
  },
  {
    id: "sub-7",
    name: "Mathematical Literacy (Grade 12 CAPS Upgrade)",
    description: "Comprehensive upgrade sessions focused on practical application of mathematics in everyday life, including finance, maps/plans, scales, measurement, and probability.",
    grade_level: "Matric Upgrade",
    price_per_hour: 250,
    topics: [
      "Personal & Business Finance (Tax, Loans, Tariffs)",
      "Measurement (Area, Volume, Conversions)",
      "Maps, Plans, and Other Representations",
      "Data Handling & Representation",
      "Probability in Daily Life"
    ],
    is_active: true
  }
];

export const DEFAULT_PACKAGES: LessonPackage[] = [
  {
    id: "pkg-1",
    name: "Single Session Booster",
    description: "Perfect for emergency exam prep or tackling a single challenging topic.",
    lessons_count: 1,
    price: 300,
    discount_percentage: 0,
    duration_days: 7,
    features: [
      "1 Hour 1-on-1 Live Lesson",
      "Custom Lesson Notes PDF",
      "Recording Available for 30 days",
      "WhatsApp Support for Follow-up Questions"
    ]
  },
  {
    id: "pkg-2",
    name: "4-Lesson Concept Upgrade",
    description: "Great for mastering an entire syllabus chapter (e.g., Calculus or Trigonometry).",
    lessons_count: 4,
    price: 1100,
    discount_percentage: 10,
    duration_days: 30,
    features: [
      "4 Hours of Dedicated Live Tutoring",
      "Interactive Digital Homework Assignments",
      "Curriculum-focused Homework Reviews",
      "WhatsApp Study Group Access",
      "10% Overall Savings vs Single Sessions"
    ]
  },
  {
    id: "pkg-3",
    name: "8-Lesson Mark Maximizer",
    description: "Our most popular package. Designed for students aiming for an upgrade above 20%+ in their matric mark.",
    lessons_count: 8,
    price: 2000,
    discount_percentage: 17,
    duration_days: 60,
    features: [
      "8 Hours of Personalized 1-on-1 Lessons",
      "Priority Scheduling and Slot Booking",
      "Full Mock Matric Exam and Grading",
      "Parent Progress Reports (Monthly)",
      "Direct Tutor-to-Student Message Thread",
      "17% Savings - Great Value"
    ]
  },
  {
    id: "pkg-4",
    name: "Monthly Unlimited Success",
    description: "Maximum intensive support. Up to 12 lessons a month, full access to custom video tutorial library requests.",
    lessons_count: 12,
    price: 4500,
    discount_percentage: 25,
    duration_days: 30,
    features: [
      "Up to 12 Hours of Live Tutoring Sessions",
      "Unlimited Video Lesson Requests (valued at R150 each)",
      "24-Hour Express Homework Grading",
      "Personalized South African University (APS) Consulting",
      "Uncapped Access to all Past Matric Papers & Memo Bank",
      "Dedicated Whatsapp Hotline"
    ]
  }
];

export const DEFAULT_FAQS: FAQ[] = [
  {
    id: "faq-1",
    question: "How does the online tutoring system work?",
    answer: "Our classes are conducted 100% online through interactive collaborative environments like Google Meet or Zoom. We use digital whiteboards, enabling both student and tutor to write out mathematical equations together in real-time. All sessions are recorded, so students can review them later.",
    category: "General",
    sort_order: 1,
    is_active: true
  },
  {
    id: "faq-2",
    question: "Can I upgrade my Grade 12 Matric Mathematics mark after already graduating?",
    answer: "Absolutely! South African students who want to improve their university admission points (APS) can enroll as upgrade candidates. We specialize in preparing students for Second Chance Matric Examinations or IEB upgrade exams, helping them boost their mathematics mark significantly.",
    category: "Matric Upgrade",
    sort_order: 2,
    is_active: true
  },
  {
    id: "faq-3",
    question: "What is the difference between CAPS and IEB tutoring styles?",
    answer: "CAPS focuses heavily on the public school national curriculum guidelines and exam structures. IEB involves independent examinations where questions are highly conceptual and require deep modeling. At Amaris Hub, we have expert tutors specializing in both paths, matching their material to the exam you'll write.",
    category: "Online Hub",
    sort_order: 3,
    is_active: true
  },
  {
    id: "faq-4",
    question: "How do I book a lesson or choose a package?",
    answer: "Simply create an account on our platform, log in, and use our interactive Booking Wizard. You select your syllabus category, choose your preferred tutor or subject, select a package, and reserve your date and time. Payments are processed securely on-platform.",
    category: "Lessons",
    sort_order: 4,
    is_active: true
  },
  {
    id: "faq-5",
    question: "What are Video Lesson Requests?",
    answer: "If you cannot fit a live lesson into your busy schedule, or need an urgent solution to a past-paper chapter, you can request a custom video lesson! You submit the chapter title, details, and upload any worksheets/memos. A tutor will record a dedicated, step-by-step video explaining the solution and send it straight to your student dashboard.",
    category: "Lessons",
    sort_order: 5,
    is_active: true
  },
  {
    id: "faq-6",
    question: "Do you offer any payment flexibility?",
    answer: "Yes, we support card payments, EFT bank transfers, and flexible payment gateways. Our 4-lesson and 8-lesson packages offer substantial discounts (up to 17% savings) compared to booking single emergency lessons, making sustained tutoring highly affordable.",
    category: "Payments",
    sort_order: 6,
    is_active: true
  }
];

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "t-1",
    student_id: "user-1",
    student_name: "Bethuel Thipe",
    grade: "Matric Upgrade (Calculus focus)",
    content: "I wrote my NSC exams in 2025 and got 48% in mathematics, which blocked me from studying BCom Computer Science. After working with Amaris Learning Hub for 4 months, I upgraded my mark to 86%! The live screen whiteboard sessions and custom homework feedback were incredible.",
    rating: 5,
    is_approved: true,
    created_at: "2026-05-15"
  },
  {
    id: "t-2",
    student_id: "user-2",
    student_name: "Lerato Mokoena",
    grade: "Grade 12 IEB",
    content: "IEB math can be extremely tough and theoretical. Amaris broke down advanced geometry and functions into logical steps. My tutor was patient and explained things multiple ways. Improved from 58% in Term 1 to a level 7 distinction (82%) by finals!",
    rating: 5,
    is_approved: true,
    created_at: "2026-06-02"
  },
  {
    id: "t-3",
    student_id: "user-3",
    student_name: "Sipho Ndlovu",
    grade: "Matric Upgrade Candidate",
    content: "The Video Lesson Request feature is a lifesaver. When I was stuck on financial maths annuities at midnight, I uploaded the question. By next afternoon, I had a 15-minute video breakdown of the formulas. Upgraded my mark from 51% to 78%!",
    rating: 5,
    is_approved: true,
    created_at: "2026-06-25"
  }
];
