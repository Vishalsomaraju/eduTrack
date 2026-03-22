<div align="center">

<img src="https://img.shields.io/badge/Status-Active_Development-F5A623?style=for-the-badge" />
<img src="https://img.shields.io/badge/Version-1.0.0-3B82F6?style=for-the-badge" />
<img src="https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge" />

<br /><br />

```
  ███████╗██████╗ ██╗   ██╗████████╗██████╗  █████╗  ██████╗██╗  ██╗
  ██╔════╝██╔══██╗██║   ██║╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██║ ██╔╝
  █████╗  ██║  ██║██║   ██║   ██║   ██████╔╝███████║██║     █████╔╝ 
  ██╔══╝  ██║  ██║██║   ██║   ██║   ██╔══██╗██╔══██║██║     ██╔═██╗ 
  ███████╗██████╔╝╚██████╔╝   ██║   ██║  ██║██║  ██║╚██████╗██║  ██╗
  ╚══════╝╚═════╝  ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
```

### Smart Academic Management & Real-Time Analytics System

*Built for KPRIT · Department of Computer Science & Engineering · RTRP 2025–26*

<br />

[**Live Demo**](#) · [**Report Bug**](https://github.com/Vishalsomaraju/edutrack/issues) · [**Backend Repo**](#)

</div>

---

## ✦ What is EduTrack?

EduTrack is a **real-time academic management platform** built for engineering colleges that are done with paper registers, scattered Excel sheets, and students who find out they failed attendance at the end of the semester.

It gives **admins, faculty, and students** a single, fast, beautiful place to manage and understand academic data — with everything updating **live, as it happens.**

> Faculty marks a student absent → that student's dashboard updates **instantly.** No refresh. No delay. No end-of-week surprise.

---

## ✦ The Problem It Solves

Most college attendance systems are either:
- 📋 A physical register (2005 called, it wants its clipboard back)
- 📊 An Excel file that lives on one faculty member's laptop
- 🏛️ A massive ERP system that costs a fortune and does 90% more than you need

EduTrack sits in the gap — **focused, fast, and actually usable** — with analytics that turn raw attendance numbers into decisions.

---

## ✦ Core Features

| Feature | What it does |
|---|---|
| 🔴 **Live Attendance** | Faculty marks → dashboards update in real-time via Supabase Realtime |
| ⚠️ **Risk Detection** | Auto-flags students below 75% attendance or 40% marks average |
| 📊 **Analytics Dashboard** | Trends, distributions, class averages — all live-updating charts |
| 📚 **Full Marks System** | Theory (Mid1, Mid2, External) + Lab (Viva, Record, Exam) with auto grade calculation |
| 🎓 **Course Management** | Complete R22 B.Tech CSE syllabus across all 8 semesters with elective registration |
| 👥 **Admin Panel** | Create/delete students & faculty, assign subjects, manage elective deadlines |
| 📤 **CSV Export** | Faculty can export class reports; students can export personal academic reports |
| 🌙 **Light + Dark Theme** | Warm parchment light mode. Deep dark mode. Both polished. |
| 🔐 **Secure Auth** | ES256 JWT + Supabase Auth with role-based route protection |
| 👤 **Profile Management** | Full profile editing with avatar upload for all roles |

---

## ✦ Tech Stack

```
Frontend      →   React 19  ·  Vite  ·  Tailwind CSS  ·  Framer Motion
Charts        →   Recharts
State         →   Zustand
Backend       →   FastAPI  (Python 3.11+)
Database      →   Supabase  (PostgreSQL + Realtime)
Auth          →   Supabase Auth  ·  ES256 JWT (JWKS verification)
Deploy        →   Vercel (frontend)  ·  Render (backend)
```

---

## ✦ Three User Roles

### 🔑 Admin
- Full dashboard with system-wide stats (total students, faculty, attendance averages, at-risk count)
- **Students page** — add students with auto-enrollment into correct semester subjects, delete with cascading cleanup
- **Faculty page** — add faculty, view assigned subjects per faculty member, delete
- **Subjects page** — assign faculty to any subject across all 8 semesters, manage elective registration deadlines per slot

### 👨‍🏫 Faculty
- Subject cards showing live attendance averages and at-risk counts
- **Quick Attendance widget** — mark today's attendance directly from the dashboard
- Full attendance marker with student roster, Present/Late/Absent toggles, and Supabase Realtime live sync
- Marks entry for theory (Mid1 exam + assignment, Mid2 exam + assignment, External) and lab subjects
- Analytics: attendance trends, grade distributions, at-risk student table
- Export class CSV reports

### 🎓 Student
- Personal dashboard with attendance rings per subject, recent activity feed, marks summary
- **Attendance page** — per-subject view with calendar heatmap and summary stats
- **Marks page** — theory + lab tabs, all 8 semesters, full breakdown (Mid-1, Mid-2, Internal avg, External, Total, Grade)
- **My Courses page** — R22 B.Tech CSE syllabus for all 8 sems, elective registration with slot deadlines, syllabus viewer
- Analytics with personal attendance heatmap and grade distribution
- Export personal academic report CSV

---

## ✦ API Endpoints (29 total)

```
Auth (5)        →  GET/PATCH /auth/me, profile, avatar upload
Students (3)    →  GET /students/, /me, /{id}
Faculty (2)     →  GET /faculty/, /{id}
Subjects (6)    →  CRUD + enrolled students
Attendance (6)  →  Mark, edit, summary, student view, batch summary
Marks (4)       →  Theory marks CRUD + student view
Lab Marks (4)   →  Lab marks CRUD + student view
Courses (5)     →  Subjects, electives, deadlines, register, syllabus
Analytics (4)   →  Trend, grade distribution, at-risk, subject comparison
Admin (5)       →  Create/delete users, assign faculty, manage deadlines
```

---

## ✦ Database Schema (Key Tables)

```
profiles              → id, role, name, email, avatar_url, phone, ...
student_profiles      → roll_number, year, semester, admission_type, family info
faculty_profiles      → employee_id, designation, qualification, experience
subjects              → name, code, semester, year, credits, subject_type, faculty_id
enrollments           → student_id, subject_id
attendance            → student_id, subject_id, date, status (present/absent/late)
marks                 → mid1_exam, mid1_assign, mid2_exam, mid2_assign, external
lab_marks             → internal_viva, observation_record, lab_performance, external_viva, external_record, lab_exam
elective_registrations → student_id, subject_id, slot, semester
elective_deadlines    → slot, deadline
```

**Grade Calculation:**
```
Mid1 = mid1_exam(/30) + mid1_assign(/10)  → /40
Mid2 = mid2_exam(/30) + mid2_assign(/10)  → /40
Internal = (Mid1 + Mid2) / 2              → /40
Total = Internal + External(/60)          → /100
Grade: ≥90=O, ≥75=A+, ≥60=A, ≥50=B+, ≥40=B, <40=F
```

---

## ✦ How the Real-Time Works

```
Faculty marks attendance
        ↓
FastAPI writes to Supabase PostgreSQL
        ↓
Supabase Realtime broadcasts row change via WebSocket
        ↓
Student dashboard receives event → React state updates
        ↓
UI reflects new attendance % — no refresh needed
```

---

## ✦ Getting Started

### Frontend

```bash
git clone https://github.com/Vishalsomaraju/edutrack-frontend.git
cd edutrack-frontend/frontend
npm install
cp .env.example .env.local
# Add VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
npm run dev
```

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env
# Add SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_JWT_SECRET
uvicorn main:app --reload --port 8000
```

### Environment Variables

**Frontend `.env.local`:**
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=http://localhost:8000
```

**Backend `.env`:**
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...
SUPABASE_JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:5173
```

---

## ✦ Project Structure

```
frontend/src/
├── components/
│   ├── ui/           → Button, Card, Badge, Input, Table, Skeleton, EmptyState
│   ├── admin/        → AddUserModal, DeleteConfirmModal, SessionPasswordBanner
│   ├── layout/       → TopNav, AppShell, ProtectedRoute
│   ├── dashboard/    → StatCard, AttendanceRing, QuickMarkAttendance, AtRiskTable...
│   ├── attendance/   → AttendanceMarker, AttendanceSummary, AttendanceCalendar
│   ├── marks/        → MarksEntry, MarksTable, StudentMarksCard
│   └── analytics/    → SubjectComparisonChart, AttendanceHeatmap, MarksDistributionChart
├── hooks/            → useAuth, useAttendance, useMarks, useAnalytics, useTheme
├── pages/            → Login, Dashboard, Attendance, Marks, Courses, Analytics, Profile
│                       Students (admin), Faculty (admin), Subjects (admin)
├── lib/              → api.js (TTL cache + dedup), supabase.js, csvExport.js
├── stores/           → authStore.js (Zustand)
└── styles/           → tokens.css (full design system), globals.css

backend/app/
├── auth/             → JWT (ES256/JWKS), profile management, avatar upload
├── attendance/       → mark, edit, summaries, at-risk threshold logic
├── marks/            → theory marks with computed grades
├── lab_marks/        → lab marks with computed grades
├── courses/          → subjects, elective registration, deadlines, syllabus
├── analytics/        → trend, grade distribution, at-risk, subject comparison
├── admin/            → user creation, deletion, faculty assignment, deadlines
├── subjects/         → subject CRUD, enrolled students
├── students/         → student listing
└── faculty/          → faculty listing
```

---

## ✦ Who Built This

| Name | Role |
|---|---|
| Vishal Somaraju (24RA1A05AO) | Frontend — React, UI/UX, Design System, Integration |
| Naga Sai Hitesh Bandaru (24RA1A05Z9) | Backend — FastAPI, PostgreSQL, REST API |
| Kandari Vasudepika (24RA1A05Z5) | Research, Documentation, Testing |

**Guide:** [Guide Name] · Dept. of CSE, KPRIT

---

## ✦ Implementation Status

### ✅ Completed
- [x] Full authentication system (ES256 JWT, JWKS verification)
- [x] Role-based routing and protected routes
- [x] Real-time attendance marking with Supabase Realtime
- [x] Complete marks system — theory (Mid1, Mid2, External) + lab
- [x] Auto grade calculation for all assessment types
- [x] Full R22 B.Tech CSE syllabus (8 semesters, 80+ subjects)
- [x] Elective registration with slot deadlines
- [x] Analytics — trends, grade distribution, at-risk, subject comparison
- [x] Admin panel — add/delete students & faculty, assign subjects
- [x] Profile management with avatar upload
- [x] CSV export (faculty class report + student personal report)
- [x] Light/dark theme system
- [x] Syllabus upload and viewer (faculty)
- [x] Attendance calendar heatmap (student)

### 🔄 In Progress / Planned
- [ ] 3D landing page (Three.js + GSAP book scene)
- [ ] AI-based performance prediction
- [ ] Push notifications for at-risk alerts
- [ ] Mobile app (React Native)
- [ ] Timetable management module

---

<div align="center">

*Built at KPRIT · CSE Department · Real-Time Research Project 2025–26*

</div>
