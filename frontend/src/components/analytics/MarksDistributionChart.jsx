// MarksDistributionChart.jsx — Pie/donut chart showing overall grade distribution
// across all subjects and students.
//
// Props:
//   marksData — flat array of all mark records
//   loading   — bool

import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Badge, Card } from "@/components/ui";
import { computeGrade, computePercentage } from "@/hooks/useMarks";

const GRADE_ORDER = ["O", "A+", "A", "B+", "B", "F"];

// ── Donut skeleton ────────────────────────────────────────────────────────────

function DonutSkeleton() {
  return (
    <div
      className="w-full h-45 sm:h-60"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ position: "relative", width: 180, height: 180 }}>
        {/* Outer ring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "linear-gradient(90deg, var(--bg-elevated) 0%, rgba(255,255,255,0.04) 50%, var(--bg-elevated) 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
          }}
        />
        {/* Inner cutout */}
        <div
          style={{
            position: "absolute",
            inset: 30,
            borderRadius: "50%",
            background: "var(--bg-surface)",
          }}
        />
      </div>
    </div>
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const total = entry.payload.total;
  const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
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
      <span style={{ fontWeight: 600 }}>{entry.name}</span>: {entry.value}{" "}
      student{entry.value !== 1 ? "s" : ""} ({pct}%)
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MarksDistributionChart({
  marksData = [],
  loading = false,
}) {
  const css = getComputedStyle(document.documentElement);
  const green = css.getPropertyValue("--accent-green").trim();
  const blue = css.getPropertyValue("--accent-blue").trim();
  const amber = css.getPropertyValue("--accent-amber").trim();
  const red = css.getPropertyValue("--accent-red").trim();

  // Derive grade distribution from flat marks array.
  // Pivot by student → compute avg combined% → grade bucket.
  const { chartData, uniqueStudents } = useMemo(() => {
    // Group by student
    const studentMap = {};
    for (const m of marksData) {
      if (!studentMap[m.student_id]) {
        studentMap[m.student_id] = { internal: null, assignment: null };
      }
      if (m.type === "internal") studentMap[m.student_id].internal = m;
      else if (m.type === "assignment") studentMap[m.student_id].assignment = m;
    }

    const buckets = { O: 0, "A+": 0, A: 0, "B+": 0, B: 0, F: 0 };
    Object.values(studentMap).forEach((s) => {
      const pcts = [];
      if (s.internal?.max_score > 0)
        pcts.push(computePercentage(s.internal.score, s.internal.max_score));
      if (s.assignment?.max_score > 0)
        pcts.push(
          computePercentage(s.assignment.score, s.assignment.max_score),
        );
      if (pcts.length === 0) return;
      const avg = Math.round(pcts.reduce((sum, p) => sum + p, 0) / pcts.length);
      buckets[computeGrade(avg)]++;
    });

    const total = Object.values(buckets).reduce((a, b) => a + b, 0);
    const data = GRADE_ORDER.filter((g) => buckets[g] > 0).map((g) => ({
      name: g,
      value: buckets[g],
      total,
    }));

    return { chartData: data, uniqueStudents: Object.keys(studentMap).length };
  }, [marksData]);

  const hasData = chartData.length > 0;

  // Grade color map for legend dots
  const GRADE_DOT_COLORS = {
    O: green,
    "A+": green,
    A: blue,
    "B+": blue,
    B: amber,
    F: red,
  };

  const GRADE_OPACITIES = { O: 1, "A+": 0.7, A: 1, "B+": 0.7, B: 1, F: 1 };

  // All grade buckets for legend (even zero-count)
  const allBuckets = useMemo(() => {
    const studentMap = {};
    for (const m of marksData) {
      if (!studentMap[m.student_id]) {
        studentMap[m.student_id] = { internal: null, assignment: null };
      }
      if (m.type === "internal") studentMap[m.student_id].internal = m;
      else if (m.type === "assignment") studentMap[m.student_id].assignment = m;
    }
    const buckets = { O: 0, "A+": 0, A: 0, "B+": 0, B: 0, F: 0 };
    Object.values(studentMap).forEach((s) => {
      const pcts = [];
      if (s.internal?.max_score > 0)
        pcts.push(computePercentage(s.internal.score, s.internal.max_score));
      if (s.assignment?.max_score > 0)
        pcts.push(
          computePercentage(s.assignment.score, s.assignment.max_score),
        );
      if (pcts.length === 0) return;
      const avg = Math.round(pcts.reduce((sum, p) => sum + p, 0) / pcts.length);
      buckets[computeGrade(avg)]++;
    });
    return buckets;
  }, [marksData]);

  return (
    <Card
      title="Grade Distribution"
      action={
        <Badge variant="default" size="sm">
          {uniqueStudents} student{uniqueStudents !== 1 ? "s" : ""}
        </Badge>
      }
    >
      {loading ? (
        <DonutSkeleton />
      ) : !hasData ? (
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
          No marks data yet
        </div>
      ) : (
        <>
          {/* Donut chart with absolute center label */}
          <div className="w-full h-45 sm:h-60" style={{ position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  startAngle={90}
                  endAngle={-270}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={GRADE_DOT_COLORS[entry.name]}
                      opacity={GRADE_OPACITIES[entry.name]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  color: "var(--text-primary)",
                  lineHeight: 1.1,
                }}
              >
                {uniqueStudents}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                students
              </div>
            </div>
          </div>

          {/* Legend — 2-column grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px 16px",
              marginTop: 8,
            }}
          >
            {GRADE_ORDER.map((grade) => (
              <div
                key={grade}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: GRADE_DOT_COLORS[grade],
                    opacity: GRADE_OPACITIES[grade],
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary, var(--text-muted))",
                  }}
                >
                  {grade}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    marginLeft: "auto",
                  }}
                >
                  {allBuckets[grade]}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
