export interface PriorityQuizTask {
  id: string;
  student_id: string;
  title: string;
  topic: string;
  syllabus_gap_reason: string;
  target_exam_date: string;
  exam_title: string;
  days_until_exam: number;
  scheduled_day: string;
  scheduled_time: string;
  estimated_minutes: number;
  difficulty: "Easy" | "Medium" | "Hard" | "Exam Level";
  priority: "High" | "Urgent" | "Critical";
  xp_reward: number;
  question_count: number;
  status: "pending" | "in_progress" | "completed";
  score_achieved?: number;
  created_at: string;
}

export interface Profile {
  id: string;
  first_name: string;
  surname: string;
  email: string;
  phone: string;
  whatsapp_number: string;
  province: string;
  school: string;
  grade: string; // High School, Matric Upgrade, TVET, IEB, University
  parent_name: string;
  parent_phone: string;
  role: "student" | "admin" | "tutor" | "super_admin";
  is_super_admin?: boolean;
  avatar_url?: string;
  created_at?: string;
  specialization?: string;
  bio?: string;
  is_available?: boolean;
  email_session_reminders?: boolean;
  email_blog_posts?: boolean;
  completed_modules?: string[];
  topic_progress?: Record<string, number>;
  mfa_enabled?: boolean;
  mfa_method?: "email" | "totp";
  mfa_secret?: string;
  backup_codes?: string[];
  teaching_philosophy?: string;
  years_experience?: number;
  qualifications?: string[];
  subjects_taught?: string[];
  github_url?: string;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  grade_level: string; // "High School", "Matric Upgrade", "TVET", "IEB", "University"
  price_per_hour: number;
  topics: string[];
  is_active: boolean;
}

export interface LessonPackage {
  id: string;
  name: string;
  description: string;
  lessons_count: number;
  price: number;
  discount_percentage: number;
  duration_days: number;
  features: string[];
}

export interface Booking {
  id: string;
  student_id: string;
  subject_id: string;
  package_id: string;
  booking_reference: string; // AMH-XXXXXXX
  lesson_date: string;
  lesson_time: string;
  duration_minutes: number;
  platform: "Google Meet" | "Zoom" | "WhatsApp Video" | "MS Teams";
  topics_to_cover: string[];
  notes?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  meeting_link?: string;
  calendar_event_id?: string;
  calendar_event_link?: string;
  attendance_status?: "unattended" | "present" | "on_time" | "late";
  attendance_joined_at?: string;
  rating?: number;
  feedback_remarks?: string;
  topics_covered?: string[];
  category_ratings?: Record<string, number>;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  student_id: string;
  amount: number;
  currency: string; // ZAR
  payment_method: string; // Instant EFT, Card, PayFast, EFT, Google Pay
  transaction_id: string;
  status: "pending" | "successful" | "failed";
  receipt_number?: string;
  delivery_channel?: DeliveryChannel;
  created_at: string;
}

export type DeliveryChannel = "email" | "whatsapp" | "both";

export interface PaymentReceipt {
  id: string;
  receipt_number: string; // e.g. AMH-REC-2026-XXXXX
  booking_id: string;
  booking_reference: string;
  student_id: string;
  student_name: string;
  student_email: string;
  student_phone?: string;
  student_grade?: string;
  student_school?: string;
  parent_name?: string;
  parent_phone?: string;
  tutor_id?: string;
  tutor_name: string;
  tutor_title?: string;
  subject_id: string;
  subject_name: string;
  package_id: string;
  package_name: string;
  lessons_count: number;
  lesson_date: string;
  lesson_time: string;
  duration_minutes: number;
  platform: string;
  meeting_link?: string;
  topics_to_cover: string[];
  notes?: string;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_id: string;
  delivery_channel: DeliveryChannel;
  sent_to_student: boolean;
  sent_to_super_user: boolean;
  student_channel_status?: string;
  super_user_channel_status?: string;
  super_user_email: string;
  super_user_whatsapp: string;
  created_at: string;
  verification_hash: string;
  qr_code_data?: string;
  pdf_download_url?: string;
}

export interface Testimonial {
  id: string;
  student_id: string;
  student_name: string;
  grade: string;
  content: string;
  rating: number; // 1-5
  is_approved: boolean;
  created_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: "General" | "Lessons" | "Payments" | "Matric Upgrade" | "Online Hub";
  sort_order: number;
  is_active: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
  created_at: string;
}

export interface VideoLessonRequest {
  id: string;
  student_id: string;
  subject: string;
  chapter_title: string;
  description: string;
  document_urls: string[];
  document_names: string[];
  status: "pending" | "processing" | "completed" | "cancelled";
  video_url?: string;
  duration_minutes?: number;
  price: number;
  payment_status: "unpaid" | "paid";
  notes?: string;
  delivery_type?: "standard" | "express";
  curriculum?: "CAPS" | "IEB";
  created_at: string;
}

