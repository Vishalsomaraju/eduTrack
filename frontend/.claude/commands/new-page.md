# /new-page

You are the UI Builder for EduTrack. Read CLAUDE.md fully before proceeding.

## Your Job

Scaffold a complete page for EduTrack — with layout shell, sections, and data wiring stubs.

## Step 1 — Gather Info

Ask all at once:

1. Page name? (e.g. Attendance, Analytics, Marks)
2. Which role(s) can access this page? (admin / faculty / student / multiple)
3. What is the main purpose of this page in one sentence?
4. What data does it need to display?
5. Does it have any real-time elements?

## Step 2 — Page Architecture

Every EduTrack page follows this structure:

```jsx
// pages/PageName.jsx

import PageShell from "@/components/layout/PageShell";
import { useAuth } from "@/hooks/useAuth";

export default function PageName() {
  const { user, role } = useAuth();

  return (
    <PageShell title="Page Title">
      {/* Top stats row */}
      {/* Main content area */}
      {/* Secondary panels */}
    </PageShell>
  );
}
```

## Step 3 — Layout Rules

### Page grid pattern:

```jsx
<div className="space-y-6">
  {/* Stat cards row — always first */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {/* StatCard components */}
  </div>

  {/* Main content — two column on large screens */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2">{/* Primary panel */}</div>
    <div>{/* Secondary panel */}</div>
  </div>
</div>
```

### Role-based rendering:

```jsx
// Show content conditionally by role
{
  role === "faculty" && <AttendanceMarkingPanel />;
}
{
  role === "student" && <AttendanceViewPanel />;
}
{
  role === "admin" && <SystemOverviewPanel />;
}
```

### Route protection:

Every page must check role access at the top:

```jsx
const { role } = useAuth();
if (!["faculty", "admin"].includes(role)) {
  return <Navigate to="/dashboard" />;
}
```

## Step 4 — Data Wiring Stubs

For each piece of data the page needs, create a TODO comment:

```jsx
// TODO: wire up with useAttendance() hook
// Expected shape: [{ id, student_id, status, date }]
const attendance = [];
```

This keeps the page renderable before hooks are built.

## Step 5 — Output

Provide:

1. Complete page file with full JSX structure
2. File path: `src/pages/PageName.jsx`
3. The route to add in App.jsx (with role guard)
4. List of hooks this page will eventually need
5. List of components this page uses (mark which ones don't exist yet)

## Page-Specific Templates

### Dashboard page sections by role:

**Admin:** SystemStats → UserManagement → ActivityFeed
**Faculty:** TodayClasses → AttendanceMarking → ClassPerformance
**Student:** MyAttendance → MyMarks → SubjectList

### Attendance page sections:

**Faculty view:** SubjectSelector → StudentRoster (with live marking) → ClassStats (real-time)
**Student view:** AttendanceBySubject (read-only) → AttendanceTrend chart

### Analytics page sections:

**Admin/Faculty:** AttendanceTrend → GradeDistribution → AtRiskStudents → SubjectComparison

## Hard Stops

- Never build a page without the PageShell wrapper
- Never skip the role check
- Never put Supabase queries directly in the page — use hooks or leave TODOs
