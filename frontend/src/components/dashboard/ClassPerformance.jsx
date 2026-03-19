// ClassPerformance.jsx — Grade distribution bar chart for a subject.
// Uses Recharts. Driven by selectedSubject in FacultyDashboard.
//
// Props:
//   subjectId   — string
//   subjectName — string

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Badge, Card } from "@/components/ui";
import { computeGrade, computePercentage, useMarks } from "@/hooks/useMarks";

const GRADE_ORDER = ["O", "A+", "A", "B+", "B", "F"];

const GRADE_COLORS = {
  O: "var(--accent-green)",
  "A+": "var(--accent-green)",
  A: "var(--accent-blue)",
  "B+": "var(--accent-blue)",
  B: "var(--accent-amber)",
  F: "var(--accent-red)",
};

// ── Shimmer skeleton bars ───────────────────────────────────────────────────
function SkeletonBars() {
  const heights = [60, 140, 100, 120, 80, 40];
  return (
    <div
      className="w-full h-45 sm:h-60"
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 12,
        padding: "0 8px",
      }}
    >
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: h,
            borderRadius: 4,
            background:
              "linear-gradient(90deg, var(--bg-elevated) 0%, rgba(255,255,255,0.04) 50%, var(--bg-elevated) 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Custom tooltip ──────────────────────────────────────────────────────────
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
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
      {payload[0].value} student{payload[0].value !== 1 ? "s" : ""}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function ClassPerformance({ subjectId, subjectName }) {
  const { fetchMarks } = useMarks();
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!subjectId) return;
    setLoading(true);
    fetchMarks(subjectId).then(({ data }) => {
      setMarks(data ?? []);
      setLoading(false);
    });
  }, [subjectId]);

  // Pivot marks by student → compute combined % → grade bucket count
  const chartData = useMemo(() => {
    const studentMap = {};
    for (const m of marks) {
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

    return GRADE_ORDER.map((grade) => ({ grade, count: buckets[grade] }));
  }, [marks]);

  const hasData = chartData.some((d) => d.count > 0);

  return (
    <Card
      title="Grade Distribution"
      action={
        subjectName ? (
          <Badge variant="blue" size="sm">
            {subjectName}
          </Badge>
        ) : undefined
      }
    >
      {loading ? (
        <SkeletonBars />
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
          No marks entered yet
        </div>
      ) : (
        <div className="w-full h-45 sm:h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={36} barCategoryGap="30%">
              <XAxis
                dataKey="grade"
                tick={{
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                  fill: "var(--text-muted)",
                }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                content={<CustomTooltip />}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.grade} fill={GRADE_COLORS[entry.grade]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
