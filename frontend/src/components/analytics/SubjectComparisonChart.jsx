// SubjectComparisonChart.jsx
import {
  BarChart,
  Bar,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui";

function ComparisonSkeleton() {
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

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const fullName = payload[0]?.payload?.fullName ?? "";
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
      {fullName && (
        <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>
          {fullName}
        </div>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.fill, fontWeight: 600 }}>
          {p.name}: {p.value}%
        </div>
      ))}
    </div>
  );
}

export default function SubjectComparisonChart({
  data: apiData = [], // Data from API
  loading = false,
}) {
  const style = getComputedStyle(document.documentElement);
  const accentColor = style.getPropertyValue("--accent").trim();
  const accentBlueColor = style.getPropertyValue("--accent-blue").trim();
  const accentRedColor = style.getPropertyValue("--accent-red").trim();
  const borderColor = style.getPropertyValue("--border").trim();
  const textMutedColor = style.getPropertyValue("--text-muted").trim();

  // Map API data back to expected recharts format
  const chartData = apiData.map((s) => ({
    name: s.subject_code,
    fullName: s.subject_name,
    Attendance: s.avg_attendance,
    Marks: s.avg_marks,
  }));

  const legend = (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: accentColor,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
          }}
        >
          Attendance
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: accentBlueColor,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
          }}
        >
          Marks Avg
        </span>
      </div>
    </div>
  );

  return (
    <Card title="Subject Comparison" action={legend}>
      {loading ? (
        <ComparisonSkeleton />
      ) : chartData.length === 0 ? (
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
          No subject data available
        </div>
      ) : (
        <div className="w-full h-45 sm:h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              barCategoryGap="30%"
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={borderColor}
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
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
                width={36}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <ReferenceLine
                y={75}
                stroke={accentRedColor}
                strokeDasharray="4 4"
              />
              <Bar
                dataKey="Attendance"
                fill={accentColor}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Marks"
                fill={accentBlueColor}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
