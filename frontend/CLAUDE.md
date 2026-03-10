# EduTrack — Master Agent Context

# Read this entire file before doing anything. No exceptions.

---

## 🧠 What This Project Is

**EduTrack** is a real-time academic management platform for colleges.
Three user roles: Admin, Faculty, Student.
The defining feature: live attendance marking with instant dashboard updates.

**Stack:**

- Frontend: React 18 + JavaScript + Vite + Tailwind CSS
- Animation: Three.js (r134) + GSAP 3 + ScrollTrigger + Lenis
- UI Motion: Framer Motion
- Charts: Recharts
- Backend: FastAPI (Python) — handled by teammate
- Database: Supabase (PostgreSQL + Realtime)
- Auth: Supabase Auth + JWT
- Deploy: Vercel (frontend) + Render (backend)

---

## 🎨 Design System — Non-Negotiable

### Theme Tokens

All colors come from `src/styles/tokens.css`. NEVER hardcode a color value.
Use CSS variables everywhere: `var(--bg-base)`, `var(--accent)`, etc.

```
Dark theme  → [data-theme="dark"]  on <html>
Light theme → [data-theme="light"] on <html>
```

**Dark palette:**

- `--bg-base: #070B14`
- `--bg-surface: #0D1526`
- `--bg-elevated: #162035`
- `--accent: #F5A623` ← amber gold, primary CTA
- `--accent-blue: #3B82F6` ← charts, secondary actions
- `--accent-green: #10B981` ← good attendance, success states
- `--accent-red: #EF4444` ← alerts, at-risk students
- `--text-primary: #F0F4FF`
- `--text-muted: #6B7FA3`
- `--border: #1E2D4A`

**Light palette:**

- `--bg-base: #F8F6F0` ← warm parchment, NOT pure white
- `--bg-surface: #EDEAE2`
- `--bg-elevated: #E4E0D6`
- `--accent: #D4891A` ← amber darkened for light bg contrast
- `--accent-blue: #2563EB`
- `--accent-green: #059669`
- `--accent-red: #DC2626`
- `--text-primary: #0D1526`
- `--text-muted: #4B5A72`
- `--border: #C8C4BA`

### Typography

- **Display / Headings:** `Syne` (Google Fonts) — weights 400, 600, 700, 800
- **Body / Data / UI:** `DM Sans` (Google Fonts) — weights 300, 400, 500, 600
- NEVER use Inter, Roboto, Arial, or system-ui

### Spacing & Radius

- Base unit: 4px (Tailwind default)
- Card radius: `rounded-xl` (12px)
- Button radius: `rounded-lg` (8px)
- Input radius: `rounded-lg` (8px)
- Modal radius: `rounded-2xl` (16px)

---

## 📁 File Structure — Always Follow This

```
src/
├── components/
│   ├── ui/               ← Reusable primitives (Button, Card, Badge, Input, Table)
│   ├── layout/           ← Sidebar, Navbar, PageShell
│   ├── landing/          ← BookScene.jsx, LandingHero.jsx (Three.js lives HERE only)
│   ├── dashboard/        ← Role-specific dashboard widgets
│   ├── attendance/       ← Attendance marking + live view
│   ├── marks/            ← Marks upload + display
│   └── analytics/        ← Charts, heatmaps, risk indicators
├── pages/
│   ├── Landing.jsx
│   ├── Dashboard.jsx
│   ├── Attendance.jsx
│   ├── Marks.jsx
│   └── Analytics.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useRealtime.js    ← ALL Supabase real-time subscriptions live here
│   ├── useTheme.js
│   └── useAttendance.js
├── lib/
│   ├── supabase.js       ← Supabase client singleton
│   ├── animations.js     ← GSAP timeline configs and reusable tweens
│   └── utils.js
├── stores/
│   └── authStore.js      ← Zustand store for auth state
└── styles/
    ├── tokens.css        ← Design tokens (source of truth)
    └── globals.css       ← Tailwind base + font imports
```

---

## 🧩 Component Rules

### Before creating any new component:

1. Check `src/components/ui/` — if a primitive exists, USE IT
2. Check `src/components/dashboard/` — don't duplicate widgets
3. If creating new, follow the naming pattern: `PascalCase.tsx`

### Every component must:

- Use plain JavaScript — no TypeScript, no `.ts` files
- Use PropTypes for prop documentation if props are non-obvious (optional but encouraged)
- Have a default export
- Use Tailwind classes only (no inline styles, no CSS modules)
- Use `var(--token-name)` for any color not covered by Tailwind
- Be responsive: mobile-first, check at sm/md/lg breakpoints

### Animation rules in components:

- Simple hover/transition states → Framer Motion `motion.*` elements
- Page transitions → Framer Motion `AnimatePresence`
- Complex sequences, ScrollTrigger, Three.js → GSAP only, in `animations.ts` or `BookScene.tsx`
- NEVER mix Framer Motion and GSAP on the same element