export interface HomeworkAssignment {
  id: string;
  student_id: string;
  title: string;
  description: string;
  subject: string;
  due_date: string;
  status: "assigned" | "submitted" | "graded" | "completed";
  created_at: string;
}

export interface HomeworkGradingQuestionBreakdown {
  questionNumber: string;
  topic: string;
  maxMarks: number;
  awardedMarks: number;
  status: "correct" | "partial" | "incorrect";
  methodMarks: number;
  accuracyMarks: number;
  consistentAccuracyMarks: number;
  feedback: string;
  studentWorkingTranscription: string;
  stepChecks: string[];
}

export interface HomeworkGradingResult {
  scorePercentage: number;
  capsLevel: number;
  levelLabel: string;
  totalMarksAwarded: number;
  totalPossibleMarks: number;
  overallSummary: string;
  keyWins: string[];
  areasForCorrection: string[];
  tutorAdvice: string;
  questionsBreakdown: HomeworkGradingQuestionBreakdown[];
  gradedBy: string;
  gradedAt: string;
  convertedPdfUrl?: string;
  convertedPdfName?: string;
  pdfPagesCount?: number;
}

export interface HomeworkSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: string; // e.g. "1.2 MB"
  notes?: string;
  status: "pending_review" | "reviewed";
  tutor_feedback?: string;
  created_at: string;
  // Enhanced handwritten and auto-grading properties
  is_handwritten_task?: boolean;
  converted_pdf_url?: string;
  converted_pdf_name?: string;
  pdf_pages_count?: number;
  grade_score?: number;
  caps_level?: number;
  total_marks?: number;
  marks_obtained?: number;
  grading_result?: HomeworkGradingResult;
  handwritten_images?: string[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: "General" | "Academic" | "Exam Prep" | "Schedule";
  created_at: string;
  is_urgent?: boolean;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  user_name: string;
  action: string;
  details: string;
  created_at: string; // ISO String
  type: "auth" | "booking" | "payment" | "homework" | "video" | "announcement" | "message" | "system";
}

export interface StudentAttendanceRecord {
  id: string;
  booking_id: string;
  booking_reference: string;
  student_id: string;
  student_name: string;
  student_email: string;
  grade?: string;
  subject_id: string;
  subject_name: string;
  lesson_date: string;
  lesson_time: string;
  joined_at: string; // ISO String
  calendar_event_id?: string;
  calendar_event_link?: string;
  status: "on_time" | "late" | "present";
  platform_joined: "Google Meet" | "Zoom Whiteboard" | "Interactive Classroom";
  meeting_link?: string;
  device_info?: string;
  logged_to_google_sheets: boolean;
  sheets_row_synced_at?: string;
}

export interface AttendanceEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  price: number;
  spots_max: number;
  spots_filled: number;
  attendee_ids: string[]; // List of student IDs
  created_at: string;
}

export interface VideoToSell {
  id: string;
  title: string;
  description: string;
  price: number;
  video_url: string;
  duration: string;
  chapter: string;
  purchase_count: number;
  created_at: string;
}

export interface ResourceLibraryItem {
  id: string;
  title: string;
  description: string;
  file_type: "pdf" | "word" | "image";
  file_name: string;
  file_size: string;
  file_url: string;
  print_count?: number;
  created_at: string;
  syllabus?: "CAPS" | "IEB" | "Both";
  grade_level?: "Grade 10" | "Grade 11" | "Grade 12" | "All";
  topic?: string;
}

export interface Subscriber {
  id: string;
  email: string;
  status: "active" | "unsubscribed";
  created_at: string;
}

export interface EmailLog {
  id: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  body_html: string;
  body_text: string;
  trigger_type: "booking_confirmation" | "booking_updated";
  booking_reference: string;
  status: "sent" | "failed" | "simulated";
  error_message?: string;
  created_at: string;
}

export interface MockExamScore {
  id: string;
  student_id: string;
  exam_title: string;
  subject_or_topic: string; // e.g. "Algebra", "Calculus", "Trigonometry", "Paper 1", "Paper 2"
  score_percentage: number; // e.g. 75
  exam_date: string; // YYYY-MM-DD
  notes?: string;
  created_at: string;
}

export interface ExamQuestion {
  number: number;
  topic: string;
  marks: number;
  cognitiveLevel: "Knowledge" | "Routine" | "Complex" | "Problem Solving";
  scenario: string;
  subQuestions: Array<{
    id: string;
    text: string;
    marks: number;
    memo: string;
  }>;
}

export interface ExamPrediction {
  id: string;
  student_id: string;
  syllabus: "CAPS" | "IEB";
  paper_type: "p1" | "p2";
  year: number;
  generated_at: string;
}

