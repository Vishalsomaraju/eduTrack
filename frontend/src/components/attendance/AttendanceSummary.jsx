// AttendanceSummary.jsx — Per-student attendance summary table.
// Used by all three roles. studentId prop narrows to one student.

import { useState, useEffect } from "react";
import { useAttendance } from "@/hooks/useAttendance";
import { Card, Table, Badge } from "@/components/ui";

// ── Helpers ────────────────────────────────────────────────────

function getPercentageColor(pct) {
  if (pct >= 75) return "var(--accent-green)";
  if (pct >= 60) return "var(--accent-amber)";
  return "var(--accent-red)";
}

function StatusBadge({ percentage }) {
  if (percentage >= 75) return <Badge variant="green">Safe</Badge>;
  if (percentage >= 60) return <Badge variant="amber">Warning</Badge>;
  return (
    <Badge variant="red" dot>
      At Risk
    </Badge>
  );
}

function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ── Stat card ──────────────────────────────────────────────────

function StatCard({ label, value, valueColor }) {
  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        borderRadius: 12,
        padding: 16,
        border: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "0.65rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--text-muted)",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "1.75rem",
          color: valueColor ?? "var(--text-primary)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ── Table columns ──────────────────────────────────────────────

function buildColumns(showStudent) {
  const cols = [];

  if (showStudent) {
    cols.push({
      key: "name",
      label: "Student",
      render: (val) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
            {val ? initials(val) : "?"}
          </div>
          <span>{val}</span>
        </div>
      ),
    });
  }

  cols.push(
    {
      key: "present",
      label: "Present",
      render: (val) => (
        <span style={{ color: "var(--accent-green)" }}>{val}</span>
      ),
    },
    {
      key: "absent",
      label: "Absent",
      render: (val) => (
        <span style={{ color: "var(--accent-red)" }}>{val}</span>
      ),
    },
    {
      key: "late",
      label: "Late",
      render: (val) => (
        <span style={{ color: "var(--accent-amber)" }}>{val}</span>
      ),
    },
    {
      key: "percentage",
      label: "Percentage",
      render: (val) => (
        <span style={{ color: getPercentageColor(val), fontWeight: 600 }}>
          {val}%
        </span>
      ),
    },
    {
      key: "percentage",
      label: "Status",
      render: (val) => <StatusBadge percentage={val} />,
    },
  );

  return cols;
}

// ── Component ──────────────────────────────────────────────────

export default function AttendanceSummary({
  subjectId,
  studentId,
  subjectName,
}) {
  const { fetchAttendanceSummary } = useAttendance();
  const [data, setData] = useState([]);
  const [totalClasses, setTotalClasses] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!subjectId) return;
    setLoading(true);
    setFetchError(null);
    fetchAttendanceSummary(subjectId, studentId).then(
      ({ data: summary, totalClasses: total, error }) => {
        setLoading(false);
        if (error) {
          setFetchError("Failed to load attendance data.");
          return;
        }
        setData(summary ?? []);
        setTotalClasses(total ?? 0);
      },
    );
  }, [subjectId, studentId]);

  const avgAttendance =
    data.length > 0
      ? Math.round(data.reduce((sum, s) => sum + s.percentage, 0) / data.length)
      : 0;

  const atRiskCount = data.filter((s) => s.atRisk).length;

  // When viewing as a single student, no need for a Student column
  const showStudentCol = !studentId;
  const columns = buildColumns(showStudentCol);

  return (
    <Card
      title="Attendance Summary"
      action={
        subjectName ? (
          <Badge variant="blue" size="sm">
            {subjectName}
          </Badge>
        ) : undefined
      }
    >
      {/* ── Stats row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <StatCard label="Total Classes" value={loading ? "—" : totalClasses} />
        <StatCard
          label="Avg Attendance"
          value={loading ? "—" : `${avgAttendance}%`}
        />
        <StatCard
          label="At Risk"
          value={loading ? "—" : atRiskCount}
          valueColor={
            atRiskCount > 0 && !loading ? "var(--accent-red)" : undefined
          }
        />
      </div>

      {/* ── Error ── */}
      {fetchError && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "var(--accent-red-bg)",
            border: "1px solid var(--accent-red-border)",
            color: "var(--accent-red)",
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            marginBottom: 16,
          }}
        >
          {fetchError}
        </div>
      )}

      {/* ── Table ── */}
      <Table
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="No attendance records yet"
      />
    </Card>
  );
}
