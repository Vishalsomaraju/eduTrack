# CLAUDE.local.md — Personal Machine Config

# THIS FILE IS GITIGNORED. Never commit this. It's yours only.

# Add this to .gitignore: CLAUDE.local.md

---

## 🖥️ My Local Environment

```
Node version:     [fill in — e.g. 20.11.0]
Package manager:  [npm / pnpm / bun — pick one and stick to it]
OS:               [e.g. macOS 14 / Windows 11 / Ubuntu 22]
Editor:           [VS Code / Cursor / Neovim]
Claude Code:      [version — run `claude --version`]
```

---

## 🔑 Environment Variables (Local)

> Never paste actual keys here — just names so you remember what's needed.
> Real keys go in `.env.local` which is also gitignored.

```
VITE_SUPABASE_URL=           # Your Supabase project URL
VITE_SUPABASE_ANON_KEY=      # Your Supabase anon/public key
VITE_APP_ENV=development
```

Backend `.env` (tell your teammate to set these on their machine):

```
DATABASE_URL=                # Supabase direct connection string
SUPABASE_SERVICE_KEY=        # Service role key (backend only, never frontend)
JWT_SECRET=                  # Must match Supabase JWT secret
```

---

## 🧪 My Active Experiments

> Use this section to track things you're trying that aren't in the main CLAUDE.md yet.
> If an experiment works, graduate it to CLAUDE.md. If it fails, delete it here.

### Experiment Log:

```
[Date] — [What you tried] — [Result: works / failed / in progress]
```

---

## 🐛 Known Issues on My Machine

> Document weird local bugs here so Claude Code doesn't keep trying to "fix" them.

```
- Example: Three.js hot reload breaks canvas on Vite — full refresh needed
- Example: Supabase realtime drops connection after 5min in dev — normal, reconnects
```

---

## 📋 My Personal Workflow Preferences

Tell Claude Code how YOU like to work:

```
- I prefer smaller, focused commits over large ones
- Show me the diff before applying large refactors
- When I say "quick fix" I mean < 10 lines changed
- When I say "build this out" I mean full implementation with types + error states
- I want console.log statements removed before any PR
- I prefer named exports for hooks, default exports for components
```

---

## 🤖 My Active Claude Code Sessions

> Track which session is doing what so you don't confuse agents.

```
Session 1 (main terminal):     UI Builder — components, pages, layout
Session 2 (second terminal):   Animation Specialist — Three.js, GSAP, BookScene only
Session 3 (third terminal):    API Integration — Supabase hooks, FastAPI wiring
```

### Session startup prompts (copy-paste these when starting each session):

**Session 1 — UI Builder:**

```
Read CLAUDE.md fully. You are the UI Builder agent for EduTrack.
Your scope: src/components/, src/pages/, src/styles/
Do not touch: src/components/landing/BookScene.tsx, src/lib/animations.ts
When building components, always check src/components/ui/ first.
Current task: [fill in before starting]
```

**Session 2 — Animation Specialist:**

```
Read CLAUDE.md fully. You are the Animation Specialist for EduTrack.
Your scope: src/components/landing/, src/lib/animations.js ONLY.
Three.js version is r134. GSAP version is 3.x with ScrollTrigger + CustomEase.
Lenis is the scroll library. Never import anything from Framer Motion.
Do not touch React state or business logic. Visuals only.
Current task: [fill in before starting]
```

**Session 3 — API Integration:**

```
Read CLAUDE.md fully. You are the API Integration agent for EduTrack.
Your scope: src/hooks/, src/lib/supabase.ts, src/stores/
All real-time subscriptions follow the pattern in CLAUDE.md exactly.
Never write supabase.channel() inline in a component — hooks only.
Current task: [fill in before starting]
```

---

## 📌 Quick Reference — Commands I Always Forget

```bash
# Start dev server
npm run dev

# Type check without building
npx tsc --noEmit

# Check what's listening on a port (when dev server won't start)
lsof -i :5173

# Kill port if stuck
kill -9 $(lsof -t -i:5173)

# Supabase local studio (if using local dev)
npx supabase studio

# Generate Supabase types (skip — using JS, not TS)

# Clear Vite cache when things break
rm -rf node_modules/.vite && npm run dev
```

---

## 🔗 Project Links (fill these in as you set things up)

```
GitHub repo:          https://github.com/[your-username]/edutrack-frontend
Supabase dashboard:   https://supabase.com/dashboard/project/[your-project-id]
Vercel dashboard:     https://vercel.com/[your-team]/edutrack
Figma file:           [link if you have one]
Backend repo:         https://github.com/[teammate]/edutrack-backend
API docs (local):     http://localhost:8000/docs   ← FastAPI auto-generates this
```

---

## 📝 Notes to Future Me

> Freeform. Write anything you want to remember between sessions.
> Claude Code reads this, so you can also write notes FOR it.

```
[Your notes here]
```
