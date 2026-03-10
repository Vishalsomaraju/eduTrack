# /new-widget

You are the UI Builder for EduTrack. Read CLAUDE.md fully before proceeding.

## Your Job

Build a self-contained dashboard widget — the stat cards, chart panels, tables,
and live indicators that make up the EduTrack dashboards.

## Step 1 — Gather Info

Ask all at once:

1. Widget name?
2. Which dashboard is it for? (admin / faculty / student)
3. What does it show? (number, chart, table, list, live indicator)
4. What data does it need?
5. Does it update in real-time?
6. What size? (small stat card / medium panel / large full-width)

## Step 2 — Widget Size Templates

### Small — Stat Card

```jsx
// Shows a single metric with icon and trend indicator
export default function StatCard({
  label,
  value,
  trend,
  icon,
  color = "accent",
}) {
  return (
    <div
      className="rounded-xl p-5 border"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
        <span style={{ color: `var(--${color})` }}>{icon}</span>
      </div>

      <div
        className="text-3xl font-bold font-syne"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </div>

      {trend && (
        <div
          className="text-xs mt-1"
          style={{
            color: trend > 0 ? "var(--accent-green)" : "var(--accent-red)",
          }}
        >
          {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% from last week
        </div>
      )}
    </div>
  );
}
```

### Medium — Data Panel with Chart

```jsx
export default function AttendanceTrendPanel({ subjectId }) {
  // hook call at top
  // recharts component in body
  return (
    <div
      className="rounded-xl p-6 border"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
    >
      <h3
        className="font-syne font-semibold mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        Attendance Trend
      </h3>
      {/* Recharts component here */}
    </div>
  );
}
```

### Live Indicator (real-time only)

```jsx
// Pulsing dot that shows live data is active
function LiveBadge() {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ background: "var(--accent-green)" }}
        />
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ background: "var(--accent-green)" }}
        />
      </span>
      <span className="text-xs" style={{ color: "var(--accent-green)" }}>
        Live
      </span>
    </div>
  );
}
```

## Step 3 — Chart Configs (Recharts)

Always use these styles for Recharts to match the dark/light theme:

```jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// Tooltip style — must match theme
const tooltipStyle = {
  backgroundColor: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontFamily: 'DM Sans, sans-serif',
}

// Standard chart wrapper — always use this height
<ResponsiveContainer width="100%" height={200}>
  <LineChart data={data}>
    <XAxis dataKey="date"
      stroke="var(--text-muted)"
      tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
    <YAxis
      stroke="var(--text-muted)"
      tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
    <Tooltip contentStyle={tooltipStyle} />
    <Line
      type="monotone"
      dataKey="value"
      stroke="var(--accent)"
      strokeWidth={2}
      dot={false} />
  </LineChart>
</ResponsiveContainer>
```

## Step 4 — At-Risk Indicator Widget

Special widget for the risk detection feature:

```jsx
// Red badge shown when attendance < 75% or avg score < 40%
function AtRiskBadge({ attendancePct, avgScore }) {
  const isAtRisk = attendancePct < 75 || avgScore < 40;
  if (!isAtRisk) return null;

  return (
    <div
      className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
      style={{
        background: "rgba(239, 68, 68, 0.15)",
        color: "var(--accent-red)",
        border: "1px solid var(--accent-red)",
      }}
    >
      ⚠ At Risk
    </div>
  );
}
```

## Step 5 — Output

Provide:

1. Complete widget file
2. File path: `src/components/dashboard/WidgetName.jsx`
3. Usage example showing how the dashboard page imports and uses it
4. Any hooks it depends on (if not yet built, note it)
