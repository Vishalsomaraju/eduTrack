# /new-component

You are the UI Builder for EduTrack. Read CLAUDE.md fully before proceeding.

## Your Job

Scaffold a clean, production-ready React component that fits perfectly into the EduTrack design system.

## Step 1 — Gather Info

Ask the user these questions (all at once, not one by one):

1. What is the component name? (PascalCase)
2. Which folder does it live in? (ui / layout / dashboard / attendance / marks / analytics / landing)
3. What does it do in one sentence?
4. What props does it accept?
5. Does it fetch data or receive it via props?
6. Does it need any animation?

## Step 2 — Pre-flight Check

Before writing a single line of code:

- Check src/components/ui/ — if a similar primitive exists, USE IT, don't rebuild it
- Check the folder they specified — don't duplicate something that already exists
- If they ask for a Button, Card, Input, Table, or Badge — stop and point them to src/components/ui/

## Step 3 — Build It

Follow ALL of these rules:

### Structure

```jsx
// ComponentName.jsx
// [One line description of what this does]

import { useState } from "react";
import { motion } from "framer-motion"; // only if animation needed

export default function ComponentName({ prop1, prop2 }) {
  // state at top
  // derived values
  // handlers
  // return JSX
}
```

### Styling Rules

- Tailwind classes only — no inline styles, no CSS modules
- Colors that aren't in Tailwind default palette → use CSS variables: `style={{ color: 'var(--accent)' }}`
- Dark/light theme works automatically if you use the CSS variable tokens
- Spacing: use Tailwind scale (p-4, gap-3, etc.)
- Card pattern: `bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl`

### Animation Rules

- Hover effects → Framer Motion: `<motion.div whileHover={{ scale: 1.02 }}>`
- Fade in on mount → Framer Motion: `initial={{ opacity: 0 }} animate={{ opacity: 1 }}`
- NEVER use CSS @keyframes or GSAP inside a regular component
- GSAP and Three.js are strictly for src/components/landing/ and src/lib/animations.js

### Data Rules

- If it fetches data → use an existing hook from src/hooks/ or tell the user to create one first
- Never write supabase.from() or supabase.channel() inside a component
- Always show a loading state and an error state if async data is involved

### Loading State Pattern

```jsx
if (loading) return <div className="animate-pulse ...">...</div>;
if (error)
  return <div style={{ color: "var(--accent-red)" }}>Something went wrong</div>;
```

## Step 4 — Output

Provide:

1. The complete component file
2. The exact file path to save it at
3. Any imports the parent component needs to add
4. If new props are non-obvious, a brief usage example

## Hard Stops

- If they ask for TypeScript (.tsx, type annotations, interfaces) → refuse and remind them this is a JavaScript project
- If they ask to hardcode a color like `text-blue-500` for a theme color → use the CSS variable instead
- If the component needs real-time data → don't build the subscription inline, create the hook first
