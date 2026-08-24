import { 
  Profile, Subject, LessonPackage, Booking, Payment, Testimonial, 
  FAQ, ContactMessage, VideoLessonRequest, HomeworkAssignment, HomeworkSubmission, Announcement,
  ActivityLog, AttendanceEvent, StudentAttendanceRecord, VideoToSell, ResourceLibraryItem, Subscriber, EmailLog, MockExamScore,
  ExamPrediction, ExamDelivery, TutorReport, AMHNotification, Subscription, SubscriptionInvoice, DeepFocusSession, ArcadeScore, ArcadeAchievement
} from "../types";
import { DEFAULT_SUBJECTS, DEFAULT_PACKAGES, DEFAULT_FAQS, DEFAULT_TESTIMONIALS } from "../data";
import { firestoreDB, COLLECTIONS, initializeFirebaseBackend } from "./firestoreService";


// Helper to generate a unique ID
export const generateId = (prefix = "id"): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper to generate AMH booking reference
export const generateBookingReference = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let ref = "";
  for (let i = 0; i < 7; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AMH-${ref}`;
};

// Helper to check if a profile is a Super Admin
export const isSuperAdmin = (user: Profile | null | undefined): boolean => {
  if (!user || !user.email) return false;
  const emailLower = user.email.toLowerCase().trim();
  if (emailLower === "bethuelmoukangwe8@gmail.com") return true;
  if (user.role === "super_admin" || user.is_super_admin === true) return true;
  if (user.role === "admin" && (user.id === "usr-bethuel" || emailLower.includes("superadmin"))) return true;
  return false;
};

export const initDatabase = () => {
  if (!localStorage.getItem("amh_subjects")) {
    localStorage.setItem("amh_subjects", JSON.stringify(DEFAULT_SUBJECTS));
  }
  if (!localStorage.getItem("amh_packages")) {
    localStorage.setItem("amh_packages", JSON.stringify(DEFAULT_PACKAGES));
  }
  if (!localStorage.getItem("amh_faqs")) {
    localStorage.setItem("amh_faqs", JSON.stringify(DEFAULT_FAQS));
  }
  if (!localStorage.getItem("amh_testimonials")) {
    localStorage.setItem("amh_testimonials", JSON.stringify(DEFAULT_TESTIMONIALS));
  }
  if (!localStorage.getItem("amh_deep_focus_sessions")) {
    const defaultFocusSessions: DeepFocusSession[] = [
      {
        id: "focus-1",
        student_id: "usr-bethuel",
        topic_name: "Algebra & Equations (CAPS P1 Q1.1)",
        paper_category: "CAPS P1",
        duration_minutes: 25,
        actual_seconds_focused: 1500,
        marks_achieved: 4,
        total_marks: 4,
        score_percentage: 100,
        ambient_audio_used: "focus_tone",
        notes: "Solved quadratic equation via formula perfectly in 18 minutes.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
      },
      {
        id: "focus-2",
        student_id: "usr-bethuel",
        topic_name: "Differential Calculus First Principles (CAPS P1 Q8.1)",
        paper_category: "CAPS P1",
        duration_minutes: 30,
        actual_seconds_focused: 1800,
        marks_achieved: 5,
        total_marks: 5,
        score_percentage: 100,
        ambient_audio_used: "rain",
        notes: "Expanded limit formula step-by-step with zero algebraic sign errors.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
      },
      {
        id: "focus-3",
        student_id: "usr-bethuel",
        topic_name: "Trigonometric Reductions & Identities (CAPS P2 Q5.1)",
        paper_category: "CAPS P2",
        duration_minutes: 20,
        actual_seconds_focused: 1200,
        marks_achieved: 5,
        total_marks: 6,
        score_percentage: 83,
        ambient_audio_used: "focus_tone",
        notes: "Simplified co-functions cleanly. Rewatched identity proof hint.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
      }
    ];
    localStorage.setItem("amh_deep_focus_sessions", JSON.stringify(defaultFocusSessions));
  }
  if (!localStorage.getItem("amh_arcade_scores")) {
    const defaultArcadeScores: ArcadeScore[] = [
      {
        id: "arcade-1",
        student_id: "usr-lerato",
        student_name: "Lerato Dlamini",
        velocity_points: 2150,
        correct_count: 35,
        total_questions: 36,
        accuracy_percentage: 97,
        max_combo: 24,
        mode: "algebra_frenzy",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString()
      },
      {
        id: "arcade-2",
        student_id: "usr-bethuel",
        student_name: "Bethuel Thipe",
        velocity_points: 1850,
        correct_count: 31,
        total_questions: 32,
        accuracy_percentage: 97,
        max_combo: 21,
        mode: "algebra_frenzy",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      },
      {
        id: "arcade-3",
        student_id: "usr-anika",
        student_name: "Anika van Zyl",
        velocity_points: 1680,
        correct_count: 28,
        total_questions: 30,
        accuracy_percentage: 93,
        max_combo: 18,
        mode: "speed_calc",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
      },
      {
        id: "arcade-4",
        student_id: "usr-bethuel",
        student_name: "Bethuel Thipe",
        velocity_points: 1420,
        correct_count: 25,
        total_questions: 26,
        accuracy_percentage: 96,
        max_combo: 16,
        mode: "60s_blitz",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
      },
      {
        id: "arcade-5",
        student_id: "usr-sipho",
        student_name: "Sipho Mokoena",
        velocity_points: 1180,
        correct_count: 21,
        total_questions: 23,
        accuracy_percentage: 91,
        max_combo: 12,
        mode: "survival_3_lives",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString()
      },
      {
        id: "arcade-6",
        student_id: "usr-thabo",
        student_name: "Thabo Molefe",
        velocity_points: 950,
        correct_count: 17,
        total_questions: 19,
        accuracy_percentage: 89,
        max_combo: 8,
        mode: "60s_blitz",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      }
    ];
    localStorage.setItem("amh_arcade_scores", JSON.stringify(defaultArcadeScores));
  }
  if (!localStorage.getItem("amh_profiles")) {
    // Seed with a default student profile (Bethuel - set as super admin for the Upgrade academy)
    const defaultProfile: Profile = {
      id: "usr-bethuel",
      first_name: "Bethuel",
      surname: "Moukangwe",
      email: "bethuelmoukangwe8@gmail.com",
      phone: "071 415 6665",
      whatsapp_number: "071 415 6665",
      province: "Gauteng",
      school: "Pretoria High School",
      grade: "Matric Upgrade",
      parent_name: "Sarah Moukangwe",
      parent_phone: "+27 82 555 1234",
      role: "admin",
      is_super_admin: true,
      avatar_url: "",
      specialization: "Calculus & Analytical Geometry",
      bio: "Founder & Head Coach at Amaris Mathematics Hub.",
      is_available: true
    };
    
    const nalediProfile: Profile = {
      id: "usr-naledi",
      first_name: "Naledi",
      surname: "Nkosi",
      email: "naledi.n@amaris.co.za",
      phone: "072 123 4567",
      whatsapp_number: "072 123 4567",
      province: "Gauteng",
      school: "University of Pretoria",
      grade: "CAPS Specialist",
      parent_name: "",
      parent_phone: "",
      role: "tutor",
      avatar_url: "",
      specialization: "Trigonometry & Algebra",
      bio: "CAPS curriculum expert with 4+ years of high school mathematics coaching experience.",
      is_available: false
    };

    const thaboProfile: Profile = {
      id: "usr-thabo",
      first_name: "Thabo",
      surname: "Mokoena",
      email: "thabo.m@amaris.co.za",
      phone: "083 987 6543",
      whatsapp_number: "083 987 6543",
      province: "Free State",
      school: "Wits University",
      grade: "IEB & AP Specialist",
      parent_name: "",
      parent_phone: "",
      role: "tutor",
      avatar_url: "",
      specialization: "IEB Mathematics & AP Maths",
      bio: "AP Maths specialist. Passionate about prepping matric pupils for university level mathematics.",
      is_available: true
    };

    const siphoProfile: Profile = {
      id: "usr-sipho",
      first_name: "Sipho",
      surname: "Ndlovu",
      email: "sipho.ndlovu@gmail.com",
      phone: "072 555 4321",
      whatsapp_number: "072 555 4321",
      province: "Gauteng",
      school: "Soweto High School",
      grade: "Matric Upgrade",
      parent_name: "John Ndlovu",
      parent_phone: "+27 82 555 9876",
      role: "student",
      avatar_url: "",
      created_at: "2026-06-01"
    };

    const leratoProfile: Profile = {
      id: "usr-lerato",
      first_name: "Lerato",
      surname: "Mokoena",
      email: "lerato.mokoena@gmail.com",
      phone: "083 555 7788",
      whatsapp_number: "083 555 7788",
      province: "Gauteng",
      school: "St David's IEB College",
      grade: "Grade 12 IEB",
      parent_name: "Grace Mokoena",
      parent_phone: "+27 83 555 4321",
      role: "student",
      avatar_url: "",
      created_at: "2026-06-10"
    };

    localStorage.setItem("amh_profiles", JSON.stringify([defaultProfile, nalediProfile, thaboProfile, siphoProfile, leratoProfile]));
  } else {
    // If profiles exist, ensure our tutors and students are present
    const profiles = JSON.parse(localStorage.getItem("amh_profiles") || "[]") as Profile[];
    let updated = false;
    
    if (!profiles.some(p => p.id === "usr-naledi" || p.email === "naledi.n@amaris.co.za")) {
      profiles.push({
        id: "usr-naledi",
        first_name: "Naledi",
        surname: "Nkosi",
        email: "naledi.n@amaris.co.za",
        phone: "072 123 4567",
        whatsapp_number: "072 123 4567",
        province: "Gauteng",
        school: "University of Pretoria",
        grade: "CAPS Specialist",
        parent_name: "",
        parent_phone: "",
        role: "tutor",
        avatar_url: "",
        specialization: "Trigonometry & Algebra",
        bio: "CAPS curriculum expert with 4+ years of high school mathematics coaching experience.",
        is_available: false
      });
      updated = true;
    }
    
    if (!profiles.some(p => p.id === "usr-thabo" || p.email === "thabo.m@amaris.co.za")) {
      profiles.push({
        id: "usr-thabo",
        first_name: "Thabo",
        surname: "Mokoena",
        email: "thabo.m@amaris.co.za",
        phone: "083 987 6543",
        whatsapp_number: "083 987 6543",
        province: "Free State",
        school: "Wits University",
        grade: "IEB & AP Specialist",
        parent_name: "",
        parent_phone: "",
        role: "tutor",
        avatar_url: "",
        specialization: "IEB Mathematics & AP Maths",
        bio: "AP Maths specialist. Passionate about prepping matric pupils for university level mathematics.",
        is_available: true
      });
      updated = true;
    }

    if (!profiles.some(p => p.id === "usr-sipho" || p.email === "sipho.ndlovu@gmail.com")) {
      profiles.push({
        id: "usr-sipho",
        first_name: "Sipho",
        surname: "Ndlovu",
        email: "sipho.ndlovu@gmail.com",
        phone: "072 555 4321",
        whatsapp_number: "072 555 4321",
        province: "Gauteng",
        school: "Soweto High School",
        grade: "Matric Upgrade",
        parent_name: "John Ndlovu",
        parent_phone: "+27 82 555 9876",
        role: "student",
        avatar_url: "",
        created_at: "2026-06-01"
      });
      updated = true;
    }

    if (!profiles.some(p => p.id === "usr-lerato" || p.email === "lerato.mokoena@gmail.com")) {
      profiles.push({
        id: "usr-lerato",
        first_name: "Lerato",
        surname: "Mokoena",
        email: "lerato.mokoena@gmail.com",
        phone: "083 555 7788",
        whatsapp_number: "083 555 7788",
        province: "Gauteng",
        school: "St David's IEB College",
        grade: "Grade 12 IEB",
        parent_name: "Grace Mokoena",
        parent_phone: "+27 83 555 4321",
        role: "student",
        avatar_url: "",
        created_at: "2026-06-10"
      });
      updated = true;
    }
    
    if (updated) {
      localStorage.setItem("amh_profiles", JSON.stringify(profiles));
    }
  }
  if (!localStorage.getItem("amh_homework_assignments")) {
    // Seed default assignments
    const defaultAssignments: HomeworkAssignment[] = [
      {
        id: "hw-1",
        student_id: "usr-bethuel",
        title: "Calculus Limits & First Principles",
        description: "Determine the derivative of f(x) = 2x^2 - 3x using first principles. Show all working steps.",
        subject: "Core Mathematics (Grade 10-12 CAPS)",
        due_date: "2026-07-15",
        status: "assigned",
        created_at: "2026-07-06"
      },
      {
        id: "hw-2",
        student_id: "usr-bethuel",
        title: "Trigonometric Identities & General Solutions",
        description: "Solve the general solution of 2sin(x)cos(x) - cos(x) = 0. Prove the identity sin(2A) / (1 + cos(2A)) = tan(A).",
        subject: "Core Mathematics (Grade 10-12 CAPS)",
        due_date: "2026-07-22",
        status: "assigned",
        created_at: "2026-07-06"
      },
      {
        id: "hw-3",
        student_id: "usr-bethuel",
        title: "Analytical Geometry Booster Problem Set",
        description: "Complete exercise 4.2 in the classroom study pack. Focus on distance formula and tangents to a circle.",
        subject: "Core Mathematics (Grade 10-12 CAPS)",
        due_date: "2026-07-10",
        status: "graded",
        created_at: "2026-06-30"
      }
    ];
    localStorage.setItem("amh_homework_assignments", JSON.stringify(defaultAssignments));
  }
  if (!localStorage.getItem("amh_homework_submissions")) {
    // Seed one graded submission with feedback
    const defaultSubmissions: HomeworkSubmission[] = [
      {
        id: "sub-hw-3",
        assignment_id: "hw-3",
        student_id: "usr-bethuel",
        file_url: "#",
        file_name: "Analytical_Geometry_Exercise_4_2.pdf",
        file_type: "application/pdf",
        file_size: "2.4 MB",
        notes: "Here are my completed circles and tangents solutions. I had some trouble with question 5b.",
        status: "reviewed",
        tutor_feedback: "Excellent layout of your algebraic working! For 5b, remember that the radius is perpendicular to the tangent at the point of contact, meaning their gradients multiply to -1. Try applying that to find the slope of the tangent. Level 7 execution!",
        created_at: "2026-07-01"
      }
    ];
    localStorage.setItem("amh_homework_submissions", JSON.stringify(defaultSubmissions));
  }
  if (!localStorage.getItem("amh_bookings")) {
    // Seed default booking
    const defaultBookings: Booking[] = [
      {
        id: "bk-1",
        student_id: "usr-bethuel",
        subject_id: "sub-1",
        package_id: "pkg-2",
        booking_reference: "AMH-8X2F1W9",
        lesson_date: "2026-07-12",
        lesson_time: "15:00",
        duration_minutes: 60,
        platform: "Zoom",
        topics_to_cover: ["Differential Calculus", "Optimization Problems"],
        notes: "Wanting to cover calculus optimization and graph sketching rules. Zoom Live Whiteboard room pre-configured.",
        status: "confirmed",
        meeting_link: "https://zoom.us/j/84920193847?pwd=amhWhiteboard2026",
        created_at: "2026-07-05"
      }
    ];
    localStorage.setItem("amh_bookings", JSON.stringify(defaultBookings));
  }
  if (!localStorage.getItem("amh_payments")) {
    const defaultPayments: Payment[] = [
      {
        id: "pay-1",
        booking_id: "bk-1",
        student_id: "usr-bethuel",
        amount: 1100,
        currency: "ZAR",
        payment_method: "Instant EFT (PayFast)",
        transaction_id: "PF-738920194",
        status: "successful",
        created_at: "2026-07-05"
      }
    ];
    localStorage.setItem("amh_payments", JSON.stringify(defaultPayments));
  }
  if (!localStorage.getItem("amh_video_requests")) {
    const defaultVideoRequests: VideoLessonRequest[] = [
      {
        id: "vid-1",
        student_id: "usr-bethuel",
        subject: "Core Mathematics (Grade 10-12 CAPS)",
        chapter_title: "Financial Maths: Sinking Funds Breakdown",
        description: "Need a complete breakdown of sinking fund calculations. When to add or subtract an installment, and how inflation affects the future machine cost.",
        document_urls: ["#"],
        document_names: ["Sinking_Fund_Annuities.jpg"],
        status: "completed",
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", // rickroll as fun fallback video
        duration_minutes: 18,
        price: 150,
        payment_status: "paid",
        notes: "Assigned to Tutor Bethuel Moukangwe.",
        created_at: "2026-07-04"
      }
    ];
    localStorage.setItem("amh_video_requests", JSON.stringify(defaultVideoRequests));
  }
  if (!localStorage.getItem("amh_announcements")) {
    const defaultAnnouncements: Announcement[] = [
      {
        id: "ann-1",
        title: "⚡ Grade 12 Trial Exam Prep Workshops starting this Saturday!",
        content: "Gear up for your upcoming trial examinations with our intensive CAPS math workshop series. Head tutor Bethuel Moukangwe will cover algebraic functions, optimization problems, and technical circle geometry proofs starting this Saturday at 09:00 AM. Access links will be sent to confirmed student portals.",
        category: "Exam Prep",
        created_at: "2026-07-07",
        is_urgent: true
      },
      {
        id: "ann-2",
        title: "🕒 Whiteboard Recording Delivery Tiers Available Now",
        content: "Need custom video explanations even faster? We have introduced Express delivery! Standard video answers are still available at R150/hour (within 24 hours), and you can now choose Express at R250/hour to get guaranteed delivery within 4 hours. You can request these from your student video requests dashboard.",
        category: "General",
        created_at: "2026-07-08",
        is_urgent: false
      },
      {
        id: "ann-3",
        title: "📚 Calculus Formula Cheat Sheet & Study Guide",
        content: "A comprehensive core mathematics formula sheet covering limits, derivatives from first principles, and trigonometric proof shortcuts has been uploaded. Navigate to the learning hub or consult your assigned homework worksheet packages for direct download.",
        category: "Academic",
        created_at: "2026-07-05",
        is_urgent: false
      }
    ];
    localStorage.setItem("amh_announcements", JSON.stringify(defaultAnnouncements));
  }
  if (!localStorage.getItem("amh_contact_messages")) {
    const defaultContacts: ContactMessage[] = [
      {
        id: "cnt-1",
        name: "Lindiwe Ndlovu",
        email: "lindiwe.n@gmail.com",
        phone: "082 334 1122",
        subject: "Inquiry about CAPS Matric Grade 12 Math upgrade",
        message: "Hi, my daughter wants to upgrade her maths mark from 52% to at least a level 7. How long is the course and do you have WhatsApp support?",
        status: "new",
        created_at: "2026-07-07"
      },
      {
        id: "cnt-2",
        name: "Jaco Pretorius",
        email: "jaco.pretorius@mweb.co.za",
        phone: "079 445 6677",
        subject: "IEB AP Maths pricing query",
        message: "Good day, do your packages support Advanced Programme Mathematics for grade 11 IEB? Please send me a quote.",
        status: "read",
        created_at: "2026-07-06"
      }
    ];
    localStorage.setItem("amh_contact_messages", JSON.stringify(defaultContacts));
  }
  if (!localStorage.getItem("amh_activity_logs")) {
    const defaultLogs: ActivityLog[] = [
      {
        id: "log-1",
        user_name: "Bethuel Thipe",
        action: "Admin logged in",
        details: "Admin session initialized from Pretoria, Gauteng",
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        type: "auth"
      },
      {
        id: "log-2",
        user_name: "Bethuel Thipe",
        action: "Completed Calculus Lesson",
        details: "Tutor Bethuel approved lesson rating: 5 stars",
        created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
        type: "booking"
      },
      {
        id: "log-3",
        user_name: "Bethuel",
        action: "Payment Received",
        details: "Instant EFT of R1100 received for 10-Hour Package",
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        type: "payment"
      },
      {
        id: "log-4",
        user_name: "Bethuel",
        action: "Requested Video Explanation",
        details: "Video explanation requested for 'Financial Maths: Sinking Funds'",
        created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
        type: "video"
      }
    ];
    localStorage.setItem("amh_activity_logs", JSON.stringify(defaultLogs));
  }
  if (!localStorage.getItem("amh_attendance_events")) {
    const defaultAttendance: AttendanceEvent[] = [
      {
        id: "att-1",
        title: "Calculus Limits & Derivations Masterclass",
        description: "An intensive CAPS interactive whiteboard workshop focusing on calculus limit theorems, first principles, and exam proofs.",
        date: "2026-07-18",
        time: "10:00",
        price: 150,
        spots_max: 20,
        spots_filled: 3,
        attendee_ids: ["usr-bethuel"],
        created_at: "2026-07-08"
      },
      {
        id: "att-2",
        title: "Analytical Geometry Circle Proofs Seminar",
        description: "Specialized focus on tangent circles, distance formulas, and proving geometric coordinate equations step-by-step.",
        date: "2026-07-25",
        time: "14:00",
        price: 200,
        spots_max: 15,
        spots_filled: 0,
        attendee_ids: [],
        created_at: "2026-07-08"
      }
    ];
    localStorage.setItem("amh_attendance_events", JSON.stringify(defaultAttendance));
  }
  if (!localStorage.getItem("amh_student_attendance_records")) {
    const defaultStudentAttendance: StudentAttendanceRecord[] = [
      {
        id: "att-rec-1",
        booking_id: "bk-1",
        booking_reference: "AMH-8X2F1W9",
        student_id: "usr-bethuel",
        student_name: "Bethuel Moukangwe",
        student_email: "bethuelmoukangwe8@gmail.com",
        grade: "Grade 12 (CAPS)",
        subject_id: "sub-1",
        subject_name: "Core Mathematics Grade 12",
        lesson_date: "2026-07-12",
        lesson_time: "15:00",
        joined_at: "2026-07-12T14:58:30+02:00",
        calendar_event_id: "gcal-evt-amh-8x2f1w9",
        calendar_event_link: "https://calendar.google.com/calendar/event?eid=YW1oLWJvb2tpbmctOGgyZjF3OSBhbWFyaXNtYXRoaHVi",
        status: "on_time",
        platform_joined: "Zoom Whiteboard",
        meeting_link: "https://zoom.us/j/84920193847?pwd=amhWhiteboard2026",
        device_info: "Chrome on macOS (Desktop Client)",
        logged_to_google_sheets: true,
        sheets_row_synced_at: "2026-07-12T14:58:32+02:00"
      },
      {
        id: "att-rec-2",
        booking_id: "bk-demo-2",
        booking_reference: "AMH-9Y4K3L2",
        student_id: "usr-sipho",
        student_name: "Sipho Sithole",
        student_email: "sipho.sithole@school.co.za",
        grade: "Grade 12 (IEB)",
        subject_id: "sub-3",
        subject_name: "IEB Advanced Calculus & Vectors",
        lesson_date: "2026-07-15",
        lesson_time: "16:00",
        joined_at: "2026-07-15T16:01:12+02:00",
        calendar_event_id: "gcal-evt-amh-9y4k3l2",
        calendar_event_link: "https://calendar.google.com/calendar/event?eid=YW1oLWJvb2tpbmctOXk0azNsMiBhbWFyaXNtYXRoaHVi",
        status: "on_time",
        platform_joined: "Google Meet",
        meeting_link: "https://meet.google.com/amh-math-8821",
        device_info: "Chrome on Windows 11",
        logged_to_google_sheets: true,
        sheets_row_synced_at: "2026-07-15T16:01:15+02:00"
      },
      {
        id: "att-rec-3",
        booking_id: "bk-demo-3",
        booking_reference: "AMH-4P7M1Q8",
        student_id: "usr-lerato",
        student_name: "Lerato Khumalo",
        student_email: "lerato.khumalo@gmail.com",
        grade: "Grade 11 (CAPS)",
        subject_id: "sub-2",
        subject_name: "Trigonometry & Euclidean Geometry",
        lesson_date: "2026-07-18",
        lesson_time: "10:30",
        joined_at: "2026-07-18T10:34:45+02:00",
        calendar_event_id: "gcal-evt-amh-4p7m1q8",
        calendar_event_link: "https://calendar.google.com/calendar/event?eid=YW1oLWJvb2tpbmctNHA3bTFxOCBhbWFyaXNtYXRoaHVi",
        status: "late",
        platform_joined: "Zoom Whiteboard",
        meeting_link: "https://zoom.us/j/84920193847?pwd=amhWhiteboard2026",
        device_info: "Safari on iPad Pro",
        logged_to_google_sheets: true,
        sheets_row_synced_at: "2026-07-18T10:34:48+02:00"
      }
    ];
    localStorage.setItem("amh_student_attendance_records", JSON.stringify(defaultStudentAttendance));
  }
  if (!localStorage.getItem("amh_videos_to_sell")) {
    const defaultVideosToSell: VideoToSell[] = [
      {
        id: "vts-1",
        title: "Sequences & Series Arithmetic/Geometric Distinctions",
        description: "Complete video lesson breaking down quadratic sequences, sigma notations, and finding values of n for sum to infinity convergence.",
        price: 85,
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration: "45 Mins",
        chapter: "Algebraic Sequences",
        purchase_count: 12,
        created_at: "2026-07-05"
      },
      {
        id: "vts-2",
        title: "Differential Calculus optimization in real life",
        description: "Learn how to formulate volume and area equations, find maximum dimensions, and solve exam questions with Head Tutor Bethuel.",
        price: 110,
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration: "1 Hour 15 Mins",
        chapter: "Calculus",
        purchase_count: 8,
        created_at: "2026-07-06"
      }
    ];
    localStorage.setItem("amh_videos_to_sell", JSON.stringify(defaultVideosToSell));
  }
  if (!localStorage.getItem("amh_resource_library") || !localStorage.getItem("amh_resource_library_v3")) {
    const defaultResources: ResourceLibraryItem[] = [
      {
        id: "res-1",
        title: "Official NSC/CAPS Core Mathematics Formula Sheet",
        description: "The complete official formula booklet provided by the South African Department of Basic Education with handwritten tutor advice and key exam pointers.",
        file_type: "pdf",
        file_name: "NSC_CAPS_Maths_Formula_Sheet_Verified.pdf",
        file_size: "1.8 MB",
        file_url: "#",
        print_count: 54,
        created_at: "2026-07-07",
        syllabus: "CAPS",
        grade_level: "Grade 12",
        topic: "All Topics"
      },
      {
        id: "res-2",
        title: "Trigonometric Proof Identities & Reduction Rules",
        description: "A printable 1-page high-contrast summary sheet of all double angle expansion formulas, co-functions, and 180° / 360° reduction quadrants.",
        file_type: "pdf",
        file_name: "Trig_Identities_General_Rules.pdf",
        file_size: "950 KB",
        file_url: "#",
        print_count: 36,
        created_at: "2026-07-06",
        syllabus: "Both",
        grade_level: "Grade 12",
        topic: "Trigonometry"
      },
      {
        id: "res-3",
        title: "Differential Calculus Optimization Mastery Pack",
        description: "Step-by-step master guide for volume maximization, fence boundaries, and coordinate rate-of-change models in NSC past papers.",
        file_type: "pdf",
        file_name: "Calculus_Optimization_Grade12_Upgrade.pdf",
        file_size: "3.2 MB",
        file_url: "#",
        print_count: 22,
        created_at: "2026-07-08",
        syllabus: "CAPS",
        grade_level: "Grade 12",
        topic: "Differential Calculus"
      },
      {
        id: "res-4",
        title: "NSC Mathematics Paper 1 Final Exam (November 2025)",
        description: "Official National Senior Certificate Core Mathematics Paper 1 covering Algebra, Sequences, Series, Calculus, and Probability.",
        file_type: "pdf",
        file_name: "NSC_Maths_P1_Nov_2025_Exam.pdf",
        file_size: "2.1 MB",
        file_url: "#",
        print_count: 89,
        created_at: "2026-07-01",
        syllabus: "CAPS",
        grade_level: "Grade 12",
        topic: "Algebra & Sequences"
      },
      {
        id: "res-5",
        title: "NSC Mathematics Paper 1 Memo (November 2025)",
        description: "Official DBE detailed marking guidelines for the November 2025 Paper 1, including alternative solutions and mark breakdowns.",
        file_type: "pdf",
        file_name: "NSC_Maths_P1_Nov_2025_Memo.pdf",
        file_size: "2.5 MB",
        file_url: "#",
        print_count: 73,
        created_at: "2026-07-01",
        syllabus: "CAPS",
        grade_level: "Grade 12",
        topic: "Algebra & Sequences"
      },
      {
        id: "res-6",
        title: "IEB Mathematics Paper 1 (Core Exam 2025)",
        description: "Independent Examinations Board core mathematics Paper 1 with high-level functions, inverse logs, and optimization questions.",
        file_type: "pdf",
        file_name: "IEB_Maths_P1_2025_Core.pdf",
        file_size: "1.9 MB",
        file_url: "#",
        print_count: 42,
        created_at: "2026-07-02",
        syllabus: "IEB",
        grade_level: "Grade 12",
        topic: "Functions & Graphs"
      },
      {
        id: "res-7",
        title: "IEB Mathematics Paper 1 Memo (2025 Guidelines)",
        description: "Official IEB diagnostic guidelines and analytical marking rubrics for the core 2025 Paper 1 questions.",
        file_type: "pdf",
        file_name: "IEB_Maths_P1_2025_Memo.pdf",
        file_size: "2.2 MB",
        file_url: "#",
        print_count: 31,
        created_at: "2026-07-02",
        syllabus: "IEB",
        grade_level: "Grade 12",
        topic: "Functions & Graphs"
      },
      {
        id: "res-8",
        title: "Grade 11 Analytical Geometry coordinate proofs",
        description: "An intensive CAPS curriculum handbook detailing standard distance formulas, gradients, inclinations, and perpendicular tangents.",
        file_type: "pdf",
        file_name: "Analytical_Geometry_Grade11_Handbook.pdf",
        file_size: "4.1 MB",
        file_url: "#",
        print_count: 19,
        created_at: "2026-07-03",
        syllabus: "Both",
        grade_level: "Grade 11",
        topic: "Analytical Geometry"
      },
      {
        id: "res-9",
        title: "Grade 10 Basic Functions & Hyperbola Sketches",
        description: "Beginner-friendly cheat sheet for plotting standard parabolas, hyperbolas, and exponential graphs with vertical asymptotes.",
        file_type: "pdf",
        file_name: "Functions_Grade10_Asymptotes_Intro.pdf",
        file_size: "1.5 MB",
        file_url: "#",
        print_count: 14,
        created_at: "2026-07-04",
        syllabus: "CAPS",
        grade_level: "Grade 10",
        topic: "Functions & Graphs"
      },
      {
        id: "res-10",
        title: "Euclidean Circle Theorems Visual Summary Pack",
        description: "A gorgeous color-coded handbook with proofs for all 9 core circle theorems (angle at center, cyclic quads, tangents).",
        file_type: "pdf",
        file_name: "Circle_Theorems_Euclidean_Summary.pdf",
        file_size: "3.7 MB",
        file_url: "#",
        print_count: 65,
        created_at: "2026-07-09",
        syllabus: "Both",
        grade_level: "Grade 12",
        topic: "Euclidean Geometry"
      },
      {
        id: "res-11",
        title: "Grade 12 Mind the Gap Mathematics Study Guide",
        description: "The official Department of Basic Education (DBE) Grade 12 study guide. Focuses on master summaries, exam-focused examples, and step-by-step solutions for CAPS Paper 1 and Paper 2.",
        file_type: "pdf",
        file_name: "Mind_the_Gap_Grade12_Mathematics_CAPS.pdf",
        file_size: "14.2 MB",
        file_url: "#",
        print_count: 142,
        created_at: "2026-07-10",
        syllabus: "CAPS",
        grade_level: "Grade 12",
        topic: "All Topics"
      },
      {
        id: "res-12",
        title: "Grade 12 Answer Series 3-in-1 Mathematics Study Guide",
        description: "Exhaustive high-impact matric study guide containing comprehensive study notes, graded exercises, and practice examination questions with full solutions.",
        file_type: "pdf",
        file_name: "Answer_Series_Grade12_Maths_3in1.pdf",
        file_size: "18.5 MB",
        file_url: "#",
        print_count: 115,
        created_at: "2026-07-10",
        syllabus: "Both",
        grade_level: "Grade 12",
        topic: "All Topics"
      },
      {
        id: "res-13",
        title: "Grade 12 Siyavula Mathematics Textbook",
        description: "The complete Grade 12 Siyavula Mathematics open textbook, providing clear theoretical frameworks, definitions, and extensive practice problems.",
        file_type: "pdf",
        file_name: "Siyavula_Mathematics_Grade12_Textbook.pdf",
        file_size: "9.8 MB",
        file_url: "#",
        print_count: 98,
        created_at: "2026-07-10",
        syllabus: "CAPS",
        grade_level: "Grade 12",
        topic: "All Topics"
      },
      {
        id: "res-14",
        title: "Grade 12 IEB Advanced Programme Mathematics (AP Maths) Textbook",
        description: "Specialist textbook for learners undertaking Advanced Programme Mathematics (AP Maths). Includes advanced algebra, calculus, matrices, and stats.",
        file_type: "pdf",
        file_name: "IEB_AP_Mathematics_Grade12_Textbook.pdf",
        file_size: "15.1 MB",
        file_url: "#",
        print_count: 47,
        created_at: "2026-07-10",
        syllabus: "IEB",
        grade_level: "Grade 12",
        topic: "All Topics"
      },
      {
        id: "res-15",
        title: "Grade 11 Siyavula Mathematics Textbook",
        description: "Official Siyavula Grade 11 Mathematics textbook covering quadratic inequalities, exponents, functions, finance, and trigonometric reduction formulas.",
        file_type: "pdf",
        file_name: "Siyavula_Mathematics_Grade11_Textbook.pdf",
        file_size: "8.6 MB",
        file_url: "#",
        print_count: 76,
        created_at: "2026-07-10",
        syllabus: "CAPS",
        grade_level: "Grade 11",
        topic: "All Topics"
      },
      {
        id: "res-16",
        title: "Grade 11 Mind Action Series Mathematics Textbook",
        description: "Premium CAPS Grade 11 math textbook by Jakes Gerwel and leading educators. Known for highly rigorous geometry, algebra, and trig exercises.",
        file_type: "pdf",
        file_name: "Mind_Action_Series_Grade11_Mathematics.pdf",
        file_size: "11.2 MB",
        file_url: "#",
        print_count: 82,
        created_at: "2026-07-10",
        syllabus: "CAPS",
        grade_level: "Grade 11",
        topic: "All Topics"
      },
      {
        id: "res-17",
        title: "Grade 11 Answer Series Mathematics Study Guide",
        description: "An exceptional Grade 11 study reference covering all core modules, including functions, coordinate geometry, and financial mathematics exercises.",
        file_type: "pdf",
        file_name: "Answer_Series_Grade11_Maths_Guide.pdf",
        file_size: "12.4 MB",
        file_url: "#",
        print_count: 61,
        created_at: "2026-07-10",
        syllabus: "Both",
        grade_level: "Grade 11",
        topic: "All Topics"
      },
      {
        id: "res-18",
        title: "Grade 10 Siyavula Mathematics Textbook",
        description: "Siyavula's introduction to high school mathematics for Grade 10. Focuses on foundational equations, factorisation, trigonometry basics, and linear graphs.",
        file_type: "pdf",
        file_name: "Siyavula_Mathematics_Grade10_Textbook.pdf",
        file_size: "7.4 MB",
        file_url: "#",
        print_count: 68,
        created_at: "2026-07-10",
        syllabus: "CAPS",
        grade_level: "Grade 10",
        topic: "All Topics"
      },
      {
        id: "res-19",
        title: "Grade 10 Classroom Mathematics Textbook",
        description: "Highly interactive textbook concentrating on solid foundational mastery, worked-out examples, and CAPS Grade 10 classroom exercises.",
        file_type: "pdf",
        file_name: "Classroom_Mathematics_Grade10_Textbook.pdf",
        file_size: "10.5 MB",
        file_url: "#",
        print_count: 53,
        created_at: "2026-07-10",
        syllabus: "CAPS",
        grade_level: "Grade 10",
        topic: "All Topics"
      },
      {
        id: "res-20",
        title: "Grade 10 Mind Action Series Mathematics Study Guide",
        description: "An easy-to-use study guide with illustrated concepts, proofs, and basic exam preparation worksheets for Grade 10 math core standards.",
        file_type: "pdf",
        file_name: "Mind_Action_Series_Grade10_StudyGuide.pdf",
        file_size: "6.8 MB",
        file_url: "#",
        print_count: 41,
        created_at: "2026-07-10",
        syllabus: "CAPS",
        grade_level: "Grade 10",
        topic: "All Topics"
      }
    ];
    localStorage.setItem("amh_resource_library", JSON.stringify(defaultResources));
    localStorage.setItem("amh_resource_library_v3", "true");
  }
  
  if (!localStorage.getItem("amh_resource_library_ieb_2015_2025")) {
    const resources = JSON.parse(localStorage.getItem("amh_resource_library") || "[]") as ResourceLibraryItem[];
    
    for (let year = 2015; year <= 2025; year++) {
      // IEB Paper 1 Exam
      const p1Id = `ieb-p1-${year}`;
      if (!resources.some(r => r.id === p1Id)) {
        resources.push({
          id: p1Id,
          title: `IEB Mathematics Paper 1 (November ${year})`,
          description: `Official Independent Examinations Board (IEB) Grade 12 Mathematics Paper 1 national exam for ${year}. Covers high-level Functions, Sequences & Series, Finance, Calculus, and Probability.`,
          file_type: "pdf",
          file_name: `IEB_Mathematics_P1_Nov_${year}.pdf`,
          file_size: `${(1.5 + (year % 3) * 0.2).toFixed(1)} MB`,
          file_url: "#",
          print_count: Math.floor(15 + (2025 - year) * 6 + Math.random() * 10),
          created_at: `${year}-11-18`,
          syllabus: "IEB",
          grade_level: "Grade 12",
          topic: "Functions & Graphs"
        });
      }

      // IEB Paper 1 Memo
      const p1MemoId = `ieb-p1-memo-${year}`;
      if (!resources.some(r => r.id === p1MemoId)) {
        resources.push({
          id: p1MemoId,
          title: `IEB Mathematics Paper 1 Memo (November ${year})`,
          description: `Official Independent Examinations Board (IEB) Grade 12 Mathematics Paper 1 diagnostic scoring guidelines and alternative algebraic models for November ${year}.`,
          file_type: "pdf",
          file_name: `IEB_Mathematics_P1_Nov_${year}_Memo.pdf`,
          file_size: `${(1.8 + (year % 3) * 0.3).toFixed(1)} MB`,
          file_url: "#",
          print_count: Math.floor(12 + (2025 - year) * 5 + Math.random() * 8),
          created_at: `${year}-11-18`,
          syllabus: "IEB",
          grade_level: "Grade 12",
          topic: "Functions & Graphs"
        });
      }

      // IEB Paper 2 Exam
      const p2Id = `ieb-p2-${year}`;
      if (!resources.some(r => r.id === p2Id)) {
        resources.push({
          id: p2Id,
          title: `IEB Mathematics Paper 2 (November ${year})`,
          description: `Official Independent Examinations Board (IEB) Grade 12 Mathematics Paper 2 national exam for ${year}. Covers advanced Trigonometry, Analytical Geometry, Statistics, and Euclidean Geometry proofs.`,
          file_type: "pdf",
          file_name: `IEB_Mathematics_P2_Nov_${year}.pdf`,
          file_size: `${(1.4 + (year % 3) * 0.2).toFixed(1)} MB`,
          file_url: "#",
          print_count: Math.floor(14 + (2025 - year) * 6 + Math.random() * 10),
          created_at: `${year}-11-20`,
          syllabus: "IEB",
          grade_level: "Grade 12",
          topic: "Trigonometry"
        });
      }

      // IEB Paper 2 Memo
      const p2MemoId = `ieb-p2-memo-${year}`;
      if (!resources.some(r => r.id === p2MemoId)) {
        resources.push({
          id: p2MemoId,
          title: `IEB Mathematics Paper 2 Memo (November ${year})`,
          description: `Official Independent Examinations Board (IEB) Grade 12 Mathematics Paper 2 diagnostic guidelines and detailed coordinate/geometric proofs for November ${year}.`,
          file_type: "pdf",
          file_name: `IEB_Mathematics_P2_Nov_${year}_Memo.pdf`,
          file_size: `${(1.7 + (year % 3) * 0.3).toFixed(1)} MB`,
          file_url: "#",
          print_count: Math.floor(10 + (2025 - year) * 5 + Math.random() * 8),
          created_at: `${year}-11-20`,
          syllabus: "IEB",
          grade_level: "Grade 12",
          topic: "Trigonometry"
        });
      }
    }

    localStorage.setItem("amh_resource_library", JSON.stringify(resources));
    localStorage.setItem("amh_resource_library_ieb_2015_2025", "true");
  }
  if (!localStorage.getItem("amh_subscribers")) {
    const defaultSubscribers: Subscriber[] = [
      { id: "sub-1", email: "naledi.nkosi@gmail.com", status: "active", created_at: "2026-07-01" },
      { id: "sub-2", email: "thabo.mokoena@outlook.com", status: "active", created_at: "2026-07-03" },
      { id: "sub-3", email: "gauteng.maths@gmail.com", status: "active", created_at: "2026-07-06" },
      { id: "sub-4", email: "sarah.smith@mweb.co.za", status: "unsubscribed", created_at: "2026-07-04" }
    ];
    localStorage.setItem("amh_subscribers", JSON.stringify(defaultSubscribers));
  }
  if (!localStorage.getItem("amh_tutor_reports")) {
    const defaultReports: TutorReport[] = [
      {
        id: "rep-1",
        student_id: "usr-bethuel",
        student_name: "Bethuel Thipe",
        tutor_id: "usr-thabo",
        tutor_name: "Thabo Mokoena",
        created_at: "2026-07-15",
        period_start: "2026-07-01",
        period_end: "2026-07-15",
        overall_progress_score: 82,
        summary_text: "Bethuel has shown outstanding dedication over the past two weeks. He displays a solid intuitive grasp of algebraic derivations, particularly when shifting from limits to first-principles differentiation. His whiteboard participation has been excellent, though he occasionally rushes through structural algebraic expansions, leading to minor sign errors.",
        key_challenges: [
          "Rushing through double-angle trigonometric identity expansions, specifically sin(2A) variations.",
          "Formulating the initial volume and area functions in word-based Calculus optimization problems.",
          "Negative sign distribution when performing complex Euclidean geometry circle theorem proofs."
        ],
        suggested_revision_topics: [
          "Trigonometry double-angle expansion rules and co-function proofs.",
          "Formulating constraints and objective equations in multi-variable Calculus optimization models.",
          "Euclidean circle theorems, with a focus on tangent-secant theorem derivations."
        ],
        mastered_concepts: [
          "Limits evaluations using factorisation and rationalisation techniques.",
          "Basic first-principles derivative calculations.",
          "Graph sketching for standard parabolas and cubic polynomials."
        ],
        lessons_covered_count: 4,
        homework_completion_rate: 100,
        average_mock_score: 78
      }
    ];
    localStorage.setItem("amh_tutor_reports", JSON.stringify(defaultReports));
  }
  
  if (!localStorage.getItem("amh_notifications")) {
    const defaultNotifications: AMHNotification[] = [
      {
        id: "notif-1",
        student_id: "usr-bethuel",
        title: "🎥 Whiteboard Video Solution Uploaded",
        message: "Your requested video for 'Financial Maths: Sinking Funds Breakdown' is now completed and ready for viewing. Click to open the video hub!",
        type: "video_uploaded",
        is_read: false,
        metadata: {
          video_id: "vid-1",
          video_title: "Financial Maths: Sinking Funds Breakdown",
          tutor_name: "Bethuel Moukangwe"
        },
        created_at: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
      },
      {
        id: "notif-2",
        student_id: "all",
        title: "📅 New Tutoring Slot Available",
        message: "A new weekend CAPS Paper 1 final booster tutoring slot has been opened by Tutor Thabo on 2026-07-25 at 11:30.",
        type: "slot_available",
        is_read: false,
        metadata: {
          tutor_name: "Thabo Mokoena",
          slot_date: "2026-07-25",
          slot_time: "11:30 - 12:30"
        },
        created_at: new Date(Date.now() - 3600000 * 5).toISOString() // 5 hours ago
      },
      {
        id: "notif-3",
        student_id: "usr-bethuel",
        title: "🎓 Welcome to Amaris Hub",
        message: "Hi Bethuel! Welcome to your upgrade command center. Set up your personal study goals and start practicing on the live virtual whiteboard.",
        type: "system",
        is_read: true,
        created_at: new Date(Date.now() - 3600000 * 24).toISOString() // 24 hours ago
      }
    ];
    localStorage.setItem("amh_notifications", JSON.stringify(defaultNotifications));
  }

  if (!localStorage.getItem("amh_subscriptions")) {
    const defaultSubs: Subscription[] = [
      {
        id: "sub-bethuel",
        student_id: "usr-bethuel",
        student_name: "Bethuel Thipe",
        package_id: "pkg-4",
        package_name: "Monthly Unlimited Success",
        amount: 4500,
        billing_cycle: "monthly",
        status: "active",
        start_date: "2026-06-15",
        next_billing_date: "2026-07-15",
        last_payment_date: "2026-06-15",
        payment_method: "Debit Order",
        auto_renew: true,
        history: [
          {
            id: "inv-bethuel-1",
            invoice_number: "AMH-SUB-1001",
            amount: 4500,
            status: "paid",
            due_date: "2026-06-15",
            paid_at: "2026-06-15",
            transaction_id: "PF-482019485"
          }
        ]
      },
      {
        id: "sub-sipho",
        student_id: "usr-sipho",
        student_name: "Sipho Ndlovu",
        package_id: "pkg-4",
        package_name: "Monthly Unlimited Success",
        amount: 4500,
        billing_cycle: "monthly",
        status: "active",
        start_date: "2026-07-01",
        next_billing_date: "2026-08-01",
        last_payment_date: "2026-07-01",
        payment_method: "PayFast Recurring",
        auto_renew: true,
        history: [
          {
            id: "inv-sipho-1",
            invoice_number: "AMH-SUB-1002",
            amount: 4500,
            status: "paid",
            due_date: "2026-07-01",
            paid_at: "2026-07-01",
            transaction_id: "PF-104928172"
          }
        ]
      },
      {
        id: "sub-lerato",
        student_id: "usr-lerato",
        student_name: "Lerato Mokoena",
        package_id: "pkg-2",
        package_name: "4-Lesson Concept Upgrade",
        amount: 1100,
        billing_cycle: "monthly",
        status: "past_due",
        start_date: "2026-06-10",
        next_billing_date: "2026-07-10",
        last_payment_date: "2026-06-10",
        payment_method: "Card",
        auto_renew: true,
        history: [
          {
            id: "inv-lerato-2",
            invoice_number: "AMH-SUB-1004",
            amount: 1100,
            status: "failed",
            due_date: "2026-07-10"
          },
          {
            id: "inv-lerato-1",
            invoice_number: "AMH-SUB-1003",
            amount: 1100,
            status: "paid",
            due_date: "2026-06-10",
            paid_at: "2026-06-10",
            transaction_id: "PF-293810294"
          }
        ]
      }
    ];
    localStorage.setItem("amh_subscriptions", JSON.stringify(defaultSubs));
  }
};

// Map localStorage keys to Firestore collection names
const LOCAL_KEY_TO_FIRESTORE_COLLECTION: Record<string, string> = {
  amh_profiles: COLLECTIONS.PROFILES,
  amh_bookings: COLLECTIONS.BOOKINGS,
  amh_payments: COLLECTIONS.PAYMENTS,
  amh_homework_assignments: COLLECTIONS.HOMEWORK_ASSIGNMENTS,
  amh_homework_submissions: COLLECTIONS.HOMEWORK_SUBMISSIONS,
  amh_video_requests: COLLECTIONS.VIDEO_REQUESTS,
  amh_testimonials: COLLECTIONS.TESTIMONIALS,
  amh_announcements: COLLECTIONS.ANNOUNCEMENTS,
  amh_contact_messages: COLLECTIONS.CONTACT_MESSAGES,
  amh_deep_focus_sessions: COLLECTIONS.DEEP_FOCUS_SESSIONS,
  amh_arcade_scores: COLLECTIONS.ARCADE_SCORES,
  amh_arcade_achievements: COLLECTIONS.ARCADE_ACHIEVEMENTS,
  amh_notifications: COLLECTIONS.NOTIFICATIONS,
  amh_subjects: COLLECTIONS.SUBJECTS,
  amh_packages: COLLECTIONS.PACKAGES,
  amh_faqs: COLLECTIONS.FAQS,
  amh_resource_library: COLLECTIONS.RESOURCES,
  amh_subscriptions: COLLECTIONS.SUBSCRIPTIONS
};

// Database Getter/Setter Helpers with Firestore Cloud Sync
export const getFromDB = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const saveToDB = <T extends { id?: string }>(key: string, data: T[]) => {
  // 1. Instant local persistence for zero lag
  localStorage.setItem(key, JSON.stringify(data));

  // 2. Asynchronous Firestore Cloud Sync
  const collectionName = LOCAL_KEY_TO_FIRESTORE_COLLECTION[key];
  if (collectionName && Array.isArray(data)) {
    // Sync documents in background
    setTimeout(async () => {
      try {
        for (const item of data) {
          if (item && item.id) {
            await firestoreDB.set(collectionName, item as { id: string });
          }
        }
      } catch (err) {
        console.warn(`[Firebase Backend Sync] Notice syncing ${key} to Firestore:`, err);
      }
    }, 10);
  }
};

// Initial Cloud Sync to hydrate and sync local cache with Firestore
let isFirestoreSyncInitialized = false;
export const syncFirestoreWithLocalCache = async () => {
  if (isFirestoreSyncInitialized) return;
  isFirestoreSyncInitialized = true;

  try {
    await initializeFirebaseBackend();

    // Iterate through key collections and hydrate/seed if needed
    for (const [localKey, colName] of Object.entries(LOCAL_KEY_TO_FIRESTORE_COLLECTION)) {
      const localData = getFromDB<any>(localKey);
      const cloudData = await firestoreDB.getAll<any>(colName);

      if (cloudData.length > 0) {
        // Cloud has data: merge or update local
        const mergedMap = new Map<string, any>();
        localData.forEach(item => { if (item.id) mergedMap.set(item.id, item); });
        cloudData.forEach(item => { if (item.id) mergedMap.set(item.id, item); });
        const mergedArray = Array.from(mergedMap.values());
        localStorage.setItem(localKey, JSON.stringify(mergedArray));
      } else if (localData.length > 0) {
        // Cloud is empty: seed cloud with local pre-seeded data
        await firestoreDB.seedCollectionIfEmpty(colName, localData);
      }

      // Listen for real-time changes
      firestoreDB.subscribe(colName, (updatedItems) => {
        if (updatedItems && updatedItems.length > 0) {
          const currentLocal = getFromDB<any>(localKey);
          const map = new Map<string, any>();
          currentLocal.forEach(i => { if (i.id) map.set(i.id, i); });
          updatedItems.forEach(i => { if (i.id) map.set(i.id, i); });
          const merged = Array.from(map.values());
          localStorage.setItem(localKey, JSON.stringify(merged));
          window.dispatchEvent(new Event("storage"));
        }
      });
    }
    console.log("⚡ [Firebase Backend] All collections synchronized with Firestore.");
  } catch (err) {
    console.warn("⚡ [Firebase Backend] Sync background notice:", err);
  }
};


// Profile & Auth API
export const dbAuth = {
  login: (email: string): Profile | null => {
    initDatabase();
    const profiles = getFromDB<Profile>("amh_profiles");
    const user = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (user) {
      localStorage.setItem("amh_current_user", JSON.stringify(user));
      return user;
    }
    // Auto-create profile if email matches the requested admin or any user (convenience for login)
    const firstName = email.split("@")[0];
    const newProfile: Profile = {
      id: generateId("usr"),
      first_name: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      surname: "Learner",
      email: email,
      phone: "071 415 6665",
      whatsapp_number: "071 415 6665",
      province: "Gauteng",
      school: "Amaris Online Academy",
      grade: "Matric Upgrade",
      parent_name: "Parent",
      parent_phone: "+27 82 555 1234",
      role: email.toLowerCase().trim() === "bethuelmoukangwe8@gmail.com" ? "admin" : "student",
      is_super_admin: email.toLowerCase().trim() === "bethuelmoukangwe8@gmail.com",
      avatar_url: ""
    };
    profiles.push(newProfile);
    saveToDB("amh_profiles", profiles);
    localStorage.setItem("amh_current_user", JSON.stringify(newProfile));
    return newProfile;
  },

  register: (data: Partial<Profile>): Profile => {
    initDatabase();
    const profiles = getFromDB<Profile>("amh_profiles");
    
    // Check if user already exists
    const existing = profiles.find(p => p.email.toLowerCase() === (data.email || "").toLowerCase());
    if (existing) {
      localStorage.setItem("amh_current_user", JSON.stringify(existing));
      return existing;
    }

    const newProfile: Profile = {
      id: generateId("usr"),
      first_name: data.first_name || "Guest",
      surname: data.surname || "User",
      email: data.email || "",
      phone: data.phone || "",
      whatsapp_number: data.whatsapp_number || "",
      province: data.province || "Gauteng",
      school: data.school || "High School",
      grade: data.grade || "Matric Upgrade",
      parent_name: data.parent_name || "",
      parent_phone: data.parent_phone || "",
      role: (data.email || "").toLowerCase().trim() === "bethuelmoukangwe8@gmail.com" ? "admin" : (data.role || "student"),
      is_super_admin: (data.email || "").toLowerCase().trim() === "bethuelmoukangwe8@gmail.com",
      avatar_url: data.avatar_url || ""
    };

    profiles.push(newProfile);
    saveToDB("amh_profiles", profiles);
    localStorage.setItem("amh_current_user", JSON.stringify(newProfile));
    return newProfile;
  },

  getCurrentUser: (): Profile | null => {
    initDatabase();
    const user = localStorage.getItem("amh_current_user");
    return user ? JSON.parse(user) : null;
  },

  updateProfile: (updated: Partial<Profile>): Profile => {
    const user = dbAuth.getCurrentUser();
    if (!user) throw new Error("No active session");

    const profiles = getFromDB<Profile>("amh_profiles");
    const index = profiles.findIndex(p => p.id === user.id);

    const merged = { ...user, ...updated };
    if (index !== -1) {
      profiles[index] = merged;
      saveToDB("amh_profiles", profiles);
    } else {
      profiles.push(merged);
      saveToDB("amh_profiles", profiles);
    }

    localStorage.setItem("amh_current_user", JSON.stringify(merged));
    return merged;
  },

  logout: () => {
    localStorage.removeItem("amh_current_user");
  }
};

// Bookings, Payments, Homework, and Video APIs
export const dbAPI = {
  // Subjects
  getSubjects: (): Subject[] => {
    initDatabase();
    return getFromDB<Subject>("amh_subjects").filter(s => 
      s.is_active !== false && 
      s.grade_level !== "TVET" && 
      s.grade_level !== "University"
    );
  },

  // Lesson Packages
  getPackages: (): LessonPackage[] => {
    initDatabase();
    return getFromDB<LessonPackage>("amh_packages");
  },

  // FAQs
  getFaqs: (): FAQ[] => {
    initDatabase();
    return getFromDB<FAQ>("amh_faqs");
  },

  // Testimonials
  getTestimonials: (): Testimonial[] => {
    initDatabase();
    return getFromDB<Testimonial>("amh_testimonials").filter(t => t.is_approved);
  },

  addTestimonial: (t: Omit<Testimonial, "id" | "is_approved" | "created_at">): Testimonial => {
    const testimonials = getFromDB<Testimonial>("amh_testimonials");
    const newTestimonial: Testimonial = {
      ...t,
      id: generateId("t"),
      is_approved: true, // Auto-approve for awesome mock experience
      created_at: new Date().toISOString().split("T")[0]
    };
    testimonials.push(newTestimonial);
    saveToDB("amh_testimonials", testimonials);
    return newTestimonial;
  },

  // Bookings
  getBookings: (studentId: string): Booking[] => {
    initDatabase();
    return getFromDB<Booking>("amh_bookings").filter(b => b.student_id === studentId);
  },

  triggerBookingEmail: (booking: Booking, type: "booking_confirmation" | "booking_updated") => {
    try {
      const profiles = getFromDB<Profile>("amh_profiles");
      const student = profiles.find(p => p.id === booking.student_id);
      if (!student || !student.email) {
        console.warn("No recipient profile found for booking notification:", booking.student_id);
        return;
      }

      const subjects = getFromDB<Subject>("amh_subjects");
      const subject = subjects.find(s => s.id === booking.subject_id);
      const subject_name = subject ? subject.name : "Core Mathematics (Grade 10-12 CAPS)";

      const bookingDetails = {
        booking_reference: booking.booking_reference,
        lesson_date: booking.lesson_date,
        lesson_time: booking.lesson_time,
        subject_name,
        duration_minutes: booking.duration_minutes,
        platform: booking.platform,
        meeting_link: booking.meeting_link,
        topics_to_cover: booking.topics_to_cover,
        status: booking.status,
        feedback_remarks: booking.feedback_remarks
      };

      fetch("/api/notifications/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: student.email,
          studentName: `${student.first_name} ${student.surname}`,
          type,
          bookingDetails
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log("Automated email notification triggered:", data);
      })
      .catch(err => {
        console.error("Automated email notification request failed:", err);
      });
    } catch (err) {
      console.error("Notifier execution failed:", err);
    }
  },

  createBooking: (booking: Omit<Booking, "id" | "booking_reference" | "status" | "created_at">): Booking => {
    const bookings = getFromDB<Booking>("amh_bookings");
    const zoomMeetingId = Math.floor(80000000000 + Math.random() * 19999999999);
    const zoomPasscode = "amhMath" + Math.floor(100 + Math.random() * 899);
    const generatedZoomLink = `https://zoom.us/j/${zoomMeetingId}?pwd=${zoomPasscode}`;

    const newBooking: Booking = {
      ...booking,
      platform: "Zoom",
      id: generateId("bk"),
      booking_reference: generateBookingReference(),
      status: "confirmed", // auto-confirm for immediate premium satisfaction
      meeting_link: booking.meeting_link && booking.meeting_link.includes("zoom.us") ? booking.meeting_link : generatedZoomLink,
      created_at: new Date().toISOString().split("T")[0]
    };
    bookings.push(newBooking);
    saveToDB("amh_bookings", bookings);

    // Also record a payment receipt!
    const packages = dbAPI.getPackages();
    const pkg = packages.find(p => p.id === booking.package_id) || packages[0];
    dbAPI.createPayment({
      booking_id: newBooking.id,
      student_id: booking.student_id,
      amount: pkg.price,
      currency: "ZAR",
      payment_method: "Secure PayFast EFT",
      transaction_id: "PF-" + Math.floor(Math.random() * 1000000000),
      status: "successful"
    });

    // Send automated confirmation email
    dbAPI.triggerBookingEmail(newBooking, "booking_confirmation");

    return newBooking;
  },

  completeBooking: (bookingId: string, rating: number, remarks: string): void => {
    const bookings = getFromDB<Booking>("amh_bookings");
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
      bookings[idx].status = "completed";
      bookings[idx].rating = rating;
      bookings[idx].feedback_remarks = remarks;
      saveToDB("amh_bookings", bookings);
    }
  },

  submitPostSessionFeedback: (payload: {
    bookingId: string;
    rating: number;
    remarks: string;
    topicsCovered: string[];
    categoryRatings?: Record<string, number>;
    studentName?: string;
    studentEmail?: string;
    tutorName?: string;
    requestHomework?: boolean;
    requestAdminFollowup?: boolean;
  }): void => {
    const {
      bookingId,
      rating,
      remarks,
      topicsCovered = [],
      categoryRatings = {},
      studentName = "Bethuel Thipe",
      studentEmail = "bethuel@amaris.co.za",
      tutorName = "Head Tutor Bethuel",
      requestHomework = false,
      requestAdminFollowup = false
    } = payload;

    // 1. Update Booking record
    const bookings = getFromDB<Booking>("amh_bookings");
    const idx = bookings.findIndex(b => b.id === bookingId);
    let refNum = "AMH-SESSION";
    if (idx !== -1) {
      bookings[idx].status = "completed";
      bookings[idx].rating = rating;
      bookings[idx].feedback_remarks = remarks;
      bookings[idx].topics_covered = topicsCovered;
      bookings[idx].category_ratings = categoryRatings;
      refNum = bookings[idx].booking_reference || bookingId;
      saveToDB("amh_bookings", bookings);
    }

    // 2. Automatically Update Student Progress Dashboard (amh_learning_progress_d3_v1)
    try {
      const savedProgress = localStorage.getItem("amh_learning_progress_d3_v1");
      if (savedProgress) {
        const topicsList = JSON.parse(savedProgress);
        if (Array.isArray(topicsList)) {
          const updatedProgress = topicsList.map((top: any) => {
            const isRelevant = topicsCovered.some(tc =>
              tc.toLowerCase().includes(top.id.toLowerCase()) ||
              top.title.toLowerCase().includes(tc.toLowerCase()) ||
              tc.toLowerCase().includes(top.category.toLowerCase())
            );

            if (isRelevant) {
              const boost = Math.min(100, (top.completedPercent || 60) + 12);
              const newAcc = Math.min(100, (top.accuracyPercent || 70) + 5);
              const updatedSubtopics = (top.subtopics || []).map((st: any, sIdx: number) => {
                if (sIdx < 2 || topicsCovered.some(tc => tc.toLowerCase().includes(st.name.toLowerCase()))) {
                  return { ...st, completed: true, accuracy: Math.max(st.accuracy || 75, 85) };
                }
                return st;
              });

              return {
                ...top,
                completedPercent: boost,
                accuracyPercent: newAcc,
                exercisesAttempted: (top.exercisesAttempted || 100) + 15,
                subtopics: updatedSubtopics
              };
            }
            return top;
          });

          localStorage.setItem("amh_learning_progress_d3_v1", JSON.stringify(updatedProgress));

          // Also sync amh_topic_mastery_v2
          const capsFormat = updatedProgress.map((t: any) => ({
            id: t.id,
            title: t.title,
            paper: t.paper,
            weight: `~${t.examWeightMarks} Marks`,
            category: t.category,
            customMasteryPercent: t.completedPercent,
            subtopics: t.subtopics
          }));
          localStorage.setItem("amh_topic_mastery_v2", JSON.stringify({ caps: capsFormat }));
        }
      }
    } catch (err) {
      console.warn("Could not auto-update student progress dashboard:", err);
    }

    // 3. Update amh_mock_exam_scores with session diagnostic metric
    try {
      const currentScores = getFromDB<MockExamScore>("amh_mock_exam_scores");
      const newScore: MockExamScore = {
        id: generateId("score"),
        student_id: "std-bethuel-101",
        exam_title: `Post-Session Evaluation: ${topicsCovered[0] || "Live Whiteboard"}`,
        subject_or_topic: topicsCovered[0] || "Mathematics",
        score_percentage: Math.min(100, 75 + rating * 4),
        exam_date: new Date().toISOString().split("T")[0],
        notes: remarks || "Post-session tutor rating & topic mastery evaluation.",
        created_at: new Date().toISOString()
      };
      currentScores.push(newScore);
      saveToDB("amh_mock_exam_scores", currentScores);
    } catch (e) {
      console.warn("Could not append mock exam metric:", e);
    }

    // 4. Notify Admin by inserting Inbound Contact Message
    try {
      const contacts = getFromDB<ContactMessage>("amh_contact_messages");
      const subRatingsText = Object.entries(categoryRatings)
        .map(([catKey, catVal]) => `- ${catKey}: ${catVal}/5 stars`)
        .join("\n");

      const newAdminNotice: ContactMessage = {
        id: generateId("cnt"),
        name: studentName,
        email: studentEmail,
        subject: `[POST-SESSION FEEDBACK] ${rating}★ for ${tutorName} (${refNum})`,
        message: `POST-LESSON STUDENT EVALUATION SUMMARY:
• Overall Rating: ${rating}/5 Stars
• Tutor Evaluated: ${tutorName}
• Session Ref: ${refNum}

TOPICS COVERED IN SESSION:
${topicsCovered.length > 0 ? topicsCovered.map(t => `✓ ${t}`).join("\n") : "General CAPS Mathematics Practice"}

STUDENT NOTES & FEEDBACK:
"${remarks || "No specific written notes provided."}"

SUB-CATEGORY RATINGS:
${subRatingsText || "N/A"}

ACTIONS REQUESTED:
${requestHomework ? "• Student requested follow-up homework worksheet." : "• No additional homework requested."}
${requestAdminFollowup ? "• URGENT: Student requested an admin callback / review." : "• Standard session log."}`,
        phone: `Grade 12 NSC/IEB Student`,
        status: "new",
        created_at: new Date().toISOString().split("T")[0]
      };
      contacts.unshift(newAdminNotice);
      saveToDB("amh_contact_messages", contacts);
    } catch (e) {
      console.error("Error creating admin contact message for feedback:", e);
    }

    // 5. Notify Admin via Announcement Alert
    try {
      dbAPI.publishAnnouncement({
        title: `★ New Session Feedback (${rating}/5) by ${studentName}`,
        content: `Student evaluated ${tutorName}. Topics covered: ${topicsCovered.slice(0, 3).join(", ")}. Progress dashboard auto-updated.`,
        category: "General"
      });
    } catch (e) {
      console.warn("Could not publish announcement alert:", e);
    }

    // 6. Dispatch Global Window Events to update UI across open tabs/components
    try {
      window.dispatchEvent(new Event("amh_progress_updated"));
      window.dispatchEvent(new Event("amh_booking_updated"));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      // ignore
    }
  },

  // Subtopic Progress Tracking
  getCompletedSubtopics: (): string[] => {
    initDatabase();
    try {
      const saved = localStorage.getItem("amh_completed_subtopics");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  },

  toggleCompletedSubtopic: (key: string): string[] => {
    const current = dbAPI.getCompletedSubtopics();
    const next = current.includes(key)
      ? current.filter(k => k !== key)
      : [...current, key];
    try {
      localStorage.setItem("amh_completed_subtopics", JSON.stringify(next));
    } catch (e) {
      console.error("Failed to save completed subtopic:", e);
    }
    return next;
  },

  setCompletedSubtopics: (keys: string[]): void => {
    try {
      localStorage.setItem("amh_completed_subtopics", JSON.stringify(keys));
    } catch (e) {
      console.error("Failed to set completed subtopics:", e);
    }
  },

  // Payments
  getPayments: (studentId: string): Payment[] => {
    initDatabase();
    return getFromDB<Payment>("amh_payments").filter(p => p.student_id === studentId);
  },

  createPayment: (p: Omit<Payment, "id" | "created_at">): Payment => {
    const payments = getFromDB<Payment>("amh_payments");
    const newPayment: Payment = {
      ...p,
      id: generateId("pay"),
      created_at: new Date().toISOString().split("T")[0]
    };
    payments.push(newPayment);
    saveToDB("amh_payments", payments);
    return newPayment;
  },

  // Homework
  getHomeworkAssignments: (studentId: string): HomeworkAssignment[] => {
    initDatabase();
    return getFromDB<HomeworkAssignment>("amh_homework_assignments")
      .filter(hw => hw.student_id === studentId)
      .sort((a, b) => {
        const timeA = new Date(a.created_at || "").getTime() || 0;
        const timeB = new Date(b.created_at || "").getTime() || 0;
        if (timeB !== timeA) return timeB - timeA;
        return b.id.localeCompare(a.id, undefined, { numeric: true });
      });
  },

  updateHomeworkAssignmentStatus: (assignmentId: string, status: "assigned" | "submitted" | "graded" | "completed"): void => {
    initDatabase();
    const assignments = getFromDB<HomeworkAssignment>("amh_homework_assignments");
    const idx = assignments.findIndex(a => a.id === assignmentId);
    if (idx !== -1) {
      assignments[idx].status = status;
      saveToDB("amh_homework_assignments", assignments);
    }
  },

  getHomeworkSubmissions: (studentId: string): HomeworkSubmission[] => {
    initDatabase();
    return getFromDB<HomeworkSubmission>("amh_homework_submissions")
      .filter(sub => sub.student_id === studentId)
      .sort((a, b) => {
        const timeA = new Date(a.created_at || "").getTime() || 0;
        const timeB = new Date(b.created_at || "").getTime() || 0;
        if (timeB !== timeA) return timeB - timeA;
        return b.id.localeCompare(a.id, undefined, { numeric: true });
      });
  },

  submitHomework: (sub: Omit<HomeworkSubmission, "id" | "status" | "created_at">): HomeworkSubmission => {
    const submissions = getFromDB<HomeworkSubmission>("amh_homework_submissions");
    const newSubmission: HomeworkSubmission = {
      ...sub,
      id: generateId("sub-hw"),
      status: "pending_review",
      created_at: new Date().toISOString()
    };
    submissions.unshift(newSubmission);
    saveToDB("amh_homework_submissions", submissions);

    // Update the assignment status to 'submitted'
    const assignments = getFromDB<HomeworkAssignment>("amh_homework_assignments");
    const idx = assignments.findIndex(a => a.id === sub.assignment_id);
    if (idx !== -1) {
      assignments[idx].status = "submitted";
      saveToDB("amh_homework_assignments", assignments);
    }

    return newSubmission;
  },

  deleteSubmission: (submissionId: string, assignmentId: string) => {
    const submissions = getFromDB<HomeworkSubmission>("amh_homework_submissions");
    const filtered = submissions.filter(s => s.id !== submissionId);
    saveToDB("amh_homework_submissions", filtered);

    // Reset assignment status to 'assigned'
    const assignments = getFromDB<HomeworkAssignment>("amh_homework_assignments");
    const idx = assignments.findIndex(a => a.id === assignmentId);
    if (idx !== -1) {
      assignments[idx].status = "assigned";
      saveToDB("amh_homework_assignments", assignments);
    }
  },

  // Video Lesson Requests
  getVideoRequests: (studentId: string): VideoLessonRequest[] => {
    initDatabase();
    return getFromDB<VideoLessonRequest>("amh_video_requests").filter(r => r.student_id === studentId);
  },

  createVideoRequest: (req: Omit<VideoLessonRequest, "id" | "status" | "payment_status" | "created_at">): VideoLessonRequest => {
    const requests = getFromDB<VideoLessonRequest>("amh_video_requests");
    const newRequest: VideoLessonRequest = {
      ...req,
      id: generateId("vid"),
      status: "pending",
      payment_status: "paid", // mark as paid simulating online check
      created_at: new Date().toISOString().split("T")[0]
    };
    requests.push(newRequest);
    saveToDB("amh_video_requests", requests);

    // Record payment receipt
    dbAPI.createPayment({
      booking_id: "N/A (Video)",
      student_id: req.student_id,
      amount: req.price,
      currency: "ZAR",
      payment_method: "EFT / Card Gateway",
      transaction_id: "PF-VID-" + Math.floor(Math.random() * 1000000000),
      status: "successful"
    });

    // Simulate tutor grading response in 5 seconds
    setTimeout(() => {
      const freshReqs = getFromDB<VideoLessonRequest>("amh_video_requests");
      const fIdx = freshReqs.findIndex(r => r.id === newRequest.id);
      if (fIdx !== -1) {
        freshReqs[fIdx].status = "completed";
        freshReqs[fIdx].video_url = "https://www.youtube.com/embed/dQw4w9WgXcQ"; // fallback rickroll video or mathematical video
        freshReqs[fIdx].duration_minutes = 20;
        freshReqs[fIdx].notes = "Completed by Instructor Bethuel. Sinking funds are now unlocked. Excellent worksheet!";
        saveToDB("amh_video_requests", freshReqs);
      }
    }, 15000); // completed after 15s so user can see real status change in real time!

    return newRequest;
  },

  // Contact Message insert
  submitContact: (contact: Omit<ContactMessage, "id" | "status" | "created_at">): ContactMessage => {
    const contacts = getFromDB<ContactMessage>("amh_contact_messages");
    const newContact: ContactMessage = {
      ...contact,
      id: generateId("cnt"),
      status: "new",
      created_at: new Date().toISOString().split("T")[0]
    };
    contacts.push(newContact);
    saveToDB("amh_contact_messages", contacts);
    return newContact;
  },

  // Announcements API
  getAnnouncements: (): Announcement[] => {
    initDatabase();
    return getFromDB<Announcement>("amh_announcements").sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  publishAnnouncement: (announcement: Omit<Announcement, "id" | "created_at">): Announcement => {
    initDatabase();
    const announcements = getFromDB<Announcement>("amh_announcements");
    const newAnnouncement: Announcement = {
      ...announcement,
      id: generateId("ann"),
      created_at: new Date().toISOString().split("T")[0]
    };
    announcements.push(newAnnouncement);
    saveToDB("amh_announcements", announcements);
    return newAnnouncement;
  },

  deleteAnnouncement: (id: string): void => {
    initDatabase();
    const announcements = getFromDB<Announcement>("amh_announcements");
    const filtered = announcements.filter(a => a.id !== id);
    saveToDB("amh_announcements", filtered);
  },

  // Admin and Analytics APIs
  getAllBookings: (): Booking[] => {
    initDatabase();
    return getFromDB<Booking>("amh_bookings");
  },

  getAllPayments: (): Payment[] => {
    initDatabase();
    return getFromDB<Payment>("amh_payments");
  },

  getAllHomeworkAssignments: (): HomeworkAssignment[] => {
    initDatabase();
    return getFromDB<HomeworkAssignment>("amh_homework_assignments")
      .sort((a, b) => {
        const timeA = new Date(a.created_at || "").getTime() || 0;
        const timeB = new Date(b.created_at || "").getTime() || 0;
        if (timeB !== timeA) return timeB - timeA;
        return b.id.localeCompare(a.id, undefined, { numeric: true });
      });
  },

  getAllHomeworkSubmissions: (): HomeworkSubmission[] => {
    initDatabase();
    return getFromDB<HomeworkSubmission>("amh_homework_submissions")
      .sort((a, b) => {
        const timeA = new Date(a.created_at || "").getTime() || 0;
        const timeB = new Date(b.created_at || "").getTime() || 0;
        if (timeB !== timeA) return timeB - timeA;
        return b.id.localeCompare(a.id, undefined, { numeric: true });
      });
  },

  getAllVideoRequests: (): VideoLessonRequest[] => {
    initDatabase();
    return getFromDB<VideoLessonRequest>("amh_video_requests");
  },

  getAllContactMessages: (): ContactMessage[] => {
    initDatabase();
    return getFromDB<ContactMessage>("amh_contact_messages");
  },

  getAllProfiles: (): Profile[] => {
    initDatabase();
    return getFromDB<Profile>("amh_profiles");
  },

  updateBooking: (id: string, updated: Partial<Booking>): Booking => {
    initDatabase();
    const bookings = getFromDB<Booking>("amh_bookings");
    const idx = bookings.findIndex(b => b.id === id);
    if (idx === -1) throw new Error("Booking not found");
    const merged = { ...bookings[idx], ...updated };
    bookings[idx] = merged;
    saveToDB("amh_bookings", bookings);
    
    // Log the action
    dbAPI.addActivityLog({
      user_name: "Admin",
      action: "Updated Booking",
      details: `Booking ${merged.booking_reference} updated to status ${merged.status}`,
      type: "booking"
    });

    // Send automated update email
    dbAPI.triggerBookingEmail(merged, "booking_updated");

    return merged;
  },

  updateVideoRequest: (id: string, updated: Partial<VideoLessonRequest>): VideoLessonRequest => {
    initDatabase();
    const requests = getFromDB<VideoLessonRequest>("amh_video_requests");
    const idx = requests.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Video request not found");
    const merged = { ...requests[idx], ...updated };
    requests[idx] = merged;
    saveToDB("amh_video_requests", requests);

    // Log the action
    dbAPI.addActivityLog({
      user_name: "Admin",
      action: "Updated Video Request",
      details: `Video request ${merged.chapter_title} updated to status ${merged.status}`,
      type: "video"
    });

    // Add real-time notification if status transitioned to completed
    if (updated.status === "completed") {
      dbAPI.addNotification({
        student_id: merged.student_id,
        title: "🎥 Requested Video Explanation Uploaded!",
        message: `Your custom whiteboard video requested for chapter '${merged.chapter_title}' has been processed and uploaded by Tutor ${(merged as any).tutor_name || "Bethuel"}.`,
        type: "video_uploaded",
        metadata: {
          video_id: merged.id,
          video_title: merged.chapter_title,
          tutor_name: (merged as any).tutor_name || "Bethuel"
        }
      });
    }

    return merged;
  },

  updateHomeworkSubmission: (id: string, updated: Partial<HomeworkSubmission>): HomeworkSubmission => {
    initDatabase();
    const submissions = getFromDB<HomeworkSubmission>("amh_homework_submissions");
    const idx = submissions.findIndex(s => s.id === id);
    if (idx === -1) throw new Error("Submission not found");
    const merged = { ...submissions[idx], ...updated };
    submissions[idx] = merged;
    saveToDB("amh_homework_submissions", submissions);

    // If marked reviewed, we also update the corresponding assignment status to 'graded'
    if (merged.status === "reviewed") {
      const assignments = getFromDB<HomeworkAssignment>("amh_homework_assignments");
      const aIdx = assignments.findIndex(a => a.id === merged.assignment_id);
      if (aIdx !== -1) {
        assignments[aIdx].status = "graded";
        saveToDB("amh_homework_assignments", assignments);
      }
    }

    // Log the action
    dbAPI.addActivityLog({
      user_name: "Admin",
      action: "Graded Homework",
      details: `Submission of assignment ID ${merged.assignment_id} is graded`,
      type: "homework"
    });

    return merged;
  },

  addHomeworkAssignment: (assignment: Omit<HomeworkAssignment, "id" | "status" | "created_at">): HomeworkAssignment => {
    initDatabase();
    const assignments = getFromDB<HomeworkAssignment>("amh_homework_assignments");
    const newAssignment: HomeworkAssignment = {
      ...assignment,
      id: generateId("hw"),
      status: "assigned",
      created_at: new Date().toISOString()
    };
    assignments.unshift(newAssignment);
    saveToDB("amh_homework_assignments", assignments);

    // Log the action
    dbAPI.addActivityLog({
      user_name: "Admin",
      action: "Assigned Homework",
      details: `Assigned homework '${newAssignment.title}' to student ID ${newAssignment.student_id}`,
      type: "homework"
    });

    return newAssignment;
  },

  updateContactMessage: (id: string, status: "new" | "read" | "replied"): ContactMessage => {
    initDatabase();
    const contacts = getFromDB<ContactMessage>("amh_contact_messages");
    const idx = contacts.findIndex(c => c.id === id);
    if (idx === -1) throw new Error("Contact message not found");
    contacts[idx].status = status;
    saveToDB("amh_contact_messages", contacts);
    return contacts[idx];
  },

  deleteContactMessage: (id: string): void => {
    initDatabase();
    const contacts = getFromDB<ContactMessage>("amh_contact_messages");
    const filtered = contacts.filter(c => c.id !== id);
    saveToDB("amh_contact_messages", filtered);
  },

  updateProfileRole: (id: string, role: "student" | "admin" | "tutor"): Profile => {
    initDatabase();
    const profiles = getFromDB<Profile>("amh_profiles");
    const idx = profiles.findIndex(p => p.id === id);
    if (idx === -1) throw new Error("Profile not found");
    profiles[idx].role = role;
    saveToDB("amh_profiles", profiles);
    return profiles[idx];
  },

  addSubject: (subject: Omit<Subject, "id">): Subject => {
    initDatabase();
    const subjects = getFromDB<Subject>("amh_subjects");
    const newSubject: Subject = {
      ...subject,
      id: generateId("sub")
    };
    subjects.push(newSubject);
    saveToDB("amh_subjects", subjects);
    return newSubject;
  },

  updateSubject: (id: string, updated: Partial<Subject>): Subject => {
    initDatabase();
    const subjects = getFromDB<Subject>("amh_subjects");
    const idx = subjects.findIndex(s => s.id === id);
    if (idx === -1) throw new Error("Subject not found");
    const merged = { ...subjects[idx], ...updated };
    subjects[idx] = merged;
    saveToDB("amh_subjects", subjects);
    return merged;
  },

  deleteSubject: (id: string): void => {
    initDatabase();
    const subjects = getFromDB<Subject>("amh_subjects");
    const filtered = subjects.filter(s => s.id !== id);
    saveToDB("amh_subjects", filtered);
  },

  getActivityLogs: (): ActivityLog[] => {
    initDatabase();
    return getFromDB<ActivityLog>("amh_activity_logs").sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  addActivityLog: (log: Omit<ActivityLog, "id" | "created_at">): ActivityLog => {
    initDatabase();
    const logs = getFromDB<ActivityLog>("amh_activity_logs");
    const newLog: ActivityLog = {
      ...log,
      id: generateId("log"),
      created_at: new Date().toISOString()
    };
    logs.push(newLog);
    // Keep logs size reasonable
    if (logs.length > 100) {
      logs.shift();
    }
    saveToDB("amh_activity_logs", logs);
    return newLog;
  },

  // Attendance & Timetables
  getAttendanceEvents: (): AttendanceEvent[] => {
    initDatabase();
    return getFromDB<AttendanceEvent>("amh_attendance_events");
  },

  getStudentAttendanceRecords: (): StudentAttendanceRecord[] => {
    initDatabase();
    return getFromDB<StudentAttendanceRecord>("amh_student_attendance_records").sort((a, b) => 
      new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime()
    );
  },

  getStudentAttendanceByStudentId: (studentId: string): StudentAttendanceRecord[] => {
    initDatabase();
    return getFromDB<StudentAttendanceRecord>("amh_student_attendance_records")
      .filter(r => r.student_id === studentId)
      .sort((a, b) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime());
  },

  logStudentAttendance: (data: Omit<StudentAttendanceRecord, "id" | "joined_at">): StudentAttendanceRecord => {
    initDatabase();
    const records = getFromDB<StudentAttendanceRecord>("amh_student_attendance_records");
    
    // Check if attendance is already logged for this booking
    const existingIdx = records.findIndex(r => r.booking_id === data.booking_id && r.student_id === data.student_id);
    const nowISO = new Date().toISOString();

    if (existingIdx !== -1) {
      // Update existing record
      records[existingIdx] = {
        ...records[existingIdx],
        ...data,
        joined_at: nowISO,
        status: data.status || records[existingIdx].status
      };
      saveToDB("amh_student_attendance_records", records);

      // Also update booking status
      const bookings = getFromDB<Booking>("amh_bookings");
      const bIdx = bookings.findIndex(b => b.id === data.booking_id);
      if (bIdx !== -1) {
        bookings[bIdx].attendance_status = data.status || "present";
        bookings[bIdx].attendance_joined_at = nowISO;
        if (data.calendar_event_id) bookings[bIdx].calendar_event_id = data.calendar_event_id;
        if (data.calendar_event_link) bookings[bIdx].calendar_event_link = data.calendar_event_link;
        saveToDB("amh_bookings", bookings);
      }

      try {
        window.dispatchEvent(new CustomEvent("studentAttendanceLogged", { detail: records[existingIdx] }));
      } catch (e) {}

      return records[existingIdx];
    }

    const newRecord: StudentAttendanceRecord = {
      ...data,
      id: generateId("att-rec"),
      joined_at: nowISO
    };

    records.unshift(newRecord);
    saveToDB("amh_student_attendance_records", records);

    // Update booking
    const bookings = getFromDB<Booking>("amh_bookings");
    const bIdx = bookings.findIndex(b => b.id === data.booking_id);
    if (bIdx !== -1) {
      bookings[bIdx].attendance_status = data.status || "present";
      bookings[bIdx].attendance_joined_at = nowISO;
      if (data.calendar_event_id) bookings[bIdx].calendar_event_id = data.calendar_event_id;
      if (data.calendar_event_link) bookings[bIdx].calendar_event_link = data.calendar_event_link;
      saveToDB("amh_bookings", bookings);
    }

    // Log Activity
    dbAPI.addActivityLog({
      user_name: data.student_name,
      action: "Joined Tutoring Session",
      details: `${data.student_name} checked into ${data.subject_name} (${data.platform_joined}) — Attendance logged with status: ${data.status.toUpperCase()}`,
      type: "booking"
    });

    try {
      window.dispatchEvent(new CustomEvent("studentAttendanceLogged", { detail: newRecord }));
    } catch (e) {}

    return newRecord;
  },

  updateStudentAttendanceRecord: (id: string, updates: Partial<StudentAttendanceRecord>): StudentAttendanceRecord => {
    initDatabase();
    const records = getFromDB<StudentAttendanceRecord>("amh_student_attendance_records");
    const idx = records.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Attendance record not found");
    records[idx] = { ...records[idx], ...updates };
    saveToDB("amh_student_attendance_records", records);
    
    try {
      window.dispatchEvent(new CustomEvent("studentAttendanceLogged", { detail: records[idx] }));
    } catch (e) {}

    return records[idx];
  },

  deleteStudentAttendanceRecord: (id: string): void => {
    initDatabase();
    const records = getFromDB<StudentAttendanceRecord>("amh_student_attendance_records");
    const filtered = records.filter(r => r.id !== id);
    saveToDB("amh_student_attendance_records", filtered);
  },

  addAttendanceEvent: (event: Omit<AttendanceEvent, "id" | "spots_filled" | "attendee_ids" | "created_at">): AttendanceEvent => {
    initDatabase();
    const events = getFromDB<AttendanceEvent>("amh_attendance_events");
    const newEvent: AttendanceEvent = {
      ...event,
      id: generateId("att"),
      spots_filled: 0,
      attendee_ids: [],
      created_at: new Date().toISOString().split("T")[0]
    };
    events.push(newEvent);
    saveToDB("amh_attendance_events", events);
    return newEvent;
  },

  registerForAttendance: (eventId: string, studentId: string): void => {
    initDatabase();
    const events = getFromDB<AttendanceEvent>("amh_attendance_events");
    const idx = events.findIndex(e => e.id === eventId);
    if (idx !== -1) {
      if (events[idx].attendee_ids.includes(studentId)) {
        throw new Error("You are already registered for this workshop!");
      }
      if (events[idx].spots_filled >= events[idx].spots_max) {
        throw new Error("This masterclass is fully booked!");
      }
      events[idx].attendee_ids.push(studentId);
      events[idx].spots_filled += 1;
      saveToDB("amh_attendance_events", events);

      // Create a transaction record representing payment to attend!
      dbAPI.createPayment({
        booking_id: `N/A (Masterclass: ${events[idx].title})`,
        student_id: studentId,
        amount: events[idx].price,
        currency: "ZAR",
        payment_method: "EFT Masterclass Registration",
        transaction_id: "PF-CLASS-" + Math.floor(Math.random() * 1000000000),
        status: "successful"
      });

      // Log activity
      dbAPI.addActivityLog({
        user_name: "Student",
        action: "Booked Masterclass",
        details: `Student registered and paid R${events[idx].price} for workshop: ${events[idx].title}`,
        type: "payment"
      });
    }
  },

  deleteAttendanceEvent: (id: string): void => {
    initDatabase();
    const events = getFromDB<AttendanceEvent>("amh_attendance_events");
    const filtered = events.filter(e => e.id !== id);
    saveToDB("amh_attendance_events", filtered);
  },

  // Videos to Sell
  getVideosToSell: (): VideoToSell[] => {
    initDatabase();
    return getFromDB<VideoToSell>("amh_videos_to_sell");
  },

  addVideoToSell: (video: Omit<VideoToSell, "id" | "purchase_count" | "created_at">): VideoToSell => {
    initDatabase();
    const videos = getFromDB<VideoToSell>("amh_videos_to_sell");
    const newVideo: VideoToSell = {
      ...video,
      id: generateId("vts"),
      purchase_count: 0,
      created_at: new Date().toISOString().split("T")[0]
    };
    videos.push(newVideo);
    saveToDB("amh_videos_to_sell", videos);
    return newVideo;
  },

  purchaseVideoLesson: (videoId: string, studentId: string): void => {
    initDatabase();
    const videos = getFromDB<VideoToSell>("amh_videos_to_sell");
    const idx = videos.findIndex(v => v.id === videoId);
    if (idx !== -1) {
      videos[idx].purchase_count += 1;
      saveToDB("amh_videos_to_sell", videos);

      // Record a successful payment!
      dbAPI.createPayment({
        booking_id: `N/A (Purchased Video: ${videos[idx].title})`,
        student_id: studentId,
        amount: videos[idx].price,
        currency: "ZAR",
        payment_method: "PayFast Card Gateway",
        transaction_id: "PF-BUY-" + Math.floor(Math.random() * 1000000000),
        status: "successful"
      });

      // Log activity
      dbAPI.addActivityLog({
        user_name: "Student",
        action: "Purchased Video",
        details: `Student paid R${videos[idx].price} for tutorial: ${videos[idx].title}`,
        type: "payment"
      });
    }
  },

  deleteVideoToSell: (id: string): void => {
    initDatabase();
    const videos = getFromDB<VideoToSell>("amh_videos_to_sell");
    const filtered = videos.filter(v => v.id !== id);
    saveToDB("amh_videos_to_sell", filtered);
  },

  // Resource Library
  getResourceLibrary: (): ResourceLibraryItem[] => {
    initDatabase();
    return getFromDB<ResourceLibraryItem>("amh_resource_library");
  },

  addResourceItem: (item: Omit<ResourceLibraryItem, "id" | "print_count" | "created_at">): ResourceLibraryItem => {
    initDatabase();
    const resources = getFromDB<ResourceLibraryItem>("amh_resource_library");
    const newItem: ResourceLibraryItem = {
      ...item,
      id: generateId("res"),
      print_count: 0,
      created_at: new Date().toISOString().split("T")[0]
    };
    resources.push(newItem);
    saveToDB("amh_resource_library", resources);
    return newItem;
  },

  incrementResourcePrint: (id: string): void => {
    initDatabase();
    const resources = getFromDB<ResourceLibraryItem>("amh_resource_library");
    const idx = resources.findIndex(r => r.id === id);
    if (idx !== -1) {
      resources[idx].print_count = (resources[idx].print_count || 0) + 1;
      saveToDB("amh_resource_library", resources);
    }
  },

  deleteResourceItem: (id: string): void => {
    initDatabase();
    const resources = getFromDB<ResourceLibraryItem>("amh_resource_library");
    const filtered = resources.filter(r => r.id !== id);
    saveToDB("amh_resource_library", filtered);
    window.dispatchEvent(new CustomEvent("amh_resource_library_updated", { detail: { deletedId: id } }));
  },

  updateResourceItem: (id: string, updates: Partial<ResourceLibraryItem>): ResourceLibraryItem => {
    initDatabase();
    const resources = getFromDB<ResourceLibraryItem>("amh_resource_library");
    const idx = resources.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Resource library item not found");
    
    resources[idx] = { ...resources[idx], ...updates };
    saveToDB("amh_resource_library", resources);
    window.dispatchEvent(new CustomEvent("amh_resource_library_updated", { detail: { item: resources[idx] } }));
    return resources[idx];
  },

  bulkUpdateResourceItems: (updatesList: { id: string; changes: Partial<ResourceLibraryItem> }[]): ResourceLibraryItem[] => {
    initDatabase();
    const resources = getFromDB<ResourceLibraryItem>("amh_resource_library");
    const updatedItems: ResourceLibraryItem[] = [];

    updatesList.forEach(({ id, changes }) => {
      const idx = resources.findIndex(r => r.id === id);
      if (idx !== -1) {
        resources[idx] = { ...resources[idx], ...changes };
        updatedItems.push(resources[idx]);
      }
    });

    saveToDB("amh_resource_library", resources);
    window.dispatchEvent(new CustomEvent("amh_resource_library_updated", { detail: { count: updatedItems.length } }));

    dbAPI.addActivityLog({
      user_name: "Admin",
      action: "Bulk PDF Re-namer & Standardization",
      details: `Standardized file naming & re-tagged ${updatedItems.length} resource documents in catalog.`,
      type: "system"
    });

    return updatedItems;
  },

  // Website Subscribers
  getSubscribers: (): Subscriber[] => {
    initDatabase();
    return getFromDB<Subscriber>("amh_subscribers");
  },

  addSubscriber: (email: string): Subscriber => {
    initDatabase();
    const subscribers = getFromDB<Subscriber>("amh_subscribers");
    const existing = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      if (existing.status === "unsubscribed") {
        existing.status = "active";
        saveToDB("amh_subscribers", subscribers);
      }
      return existing;
    }
    const newSubscriber: Subscriber = {
      id: generateId("subscr"),
      email: email,
      status: "active",
      created_at: new Date().toISOString().split("T")[0]
    };
    subscribers.push(newSubscriber);
    saveToDB("amh_subscribers", subscribers);

    // Log the subscription
    dbAPI.addActivityLog({
      user_name: "Website Visitor",
      action: "New Subscription",
      details: `${email} subscribed to the Amaris Upgrade newsletter`,
      type: "system"
    });

    return newSubscriber;
  },

  toggleSubscriberStatus: (id: string): void => {
    initDatabase();
    const subscribers = getFromDB<Subscriber>("amh_subscribers");
    const idx = subscribers.findIndex(s => s.id === id);
    if (idx !== -1) {
      subscribers[idx].status = subscribers[idx].status === "active" ? "unsubscribed" : "active";
      saveToDB("amh_subscribers", subscribers);
    }
  },

  deleteSubscriber: (id: string): void => {
    initDatabase();
    const subscribers = getFromDB<Subscriber>("amh_subscribers");
    const filtered = subscribers.filter(s => s.id !== id);
    saveToDB("amh_subscribers", filtered);
  },

  // Tutors API
  getTutors: (): Profile[] => {
    initDatabase();
    const profiles = getFromDB<Profile>("amh_profiles");
    return profiles.filter(p => p.role === "tutor" || p.id === "usr-bethuel"); // Bethuel is head coach (role admin but behaves as tutor too!)
  },

  updateTutorAvailability: (id: string, isAvailable: boolean): Profile => {
    initDatabase();
    const profiles = getFromDB<Profile>("amh_profiles");
    const idx = profiles.findIndex(p => p.id === id);
    if (idx === -1) throw new Error("Tutor profile not found");
    profiles[idx].is_available = isAvailable;
    saveToDB("amh_profiles", profiles);

    // Also update logged-in user if it's them
    const currentUser = localStorage.getItem("amh_current_user");
    if (currentUser) {
      const parsed = JSON.parse(currentUser) as Profile;
      if (parsed.id === id) {
        parsed.is_available = isAvailable;
        localStorage.setItem("amh_current_user", JSON.stringify(parsed));
      }
    }

    // Log activity
    dbAPI.addActivityLog({
      user_name: `${profiles[idx].first_name} ${profiles[idx].surname}`,
      action: "Toggled Availability",
      details: `Tutor is now ${isAvailable ? "Ready for Immediate Sessions" : "Offline / Unavailable"}`,
      type: "system"
    });

    return profiles[idx];
  },

  // Mock Exam Performance Scores
  getMockExamScores: (studentId: string): MockExamScore[] => {
    initDatabase();
    const scores = getFromDB<MockExamScore>("amh_mock_exam_scores");
    
    // Auto-migrate: make sure the new quiz scores exist in local DB
    if (scores.length > 0 && !scores.some(s => s.id === "mscore-quiz-1")) {
      const extraQuizScores: MockExamScore[] = [
        {
          id: "mscore-quiz-1",
          student_id: studentId,
          exam_title: "Trigonometry Class Quiz",
          subject_or_topic: "Trigonometric Proofs & 3D Models",
          score_percentage: 71,
          exam_date: "2026-06-22",
          notes: "Good progress on reduction formulas, lost marks on general solutions.",
          created_at: "2026-06-22"
        },
        {
          id: "mscore-quiz-2",
          student_id: studentId,
          exam_title: "Calculus Limits Pop Quiz",
          subject_or_topic: "Differential Calculus",
          score_percentage: 78,
          exam_date: "2026-06-29",
          notes: "First principles limits solved perfectly. Minor notation error.",
          created_at: "2026-06-29"
        }
      ];
      const migrated = [...scores, ...extraQuizScores];
      saveToDB("amh_mock_exam_scores", migrated);
      return migrated.filter(s => s.student_id === studentId);
    }

    // Seed default mock scores if empty
    if (scores.length === 0) {
      const defaultScores: MockExamScore[] = [
        {
          id: "mscore-1",
          student_id: studentId,
          exam_title: "March Baseline Assessment",
          subject_or_topic: "Algebra & Equations",
          score_percentage: 54,
          exam_date: "2026-03-12",
          notes: "Foundational algebra test. Struggled with quadratic inequalities.",
          created_at: "2026-03-12"
        },
        {
          id: "mscore-2",
          student_id: studentId,
          exam_title: "April Progress Check",
          subject_or_topic: "Sequences & Series",
          score_percentage: 61,
          exam_date: "2026-04-18",
          notes: "Arithmetic and geometric series. Sigma notation clear.",
          created_at: "2026-04-18"
        },
        {
          id: "mscore-3",
          student_id: studentId,
          exam_title: "Term 1 Mock Paper 1",
          subject_or_topic: "Algebra & Calculus",
          score_percentage: 68,
          exam_date: "2026-05-10",
          notes: "First principles derivative done right, but lost marks on limits.",
          created_at: "2026-05-10"
        },
        {
          id: "mscore-4",
          student_id: studentId,
          exam_title: "June Mid-Year Exam P1",
          subject_or_topic: "Algebra, calculus & probability",
          score_percentage: 74,
          exam_date: "2026-06-15",
          notes: "Great improvement in calculus! Probability needs some revision.",
          created_at: "2026-06-15"
        },
        {
          id: "mscore-quiz-1",
          student_id: studentId,
          exam_title: "Trigonometry Class Quiz",
          subject_or_topic: "Trigonometric Proofs & 3D Models",
          score_percentage: 71,
          exam_date: "2026-06-22",
          notes: "Good progress on reduction formulas, lost marks on general solutions.",
          created_at: "2026-06-22"
        },
        {
          id: "mscore-quiz-2",
          student_id: studentId,
          exam_title: "Calculus Limits Pop Quiz",
          subject_or_topic: "Differential Calculus",
          score_percentage: 78,
          exam_date: "2026-06-29",
          notes: "First principles limits solved perfectly. Minor notation error.",
          created_at: "2026-06-29"
        },
        {
          id: "mscore-5",
          student_id: studentId,
          exam_title: "Winter School Boot Camp Test",
          subject_or_topic: "Trigonometry & Geometry",
          score_percentage: 82,
          exam_date: "2026-07-05",
          notes: "Double angle expansions and Euclidean proofs are solid now. Level 7!",
          created_at: "2026-07-05"
        }
      ];
      saveToDB("amh_mock_exam_scores", defaultScores);
      return defaultScores.filter(s => s.student_id === studentId);
    }
    return scores.filter(s => s.student_id === studentId);
  },

  addMockExamScore: (score: Omit<MockExamScore, "id" | "created_at">): MockExamScore => {
    initDatabase();
    const scores = getFromDB<MockExamScore>("amh_mock_exam_scores");
    const newScore: MockExamScore = {
      ...score,
      id: generateId("mscore"),
      created_at: new Date().toISOString().split("T")[0]
    };
    scores.push(newScore);
    saveToDB("amh_mock_exam_scores", scores);

    // Add activity log
    dbAPI.addActivityLog({
      user_name: "Student",
      action: "Logged Exam Score",
      details: `Logged mock score of ${score.score_percentage}% for ${score.exam_title}`,
      type: "system"
    });

    return newScore;
  },

  deleteMockExamScore: (id: string): void => {
    initDatabase();
    const scores = getFromDB<MockExamScore>("amh_mock_exam_scores");
    const filtered = scores.filter(s => s.id !== id);
    saveToDB("amh_mock_exam_scores", filtered);
  },

  // Exam Predictions & Deliveries
  getPredictions: (studentId?: string): ExamPrediction[] => {
    initDatabase();
    const predictions = getFromDB<ExamPrediction>("amh_predictor_runs");
    if (studentId) {
      return predictions.filter(p => p.student_id === studentId);
    }
    return predictions;
  },

  getDeliveries: (studentId?: string): ExamDelivery[] => {
    initDatabase();
    const deliveries = getFromDB<ExamDelivery>("amh_exam_deliveries");
    if (studentId) {
      return deliveries.filter(d => d.student_id === studentId);
    }
    return deliveries;
  },

  createDelivery: (delivery: Omit<ExamDelivery, "id" | "sent_at">): ExamDelivery => {
    initDatabase();
    const deliveries = getFromDB<ExamDelivery>("amh_exam_deliveries");
    const newDelivery: ExamDelivery = {
      ...delivery,
      id: generateId("deliv"),
      sent_at: null,
      retry_count: 0
    };
    deliveries.push(newDelivery);
    saveToDB("amh_exam_deliveries", deliveries);
    return newDelivery;
  },

  updateDelivery: (id: string, updated: Partial<ExamDelivery>): ExamDelivery => {
    initDatabase();
    const deliveries = getFromDB<ExamDelivery>("amh_exam_deliveries");
    const idx = deliveries.findIndex(d => d.id === id);
    if (idx === -1) throw new Error("Delivery record not found");
    const merged = { ...deliveries[idx], ...updated };
    deliveries[idx] = merged;
    saveToDB("amh_exam_deliveries", deliveries);
    return merged;
  },

  getNotifications: (studentId: string): AMHNotification[] => {
    initDatabase();
    const notifs = getFromDB<AMHNotification>("amh_notifications");
    return notifs.filter(n => n.student_id === studentId || n.student_id === "all");
  },

  addNotification: (notif: Omit<AMHNotification, "id" | "is_read" | "created_at">): AMHNotification => {
    initDatabase();
    const notifs = getFromDB<AMHNotification>("amh_notifications");
    const newNotif: AMHNotification = {
      ...notif,
      id: generateId("notif"),
      is_read: false,
      created_at: new Date().toISOString()
    };
    notifs.unshift(newNotif);
    saveToDB("amh_notifications", notifs);
    return newNotif;
  },

  markNotificationAsRead: (id: string): void => {
    initDatabase();
    const notifs = getFromDB<AMHNotification>("amh_notifications");
    const idx = notifs.findIndex(n => n.id === id);
    if (idx !== -1) {
      notifs[idx].is_read = true;
      saveToDB("amh_notifications", notifs);
    }
  },

  markAllNotificationsAsRead: (studentId: string): void => {
    initDatabase();
    const notifs = getFromDB<AMHNotification>("amh_notifications");
    let changed = false;
    notifs.forEach(n => {
      if ((n.student_id === studentId || n.student_id === "all") && !n.is_read) {
        n.is_read = true;
        changed = true;
      }
    });
    if (changed) {
      saveToDB("amh_notifications", notifs);
    }
  },

  deleteNotification: (id: string): void => {
    initDatabase();
    const notifs = getFromDB<AMHNotification>("amh_notifications");
    const filtered = notifs.filter(n => n.id !== id);
    saveToDB("amh_notifications", filtered);
  },

  getDeepFocusSessions: (studentId?: string): DeepFocusSession[] => {
    initDatabase();
    const sessions = getFromDB<DeepFocusSession>("amh_deep_focus_sessions");
    if (studentId) {
      return sessions.filter(s => s.student_id === studentId || s.student_id === "all");
    }
    return sessions;
  },

  addDeepFocusSession: (sessionData: Omit<DeepFocusSession, "id" | "timestamp">): DeepFocusSession => {
    initDatabase();
    const sessions = getFromDB<DeepFocusSession>("amh_deep_focus_sessions");
    const newSession: DeepFocusSession = {
      ...sessionData,
      id: generateId("focus"),
      timestamp: new Date().toISOString()
    };
    sessions.unshift(newSession);
    saveToDB("amh_deep_focus_sessions", sessions);

    // Also dispatch a custom window event for instant real-time UI updates
    try {
      window.dispatchEvent(new CustomEvent("deepFocusSessionLogged", { detail: newSession }));
    } catch (e) {}

    return newSession;
  },

  getArcadeScores: (studentId?: string): ArcadeScore[] => {
    initDatabase();
    const scores = getFromDB<ArcadeScore>("amh_arcade_scores");
    if (studentId) {
      return scores.filter(s => s.student_id === studentId);
    }
    return scores;
  },

  getArcadeAchievements: (studentId: string): ArcadeAchievement[] => {
    initDatabase();
    const allScores = getFromDB<ArcadeScore>("amh_arcade_scores");
    const userScores = allScores.filter(s => s.student_id === studentId);

    // Calculate user metrics
    const totalRuns = userScores.length;
    const maxCombo = userScores.length > 0 ? Math.max(...userScores.map(s => s.max_combo)) : 0;
    const maxVelocityPoints = userScores.length > 0 ? Math.max(...userScores.map(s => s.velocity_points)) : 0;
    const totalVelocityPoints = userScores.reduce((acc, s) => acc + s.velocity_points, 0);

    const maxAlgebraScore = userScores
      .filter(s => s.mode === "algebra_frenzy")
      .reduce((max, s) => Math.max(max, s.velocity_points), 0);

    const hasPerfectRun = userScores.some(s => s.total_questions >= 15 && s.accuracy_percentage === 100);

    // Global leaderboard rank 1 check
    const sortedGlobal = [...allScores].sort((a, b) => b.velocity_points - a.velocity_points);
    const isNumberOne = sortedGlobal.length > 0 && sortedGlobal[0].student_id === studentId;

    // Default trophy templates
    const templates: Omit<ArcadeAchievement, "progress_value" | "unlocked" | "unlocked_at">[] = [
      {
        id: "ach_first_sprint",
        student_id: studentId,
        title: "First Speed Sprint",
        description: "Complete your 1st Arcade Mode sprint",
        icon: "Zap",
        tier: "Bronze",
        category: "sprints",
        required_value: 1
      },
      {
        id: "ach_5_sprints",
        student_id: studentId,
        title: "Dedicated Sprinter",
        description: "Complete 5 Arcade sessions",
        icon: "Medal",
        tier: "Bronze",
        category: "sprints",
        required_value: 5
      },
      {
        id: "ach_combo_10",
        student_id: studentId,
        title: "Streak Ignition",
        description: "Reach a 10x combo streak in any mode",
        icon: "Flame",
        tier: "Silver",
        category: "combo",
        required_value: 10
      },
      {
        id: "ach_combo_20",
        student_id: studentId,
        title: "Flow State Titan",
        description: "Reach a 20x combo streak in a single run",
        icon: "Crown",
        tier: "Gold",
        category: "combo",
        required_value: 20
      },
      {
        id: "ach_velocity_1000",
        student_id: studentId,
        title: "Point Overdrive",
        description: "Score 1,000+ Velocity Points in a single run",
        icon: "Trophy",
        tier: "Silver",
        category: "points",
        required_value: 1000
      },
      {
        id: "ach_velocity_2000",
        student_id: studentId,
        title: "Velocity Titan",
        description: "Score 2,000+ Velocity Points in a single run",
        icon: "Award",
        tier: "Platinum",
        category: "points",
        required_value: 2000
      },
      {
        id: "ach_total_5000",
        student_id: studentId,
        title: "Velocity Millionaire",
        description: "Accumulate 5,000 total Velocity Points across runs",
        icon: "Sparkles",
        tier: "Platinum",
        category: "points",
        required_value: 5000
      },
      {
        id: "ach_algebra_master",
        student_id: studentId,
        title: "Algebra Frenzy Maestro",
        description: "Score 1,200+ points in Algebra Frenzy mode",
        icon: "Target",
        tier: "Gold",
        category: "special",
        required_value: 1200
      },
      {
        id: "ach_accuracy_100",
        student_id: studentId,
        title: "Flawless Execution",
        description: "Achieve 100% accuracy in a run with 15+ questions",
        icon: "Shield",
        tier: "Diamond",
        category: "accuracy",
        required_value: 100
      },
      {
        id: "ach_leaderboard_1",
        student_id: studentId,
        title: "Leaderboard Legend",
        description: "Claim the #1 spot on the Arcade Top Scorers",
        icon: "Crown",
        tier: "Diamond",
        category: "special",
        required_value: 1
      }
    ];

    // Read stored unlock states if any
    const storedAchievements = getFromDB<ArcadeAchievement>("amh_arcade_achievements")
      .filter(a => a.student_id === studentId);

    const storedMap = new Map<string, ArcadeAchievement>();
    storedAchievements.forEach(a => storedMap.set(a.id, a));

    const evaluated: ArcadeAchievement[] = templates.map(tmpl => {
      let currentVal = 0;
      if (tmpl.id === "ach_first_sprint" || tmpl.id === "ach_5_sprints") currentVal = totalRuns;
      else if (tmpl.id === "ach_combo_10" || tmpl.id === "ach_combo_20") currentVal = maxCombo;
      else if (tmpl.id === "ach_velocity_1000" || tmpl.id === "ach_velocity_2000") currentVal = maxVelocityPoints;
      else if (tmpl.id === "ach_total_5000") currentVal = totalVelocityPoints;
      else if (tmpl.id === "ach_algebra_master") currentVal = maxAlgebraScore;
      else if (tmpl.id === "ach_accuracy_100") currentVal = hasPerfectRun ? 100 : 0;
      else if (tmpl.id === "ach_leaderboard_1") currentVal = isNumberOne ? 1 : 0;

      const isUnlocked = currentVal >= tmpl.required_value;
      const prevStored = storedMap.get(tmpl.id);

      return {
        ...tmpl,
        progress_value: Math.min(currentVal, tmpl.required_value),
        unlocked: isUnlocked,
        unlocked_at: isUnlocked ? (prevStored?.unlocked_at || new Date().toISOString()) : undefined
      };
    });

    // Save evaluated state back
    const allStored = getFromDB<ArcadeAchievement>("amh_arcade_achievements")
      .filter(a => a.student_id !== studentId);
    
    saveToDB("amh_arcade_achievements", [...allStored, ...evaluated]);

    return evaluated;
  },

  addArcadeScore: (scoreData: Omit<ArcadeScore, "id" | "timestamp">): ArcadeScore => {
    initDatabase();
    const scores = getFromDB<ArcadeScore>("amh_arcade_scores");
    const newScore: ArcadeScore = {
      ...scoreData,
      id: generateId("arcade"),
      timestamp: new Date().toISOString()
    };
    scores.unshift(newScore);
    saveToDB("amh_arcade_scores", scores);

    try {
      window.dispatchEvent(new CustomEvent("arcadeScoreLogged", { detail: newScore }));
      
      // Auto trigger achievements re-evaluation
      setTimeout(() => {
        const updatedAch = dbAPI.getArcadeAchievements(scoreData.student_id);
        window.dispatchEvent(new CustomEvent("arcadeAchievementsUpdated", { detail: updatedAch }));
      }, 50);
    } catch (e) {}

    return newScore;
  }
};
