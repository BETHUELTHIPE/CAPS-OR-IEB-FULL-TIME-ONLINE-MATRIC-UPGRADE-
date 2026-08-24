// Amaris Mathematics Hub (AMH) - End-to-End Test Suite
// Playwright Scenarios: Registration -> Payment -> Dashboard -> Assignment -> Admin

// Scenario 1: Student Registration -> Login -> Purchase Membership -> Payment -> Dashboard -> Watch Video
export const Scenario1_StudentOnboardingAndLearning = {
  name: "Scenario 1: Student Registration & Learning Journey",
  steps: [
    { step: 1, action: "Navigate to /register", target: "#register-btn", expectedUrl: "/register" },
    { step: 2, action: "Fill student details & select Grade 12 CAPS", target: "input[name='full_name']", value: "Sipho Khumalo" },
    { step: 3, action: "Submit registration form", target: "#submit-register", expectedState: "Authenticated" },
    { step: 4, action: "Navigate to Booking & Payment page", target: "#nav-tab-payments", expectedUrl: "/payments" },
    { step: 5, action: "Select Semester Tutoring Package (R450/hr)", target: "#pkg-semester-select" },
    { step: 6, action: "Complete PayFast simulated payment", target: "#payfast-checkout-btn", expectedStatus: "Payment Approved" },
    { step: 7, action: "Access Student Dashboard", target: "#nav-tab-overview", expectedHeader: "Welcome Sipho Khumalo" },
    { step: 8, action: "Watch Whiteboard Explanation Video", target: "#play-video-v1", expectedState: "Playing Calculus Video" }
  ]
};

// Scenario 2: Student Submits Assignment -> Tutor Receives Notification -> Tutor Grades -> Student Feedback
export const Scenario2_AssignmentSubmissionAndGradingLoop = {
  name: "Scenario 2: Assignment Submission & Grading Loop",
  steps: [
    { step: 1, action: "Student opens Homework Portal", target: "#nav-tab-homework" },
    { step: 2, action: "Student uploads Paper 1 Calculus PDF scan", target: "#homework-file-upload", file: "calculus_paper1_scan.pdf" },
    { step: 3, action: "Student submits assignment", target: "#submit-assignment-btn", expectedStatus: "Submission Logged" },
    { step: 4, action: "Tutor views notification in Outbox", target: "#tutor-notification-badge", count: 1 },
    { step: 5, action: "Tutor reviews scan & assigns grade 88%", target: "#grade-input-sub555", value: 88 },
    { step: 6, action: "Student receives real-time feedback popup", target: "#student-feedback-modal", expectedGrade: "88%" }
  ]
};

// Scenario 3: Admin Manages Platform
export const Scenario3_AdminPlatformManagement = {
  name: "Scenario 3: Admin & Tutor Platform Management",
  steps: [
    { step: 1, action: "Admin logs into Control Center", target: "#admin-login-btn" },
    { step: 2, action: "Admin views live operations & revenue analytics", target: "#admin-revenue-stat", expectedMetric: "R12,450" },
    { step: 3, action: "Admin manages tutor weekly availability grid", target: "#tutor-calendar-grid", actionType: "Block Slot 15:00 Wednesday" },
    { step: 4, action: "Admin dispatches SMTP lesson reminder", target: "#send-smtp-reminder-btn", expectedStatus: "Reminder Sent" }
  ]
};
