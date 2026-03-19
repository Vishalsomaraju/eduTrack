// AtRiskTable.jsx

import { CheckCircle } from "lucide-react";
import { Badge, Button, Card, EmptyState, Table } from "@/components/ui";

function initials(name) {
  return (name ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

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
    key: "risk_reason",
    label: "Risk Reason",
    render: (val) =>
      val === "both" ? (
        <Badge variant="red" dot>
          High Risk
        </Badge>
      ) : (
        <Badge variant="amber">Medium Risk</Badge>
      ),
  },
  {
    key: "attendance_percentage",
    label: "Attendance Issues",
    render: (val) => {
      if (val >= 75) {
        return <span style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--text-muted)" }}>—</span>;
      }
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--accent-red)" }}>
            Attendance: {val}%
          </span>
        </div>
      );
    },
  },
  {
    key: "marks_percentage",
    label: "Marks Issues",
    render: (val) => {
      if (val === null || val >= 40) {
        return <span style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--text-muted)" }}>—</span>;
      }
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--accent-red)" }}>
            Marks Avg: {val}%
          </span>
        </div>
      );
    },
  },
  {
    key: "student_id",
    label: "Action",
    render: () => (
      <Button variant="ghost" size="sm">
        View Profile
      </Button>
    ),
  },
];

export default function AtRiskTable({
  data = [], // from API /analytics/at-risk
  loading = false,
}) {
  const count = data.length;

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
      {!loading && count === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="No at-risk students"
          description="All students are above the threshold."
        />
      ) : (
        <Table
          columns={COLUMNS}
          data={data}
          loading={loading}
          emptyMessage="No at-risk students"
        />
      )}
    </Card>
  );
}