### Real-time rules:

- ALL Supabase subscriptions go in `src/hooks/useRealtime.ts` or a dedicated hook
- NEVER write `supabase.channel()` inline inside a component
- Always unsubscribe in the cleanup function of `useEffect`

---

## 🗄️ Supabase Rules

Client is always imported from `src/lib/supabase.js`:

```js
import { supabase } from "@/lib/supabase";
```

### Core tables (confirmed schema):

```
profiles          → id, role (admin|faculty|student), name, email, avatar_url
subjects          → id, name, code, semester, faculty_id
enrollments       → id, student_id, subject_id
attendance        → id, student_id, subject_id, date, status (present|absent|late)
marks             → id, student_id, subject_id, type (internal|assignment), score, max_score
```

### Real-time subscription pattern (ALWAYS use this pattern):

```js
const channel = supabase
  .channel("unique-channel-name")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "attendance",
      filter: `subject_id=eq.${subjectId}`,
    },
    (payload) => {
      // handle change
    },
  )
  .subscribe();

// Cleanup:
return () => {
  supabase.removeChannel(channel);
};
```

---

## 🔐 Auth Rules

- Auth state lives in `src/stores/authStore.ts` (Zustand)
- Role is stored in `profiles` table, not in JWT metadata
- Protected routes check `authStore.role` — redirect to `/` if unauthorized
- Three roles: `admin` | `faculty` | `student`
- Session persists via Supabase Auth (handles refresh tokens automatically)

---

## 🎭 Animation — Book Landing Page

**This is the hero feature of the frontend. Handle with care.**

Files:

- `src/components/landing/BookScene.tsx` → Three.js scene, book mesh, mouse tracking
- `src/lib/animations.ts` → GSAP timelines for book open sequence
- `src/components/landing/LandingHero.tsx` → React wrapper, canvas mount, HTML overlay

Three.js version: **r134**
GSAP version: **3.x** with ScrollTrigger and CustomEase plugins
Lenis version: **latest** — smooth scroll, feeds scroll progress to GSAP ScrollTrigger

### Book scene rules:

- Mouse parallax: map `mousemove` to subtle book rotation (max ±15deg X, ±20deg Y)
- Scroll open: GSAP ScrollTrigger drives `bookOpenProgress` from 0 → 1
- At progress 1.0: login form HTML overlay becomes interactive (`pointer-events: all`)
- Theme change: update Three.js `AmbientLight` and `DirectionalLight` intensity
  - Dark: ambient 0.3, directional 1.2
  - Light: ambient 0.8, directional 0.6
- NEVER put business logic in BookScene.tsx — it only handles visuals

---

## ✅ Task Checklist (update this as project progresses)

### Month 1 — Foundation

- [ ] Vite + React + TS + Tailwind setup
- [ ] tokens.css with full light/dark system
- [ ] Supabase project created, schema migrated
- [ ] Auth system (login, role routing, protected routes)
- [ ] Sidebar + PageShell layout
- [ ] Basic UI primitives (Button, Card, Badge, Input, Table)

### Month 2 — Core Features

- [ ] Attendance CRUD (faculty side)
- [ ] Live attendance marking with Supabase Realtime
- [ ] Student dashboard (attendance %, marks view)
- [ ] Marks upload + display
- [ ] Real-time class stats panel

### Month 3 — Polish + Analytics

- [ ] Analytics page (Recharts: attendance trend, grade distribution)
- [ ] Risk detection logic (attendance < 75% OR avg score < 40%)
- [ ] Landing page 3D book (Three.js + GSAP)
- [ ] Light/dark theme toggle
- [ ] Deployment (Vercel + Render + Supabase)

---

## ⚠️ Hard Rules — Never Break These

1. **No TypeScript.** This is a JavaScript project. All files are `.js` or `.jsx`
2. **No inline styles.** Tailwind or CSS variables only.
3. **No new UI primitives** without checking if one already exists in `src/components/ui/`
4. **No Supabase calls in components.** Use hooks.
5. **No GSAP in non-animation files.** Animation logic stays in `animations.js` or `BookScene.jsx`
6. **No hardcoded colors.** Every color is a CSS variable or a Tailwind token.
7. **Always handle loading and error states** in components that fetch data.
8. **Commit messages follow:** `feat:`, `fix:`, `refactor:`, `style:`, `chore:`

---

## 👥 Team

- **Frontend (you):** React, Three.js, GSAP, Supabase client, UI/UX
- **Backend (teammate):** FastAPI, PostgreSQL schema, REST endpoints, business logic

### API contract rule:

Define endpoint shape in a shared `API_CONTRACT.md` before either side builds it.
Format: method, path, request body, response body, auth required Y/N.

---

## 🔄 Current Status

> Update this section every week

**Week:** 1
**Phase:** Setup & Planning
**In progress:** Nothing yet — project setup pending
**Blocked by:** Nothing
**Last updated:** [DATE]
