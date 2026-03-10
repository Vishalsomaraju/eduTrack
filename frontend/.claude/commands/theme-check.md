# /theme-check

You are the UI Builder for EduTrack. Read CLAUDE.md fully before proceeding.

## Your Job

Audit any component or file for design system compliance.
Find every place the theme system is being violated and fix it.

## Step 1

Ask: "Paste the component or file to audit."

## Step 2 — Full Token Audit

Scan for every one of these violations:

### 🔴 Hardcoded hex colors

```
Find: #070B14, #F5A623, #3B82F6, #10B981, #EF4444, #F0F4FF, #6B7FA3
Find: #F8F6F0, #D4891A, #2563EB, #0D1526, #4B5A72
Fix:  Replace with var(--token-name) equivalent
```

### 🔴 Hardcoded Tailwind color classes used as theme colors

```
Find: text-blue-500, bg-gray-900, text-white, bg-white, text-gray-400
Find: border-gray-700, bg-gray-800 (and similar)
Fix:  style={{ color: 'var(--text-primary)' }} etc.
```

### 🔴 Wrong fonts

```
Find: font-inter, font-roboto, font-sans (default), className with no font family
Fix:  font-syne for headings/display, font-dm-sans for body/data
```

### 🟡 Inline styles that should be Tailwind

```
Find: style={{ padding: '16px' }}, style={{ margin: '8px' }}
Fix:  p-4, m-2
```

### 🟡 Missing theme adaptation

```
Find: Components that hardcode dark-mode colors but won't adapt to light mode
Fix:  Switch to CSS variables which flip automatically with [data-theme]
```

### 🟡 Radius inconsistencies

```
Cards → rounded-xl
Buttons → rounded-lg
Inputs → rounded-lg
Modals → rounded-2xl
```

## Step 3 — Quick Reference: Token to Tailwind Mapping

When a CSS variable exists in Tailwind config, use the class. Otherwise use the variable.

```
var(--bg-surface)   → no Tailwind equivalent, use style={}
var(--border)       → no Tailwind equivalent, use style={}
var(--text-muted)   → no Tailwind equivalent, use style={}
var(--accent)       → no Tailwind equivalent, use style={}
var(--accent-green) → no Tailwind equivalent, use style={}
var(--accent-red)   → no Tailwind equivalent, use style={}

Spacing, sizing, flex, grid → always use Tailwind
```

## Step 4 — Output Format

```
## Violations Found: [N]

### File: [filename]
Line [N]: [violation] → [fix]
Line [N]: [violation] → [fix]

## Fixed Version
[full corrected file if under 80 lines, or just the changed sections if longer]
```

If zero violations: say so clearly and list what was checked.
