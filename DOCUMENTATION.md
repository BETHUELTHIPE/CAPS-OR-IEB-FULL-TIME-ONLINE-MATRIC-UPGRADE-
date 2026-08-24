# Amaris Learning Hub - Digital Platform Documentation

Welcome to the **Amaris Learning Hub** documentation. This document serves as a complete technical and operational guide for the web application, detailing the student and administrative portals, features, payment processing, and interactive utilities.

---

## 1. Technical Architecture & Tech Stack

The application is engineered as a robust **full-stack web application** running in a secure sandboxed container.

- **Frontend Framework**: React 19 + TypeScript.
- **Build System**: Vite (configured to proxy traffic via the Node backend during development).
- **Styling**: Tailwind CSS utilizing utility classes directly for a fluid, accessible UI supporting both Light and Dark themes.
- **Server / Backend**: Express (Node.js) server mapping custom API endpoints, static assets, and serving index templates on single-page routing.
- **State & Database**:
  - `src/lib/db.ts`: Robust client-side database driver mapping accounts (`Profile`), appointments (`Booking`), homework reviews (`HomeworkAssignment`), and transactions (`PaymentRecord`) persisted securely in `localStorage`.
  - Initial configurations and curriculum data are seeded automatically via `src/data.ts` on startup.

---

## 2. Core Portals & Workflows

### A. Authentication & Enrollment
- **Registration**: Students register with basic info, parent contacts, and select their specific syllabus stream:
  - *Matric Upgrade CAPS*
  - *Matric Upgrade IEB*
  - *Grade 12 CAPS*
  - *Grade 12 IEB*
- **Syllabus Focus**: Strictly targets Grade 12 National Senior Certificate (NSC) CAPS and IEB matric upgrades, excluding all lower grade levels to align with core brand positioning.

### B. Student Dashboard
- **Matric Exam Countdown Widget**: Tracks days, hours, and minutes remaining until the upcoming national final examinations, driving study focus and urgency.
- **Upcoming Tutoring Sessions List**: Displays booked lessons with date, time, subject, and direct integration buttons.
- **Calendar Exporter (.ics)**: An interactive exporter allowing students to download their upcoming tutoring schedule to Google Calendar, Apple Calendar, or Microsoft Outlook.
- **Homework & Review Panel**: Students view homework assignments set by **Head Instructor Bethuel Moukangwe**, submit their answers, and access step-by-step video review solutions.

---

## 3. Advanced Features & Integrated Tools

### I. Real-Time Notification Bell
- **Location**: Mounted prominently on the navigation header.
- **Functionality**: Polls upcoming bookings every 15 seconds. If a lesson is scheduled to start in **10 minutes or less**, the bell bounces, a red indicator dot displays, and a notification dropdown appears.
- **Direct Joining**: Students can click the **"Join Live Whiteboard Now"** link to launch the collaborative classroom instantly.
- **Simulation Tool**: Includes a built-in **"⚡ Simulate Session"** button in the notification footer, allowing evaluators and students to immediately trigger an upcoming 10-minute alert for testing purposes without manually scheduling future calendar slots.

### II. Post-Session Feedback Modal
- **Completion Flow**: When a student marks a booked lesson as "Completed" in their dashboard, the platform launches a dedicated **Feedback and Star Rating Modal**.
- **Interactive Ratings**: Students rate the lesson out of 5 stars and submit descriptive feedback remarks.
- **Roster Persistence**: Ratings and comments are stored with the booking object, allowing the tutoring hub to track student satisfaction metrics and optimize lecture focus.

---

## 4. PayFast Payment Integration & Video Lesson Pricing

### A. Business Rules
- **Access Rule**: Only logged-in, registered students are authorized to buy on-demand video breakdown explanations.
- **Pricing**: Video lessons are priced at **R150 per hour** (South African Rand).

### B. Payment Credentials
The system integrates directly with the secure South African **PayFast Gateway**:
- **Merchant ID**: `32064297`
- **Merchant Key**: `l4b0wlcme76lc`

### C. Checkout Flow
1. The student navigates to the **Video Lessons Portal** or requests a specific custom solution.
2. Clicking **"Request Video Lesson"** launches the custom checkout form where students input their requested duration (in hours) and upload diagnostic past-paper worksheets (PDF or JPEG).
3. The platform calculates the cost: `Hours × R150 = Total Cost (ZAR)`.
4. Upon confirmation, a secure payload containing the unique billing reference and PayFast merchant keys is compiled, routing the student to the active payment checkout.

---

## 5. Development & Compilation Instructions

To run, compile, and build the application:

```bash
# 1. Install dependencies from package.json
npm install

# 2. Start the integrated dev server (Express + Vite on Port 3000)
npm run dev

# 3. Lint the codebase to ensure syntax and import integrity
npm run lint

# 4. Build static bundle and bundle backend into dist/server.cjs
npm run build

# 5. Launch the production application
npm run start
```

---

## 6. Lead Instructor & Development Lead
- **Founder & Head Instructor**: Bethuel Moukangwe (Thipe)
- **GitHub Profile**: [https://github.com/BETHUELTHIPE](https://github.com/BETHUELTHIPE)
- **Developer Organization**: Audrin Developers
- **Official Contact**: bethuelmoukangwe8@gmail.com / 071 415 6665

---

*Prepared by Amaris Learning Hub HQ - Pretoria, South Africa.*
