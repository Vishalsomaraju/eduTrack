<div align="center">

<img src="https://img.shields.io/badge/Status-In_Development-F5A623?style=for-the-badge" />
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

*Built for KPRIT · Department of Computer Science & Engineering · RTRP 2024–25*

<br />

[**Live Demo**](#) · [**Report Bug**](#) · [**Documentation**](#)

</div>

---

## ✦ What is EduTrack?

EduTrack is a **real-time academic management platform** built for colleges that are tired of paper registers, scattered Excel sheets, and students who find out they failed attendance at the end of the semester.

It gives **admins, faculty, and students** a single, fast, beautiful place to manage and understand academic data — with the key difference that everything updates **live, as it happens.**

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

| Feature                     | What it does                                                         |
|-----------------------------|----------------------------------------------------------------------|
| 🔴 **Live Attendance**     | Faculty marks → dashboards update in real-time via Supabase Realtime |
| ⚠️ **Risk Detection**      | Auto-flags students below 75% attendance or 40% marks avg            |
| 📊 **Analytics Dashboard** | Trends, distributions, class averages — all live-updating charts     |
| 🎭 **3 Role System**       | Admin / Faculty / Student — each with scoped permissions             |
| 🌙 **Light + Dark Theme**  | Warm parchment light mode. Deep navy dark mode. Both gorgeous.       |
| 🔐 **Secure Auth**         | JWT + Supabase Auth with role-based route protection                 |

---

## ✦ Tech Stack

```
Frontend          →   React 19  ·  Vite  ·  Tailwind CSS  ·  Framer Motion
Animation         →   Three.js  ·  GSAP + ScrollTrigger  ·  Lenis
Charts            →   Recharts
Backend           →   FastAPI  (Python)
Database          →   Supabase  (PostgreSQL + Realtime)
Auth              →   Supabase Auth  ·  JWT
Deploy            →   Vercel (frontend)  ·  Render (backend)
```

---

## ✦ The Landing Page

The entry point isn't a boring login form.

It's a **3D book rendered in Three.js** — it floats, it follows your cursor, and as you scroll it opens up to reveal the login inside. Built with GSAP ScrollTrigger and Lenis smooth scroll.

Is it overkill for an academic system? Absolutely. That's the point.

---

## ✦ How the Real-Time Works

```
Faculty marks attendance
        ↓
Supabase writes to PostgreSQL
        ↓
Realtime broadcasts row change via WebSocket
        ↓
Student dashboard receives event → React state updates
        ↓
UI reflects new attendance % — no refresh needed
```

This same pipeline drives the live class stats panel, at-risk alerts, and analytics chart updates.

---

## ✦ Getting Started

```bash
# Clone the repo
git clone https://github.com/your-username/edutrack-frontend.git
cd edutrack-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# → Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Start dev server
npm run dev
```

> Backend setup lives in the [`edutrack-backend`](https://github.com/your-username/edutrack-backend) repo.

---

## ✦ Project Structure

```
src/
├── components/
│   ├── ui/           → Button, Card, Badge, Input, Table
│   ├── landing/      → BookScene.jsx (Three.js lives here only)
│   ├── dashboard/    → Role-specific widgets
│   └── attendance/   → Live marking + real-time view
├── hooks/
│   ├── useRealtime.js   → All Supabase subscriptions
│   └── useAttendance.js → Attendance data + live updates
├── pages/            → Landing, Dashboard, Attendance, Marks, Analytics
├── lib/
│   ├── supabase.js   → Supabase client
│   └── animations.js → GSAP timeline configs
└── styles/
    └── tokens.css    → Full light + dark design token system
```

---

## ✦ Who Built This

| Name   | Role                                    |
|--------|-----------------------------------------|
| Vishal | Frontend — React, Three.js, GSAP, UI/UX |
| Hitesh | Backend — FastAPI, PostgreSQL, REST API |

**Guide:** [Guide Name] · Dept. of CSE, KPRIT

---

## ✦ Roadmap

- [x] Project planning + architecture  
- [x] CLAUDE.md agent setup + custom commands  
- [ ] Auth system + role routing  
- [ ] Attendance module + real-time hooks  
- [ ] Marks management  
- [ ] Analytics dashboards  
- [ ] 3D landing page  
- [ ] Light/dark theme polish  
- [ ] Deployment  

---

<div align="center">

*Built at KPRIT · CSE Department · Real-Time Research Project 2024–25*

</div>
