// AtRiskTable.jsx — Institution-wide at-risk student table for admin dashboard.
// At risk = attendance < 75% in any subject OR any mark < 40% of max score.
//
// Props:
//   attendanceSummaries — { [subjectId]: { name, students: summaryArray, avg } }
//   allMarks            — flat array of all mark records, each enriched with subjectName
//   students            — [{ id, name, email }]
//   loading             — bool

import { useMemo } from "react";
import { CheckCircle } from "lucide-react";
import { Badge, Button, Card, Table } from "@/components/ui";

// ── Avatar initials helper ───────────────────────────────────────────────────

function initials(name) {
  return (name ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// ── Table column definitions ─────────────────────────────────────────────────

const COLUMNS = [
  {
    key: "name",
    label: "Student",
    render: (val, row) => (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--accent-subtle)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "0.6rem",
            color: "var(--accent)",
            flexShrink: 0,
          }}
        >
          {initials(val)}
        </div>
        <div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: "0.875rem",
              color: "var(--text-primary)",
            }}
          >
            {val}
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
            }}
          >
            {row.email}
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "riskLevel",
    label: "Risk Level",
    render: (val) =>
      val === "high" ? (
        <Badge variant="red" dot>
          High Risk
        </Badge>
      ) : (
        <Badge variant="amber">Medium Risk</Badge>
      ),
  },
  {
    key: "attendanceIssues",
    label: "Attendance Issues",
    render: (issues) => {
      if (!issues || issues.length === 0) {
        return (
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
            }}
          >
            —
          </span>
        );
      }
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {issues.map((issue, i) => (
            <span
              key={i}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                color: "var(--accent-red)",
              }}
            >
              {issue.subjectName}: {issue.percentage}%
            </span>
          ))}
        </div>
      );
    },
  },
  {
    key: "marksIssues",
    label: "Marks Issues",
    render: (issues) => {
      if (!issues || issues.length === 0) {
        return (
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
            }}
          >
            —
          </span>
        );
      }
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {issues.map((issue, i) => (
            <span
              key={i}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                color: "var(--accent-red)",
              }}
            >
              {issue.subjectName} ({issue.type}): {issue.score}/{issue.maxScore}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    key: "id",
    label: "Action",
    render: () => (
      <Button variant="ghost" size="sm">
        View Profile
      </Button>
    ),
  },
];

// ── Main component ───────────────────────────────────────────────────────────

export default function AtRiskTable({
  attendanceSummaries = {},
  allMarks = [],
  students = [],
  loading = false,
}) {
  // Derive at-risk student records
  const atRiskRows = useMemo(() => {
    // Collect all at-risk student IDs from attendance and marks
    const atRiskIds = new Set();

    Object.values(attendanceSummaries).forEach(({ students: sums = [] }) => {
      sums.filter((s) => s.atRisk).forEach((s) => atRiskIds.add(s.id));
    });

    allMarks.forEach((m) => {
      if (m.max_score > 0 && m.score / m.max_score < 0.4) {
        atRiskIds.add(m.student_id);
      }
    });

    // Build full row entries for each at-risk student
    return students
      .filter((s) => atRiskIds.has(s.id))
      .map((student) => {
        // Attendance issues for this student across all subjects
        const attendanceIssues = [];
        Object.values(attendanceSummaries).forEach(
          ({ name: subjectName, students: sums = [] }) => {
            const entry = sums.find((s) => s.id === student.id);
            if (entry && entry.atRisk) {
              attendanceIssues.push({
                subjectName,
                percentage: entry.percentage,
              });
            }
          },
        );

        // Marks issues for this student
        const marksIssues = allMarks
          .filter(
            (m) =>
              m.student_id === student.id &&
              m.max_score > 0 &&
              m.score / m.max_score < 0.4,
          )
          .map((m) => ({
            subjectName: m.subjectName ?? "—",
            type: m.type,
            score: m.score,
            maxScore: m.max_score,
          }));

        // High risk: attendance < 60% in any subject OR mark < 25% of max score
        const isHigh =
          attendanceIssues.some((a) => a.percentage < 60) ||
          allMarks.some(
            (m) =>
              m.student_id === student.id &&
              m.max_score > 0 &&
              m.score / m.max_score < 0.25,
          );

        return {
          id: student.id,
          name: student.name,
          email: student.email,
          riskLevel: isHigh ? "high" : "medium",
          attendanceIssues,
          marksIssues,
        };
      })
      .sort((a, b) => {
        // High risk first
        if (a.riskLevel === "high" && b.riskLevel !== "high") return -1;
        if (b.riskLevel === "high" && a.riskLevel !== "high") return 1;
        return a.name.localeCompare(b.name);
      });
  }, [attendanceSummaries, allMarks, students]);

  const count = atRiskRows.length;

  return (
    <Card
      title="At-Risk Students"
      action={
        count > 0 ? (
          <Badge variant="red" dot>
            {count} student{count !== 1 ? "s" : ""}
          </Badge>
        ) : (
          <Badge variant="green">All Clear</Badge>
        )
      }
    >
      {/* Empty state — no at-risk students */}
      {!loading && count === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 0",
            gap: 10,
          }}
        >
          <CheckCircle
            size={40}
            style={{ color: "var(--accent-green)", opacity: 0.8 }}
          />
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              color: "var(--text-muted)",
              textAlign: "center",
            }}
          >
            All students are on track
          </span>
        </div>
      ) : (
        <Table
          columns={COLUMNS}
          data={atRiskRows}
          loading={loading}
          emptyMessage="No at-risk students"
        />
      )}
    </Card>
  );
}
