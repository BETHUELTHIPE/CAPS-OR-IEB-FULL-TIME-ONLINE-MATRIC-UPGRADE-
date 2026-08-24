# AGENTS.md — Amaris Mathematics Hub (AMH) Developer Guide

Welcome to the **Amaris Mathematics Hub (AMH)** code base. This document contains the project specification, structural boundaries, and technical references to ensure consistent development patterns.

---

## 1. Project Specification & Core Prompt
**Amaris Mathematics Hub** is a premium, full-stack online learning platform dedicated to South African high school students (Grade 10-12) taking **NSC (CAPS)** and **IEB** Mathematics.

### Major Core Modules
1. **Interactive Client Dashboard**:
   - Track active and past booked tutoring lessons.
   - Request custom whiteboard recorded explanation videos.
   - Download assigned homework PDFs and submit step-by-step scans or photographs.
   - Interactive Recharts performance line charts tracking mock exam trial scores.
   - Post-session rating and feedback form which triggers immediately once a session's scheduled hour has passed.

2. **Collaborative Virtual Classroom Whiteboard**:
   - Live whiteboard canvas simulator.
   - Comprehensive toolbar: Brush thickness slider, color picker, geometric shapes (Line, Rectangle, Circle).
   - Eraser tool for local vector deletion.
   - Undo/Redo historical state stacks.

3. **Resource Library & Dynamic Sandbox**:
   - Searchable, category-filtered mathematical reference grid (Algebra, Calculus, Trigonometry).
   - Interactive Calculator Sandbox: Type variable values into CAPS formulas (e.g. Quadratic, Sine/Cosine rules, Derivative Limits) to view real-time computational step-by-step outputs.

4. **Amaris Control Center (Admin/Tutor Console)**:
   - **Control & Live Analytics**: Real-time EFT/PayFast simulated revenue tracking, booking statuses, active student registrations, and portal operations metrics.
   - **User Directory**: Search and view detailed student records, grades, and parent email logs.
   - **Booking Management**: Accept pending lessons, automatically generate Google Meet virtual room links, cancel slots, or mark as completed.
   - **SMTP Lesson Reminders**: Manual and automatic email dispatching utilizing system SMTP integration, logged into an auditable notification outbox.
   - **Tutor Weekly Availability Grid**: Interactive weekly calendar grid allowing tutors to block slots as "Busy" or open them as "Free", dynamically syncing with the Booking Wizard to block schedule conflicts.

---

## 2. Technical Stack & Dependencies
- **Frontend**: React 18+ (Vite, TypeScript).
- **Styling**: Tailwind CSS (Navy / Gold / Royal blue high-contrast premium theme pairing).
- **Animation**: `motion` (imported from `motion/react`).
- **Icons**: `lucide-react` (do not import custom SVGs).
- **Charts**: `recharts` for mock exam statistics.
- **Backend & Email**: Express custom server (`server.ts`) proxying SMTP dispatch with `nodemailer`.

---

## 3. Database & Local Storage Keys
Persistence relies on standard client-side `localStorage` via helper functions `getFromDB<T>(key)` and `saveToDB<T>(key, data)` defined in `src/lib/db.ts`:

| Key Name | Data Type | Description |
|---|---|---|
| `amh_profiles` | `Profile[]` | User account registries (Students, Parents, Tutors). |
| `amh_bookings` | `Booking[]` | Lesson bookings, references, meeting links, ratings, and remarks. |
| `amh_payments` | `Payment[]` | EFT/PayFast checkout transactions history. |
| `amh_homework_assignments` | `HomeworkAssignment[]` | Homework worksheets distributed by the tutor. |
| `amh_homework_submissions` | `HomeworkSubmission[]` | Homework step-by-step scans uploaded by students. |
| `amh_video_requests` | `VideoLessonRequest[]` | Video requests, recording links, and duration details. |
| `amh_announcements` | `Announcement[]` | General broadcast notifications for CAPS/IEB students. |
| `amh_mock_exam_scores` | `MockExamScore[]` | Trial performance metrics tracked on student dashboards. |
| `amh_tutor_availability` | `Record<string, string[]>` | Custom weekly schedule blocking arrays mapped by weekday names. |

---

## 4. Key Project Conventions
- **Single-View & Clean Scoping**: Adhere strictly to user requests. Avoid bloating files with unsolicited mock elements.
- **Lazy Initialization**: Initialize integrations (e.g., SMTP transport, Firebase, Gemini API) lazily at runtime instead of module loading to prevent startup crashes.
- **Port Ingress**: Dev servers must always run on port `3000` binding to host `0.0.0.0`.
- **Typographic Pairings**: Use clean "Inter" for primary body copy, "Space Grotesk" for displays, and "JetBrains Mono" for code outputs, metadata tags, and formula parameters.
