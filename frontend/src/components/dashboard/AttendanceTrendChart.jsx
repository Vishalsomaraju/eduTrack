// AttendanceTrendChart.jsx — Institution-wide daily attendance trend (last 30 days).
// Uses Recharts LineChart. CSS custom properties are read via getComputedStyle
// so colors adapt correctly between light and dark themes.
//
// Props:
//   data    — [{ date: '2025-03-01', percentage: 87 }, ...]
//   loading — bool

import {
  CartesianGrid,
  LineChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui";

// ── Shimmer skeleton ─────────────────────────────────────────────────────────

function TrendSkeleton() {
  return (
    <div
      className="w-full h-45 sm:h-60"
      style={{
        borderRadius: 8,
        background:
          "linear-gradient(90deg, var(--bg-elevated) 0%, rgba(255,255,255,0.04) 50%, var(--bg-elevated) 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

// ── Custom tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  // Format label: "2025-03-01" → "Mar 01"
  let formattedDate = label;
  try {
    formattedDate = new Date(label + "T00:00:00").toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  } catch {
    /* keep raw label */
  }

  return (
    <div
      style={{
        background: "var(--bg-overlay)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "8px 12px",
        fontFamily: "var(--font-body)",
        fontSize: "0.8rem",
        color: "var(--text-primary)",
      }}
    >
      <div style={{ color: "var(--text-muted)", marginBottom: 2 }}>
        {formattedDate}
      </div>
      <div style={{ fontWeight: 600 }}>{payload[0].value}% Attendance</div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function AttendanceTrendChart({ data = [], loading = false }) {
  // Read CSS variable values at render time for use as SVG attribute strings
  const style = getComputedStyle(document.documentElement);
  const accentColor = style.getPropertyValue("--accent").trim();
  const accentRedColor = style.getPropertyValue("--accent-red").trim();
  const borderColor = style.getPropertyValue("--border").trim();
  const textMutedColor = style.getPropertyValue("--text-muted").trim();

  return (
    <Card
      title="Attendance Trend"
      action={
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
          }}
        >
          Last 30 days
        </span>
      }
    >
      {loading ? (
        <TrendSkeleton />
      ) : data.length === 0 ? (
        <div
          className="w-full h-45 sm:h-60"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            color: "var(--text-muted)",
            fontStyle: "italic",
          }}
        >
          No attendance data in the last 30 days
        </div>
      ) : (
        <div className="w-full h-45 sm:h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={borderColor}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => d.split("-")[2]}
                tick={{
                  fontFamily: "var(--font-body)",
                  fontSize: 11,
                  fill: textMutedColor,
                }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => v + "%"}
                tick={{
                  fontFamily: "var(--font-body)",
                  fontSize: 11,
                  fill: textMutedColor,
                }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: borderColor, strokeWidth: 1 }}
              />
              <ReferenceLine
                y={75}
                stroke={accentRedColor}
                strokeDasharray="4 4"
                label={{
                  value: "75% min",
                  position: "insideTopRight",
                  fontSize: 11,
                  fill: accentRedColor,
                  fontFamily: "var(--font-body)",
                }}
              />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke={accentColor}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