export interface ExamDelivery {
  id: string;
  student_id: string;
  student_name: string;
  exam_prediction_id: string;
  email_address: string;
  whatsapp_number: string;
  pdf_url: string;
  email_status: "pending" | "sent" | "failed" | "simulated";
  whatsapp_status: "pending" | "sent" | "failed" | "simulated";
  sent_at: string | null;
  retry_count?: number;
}

export interface TutorReport {
  id: string;
  student_id: string;
  student_name: string;
  tutor_id: string;
  tutor_name: string;
  created_at: string; // YYYY-MM-DD
  period_start: string; // YYYY-MM-DD
  period_end: string; // YYYY-MM-DD
  overall_progress_score: number; // 0-100
  summary_text: string;
  key_challenges: string[];
  suggested_revision_topics: string[];
  mastered_concepts: string[];
  lessons_covered_count: number;
  homework_completion_rate: number; // 0-100
  average_mock_score: number; // 0-100
}

export interface AMHNotification {
  id: string;
  student_id: string; // specific student ID or "all" for broadcast alerts
  title: string;
  message: string;
  type: "video_uploaded" | "slot_available" | "system";
  is_read: boolean;
  metadata?: {
    video_id?: string;
    video_title?: string;
    tutor_name?: string;
    slot_date?: string;
    slot_time?: string;
  };
  created_at: string;
}

export interface SubscriptionInvoice {
  id: string;
  invoice_number: string;
  amount: number;
  status: "paid" | "unpaid" | "failed";
  due_date: string;
  paid_at?: string;
  transaction_id?: string;
}

export interface Subscription {
  id: string;
  student_id: string;
  student_name: string;
  package_id: string;
  package_name: string;
  amount: number;
  billing_cycle: "monthly" | "weekly";
  status: "active" | "paused" | "cancelled" | "past_due";
  start_date: string;
  next_billing_date: string;
  last_payment_date: string;
  payment_method: string;
  auto_renew: boolean;
  history: SubscriptionInvoice[];
}

export interface StudentActivity {
  id: string;
  student_id: string;
  action_type: "viewed_lesson" | "submitted_exercise" | "earned_badge" | "booked_lesson" | "completed_exam" | "study_goal_updated" | "focus_session" | "system";
  title: string;
  description: string;
  timestamp: string; // ISO date string or formatted time
  category?: "Algebra" | "Calculus" | "Trigonometry" | "Geometry" | "Functions" | "Probability" | "Financial Maths" | "Exam Prep" | "General Practice";
  metadata?: {
    lesson_id?: string;
    exercise_id?: string;
    badge_name?: string;
    score?: number;
    goal_title?: string;
    file_name?: string;
  };
}

export interface DeepFocusSession {
  id: string;
  student_id: string;
  topic_name: string;
  paper_category: string;
  duration_minutes: number;
  actual_seconds_focused: number;
  marks_achieved?: number;
  total_marks?: number;
  score_percentage?: number;
  ambient_audio_used?: "none" | "focus_tone" | "rain";
  notes?: string;
  timestamp: string;
}

export interface ArcadeScore {
  id: string;
  student_id: string;
  student_name: string;
  velocity_points: number;
  correct_count: number;
  total_questions: number;
  accuracy_percentage: number;
  max_combo: number;
  mode: "60s_blitz" | "survival_3_lives" | "algebra_frenzy" | "speed_calc";
  timestamp: string;
}

export interface ArcadeAchievement {
  id: string;
  student_id: string;
  title: string;
  description: string;
  icon: string;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";
  category: "sprints" | "combo" | "points" | "accuracy" | "special";
  required_value: number;
  progress_value: number;
  unlocked: boolean;
  unlocked_at?: string;
}

export interface WeeklyInsight {
  id: string;
  student_id: string;
  student_name: string;
  week_ending_date: string;
  headline: string;
  summary: string;
  key_wins: string[];
  focus_areas: string[];
  tutor_encouragement: string;
  recommended_goal: string;
  hours_studied: number;
  streak_days: number;
  total_xp: number;
  created_at: string;
  source?: "gemini" | "fallback";
}

export interface TimeSlot {
  id: string;
  label: string;
  periodName: string;
  timeRange: string;
}

export interface SubjectPaletteItem {
  id: string;
  name: string;
  category: "Calculus" | "Algebra" | "Trigonometry" | "Geometry" | "Financial Maths" | "Statistics" | "Exam Prep";
  icon: string;
  defaultMinutes: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface MilestoneItem {
  id: string;
  title: string;
  category: "Exam Trial" | "Badge Unlock" | "Syllabus Mastery";
  targetDay: string;
  rewardXP: number;
  badgeName?: string;
  description: string;
  linkedCategory: SubjectPaletteItem["category"];
  isUrgent?: boolean;
}

export interface ScheduledStudySession {
  id: string;
  title: string;
  category: SubjectPaletteItem["category"];
  dayAssigned?: string;
  timeSlotId?: string;
  estimatedMinutes: number;
  notes?: string;
  completed: boolean;
  milestoneTag?: string;
}






