// MarksTable.jsx — Read-only marks overview for faculty/admin.
// Shows stats summary row + sortable table. Supports Internal, Assignment, or Both view.

import { useEffect, useMemo, useState } from "react";
import { Badge, Card, Table } from "@/components/ui";
import {
  computeGrade,
  computePercentage,
  gradeBadgeVariant,
  percentageColor,
  useMarks,
} from "@/hooks/useMarks";

// ── Stats metric card ──────────────────────────────────────────────────────
function StatCard({ label, value, sub, valueColor }) {
  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        borderRadius: 12,
        padding: "16px",
        flex: "1 1 140px",
        minWidth: 120,
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
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            marginTop: 4,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

// ── Type toggle for the card action slot ───────────────────────────────────
function ActionToggle({ value, onChange }) {
  const options = [
    { key: "internal", label: "Internal" },
    { key: "assignment", label: "Assignment" },
    { key: "both", label: "Both" },
  ];
  return (
    <div style={{ display: "flex", gap: 0 }}>
      {options.map((o, i) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            style={{
              background: active
                ? "var(--accent-subtle)"
                : "var(--bg-elevated)",
              color: active ? "var(--accent)" : "var(--text-muted)",
              border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
              padding: "0 12px",
              height: 34,
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "0.75rem",
              cursor: "pointer",
              transition: "all 150ms ease",
              borderRadius:
                i === 0
                  ? "8px 0 0 8px"
                  : i === options.length - 1
                    ? "0 8px 8px 0"
                    : 0,
              marginLeft: i === 0 ? 0 : -1,
              position: "relative",
              zIndex: active ? 1 : 0,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Initials avatar (same pattern as MarksEntry) ───────────────────────────
function Avatar({ name }) {
  const initials = (name ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        background: "var(--accent-subtle)",
        border: "1px solid var(--accent)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "0.65rem",
        color: "var(--accent)",
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function MarksTable({ subjectId, type }) {
  const { fetchMarks } = useMarks();
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [displayType, setDisplayType] = useState(type ?? "both");

  useEffect(() => {
    if (!subjectId) return;
    setLoading(true);
    setError(null);
    fetchMarks(subjectId).then(({ data, error: err }) => {
      setLoading(false);
      if (err) {
        setError(err.message);
        return;
      }
      setMarks(data ?? []);
    });
  }, [subjectId]);

  // ── Pivot marks into per-student rows ─────────────────────────────────
  const tableData = useMemo(() => {
    if (displayType !== "both") {
      return marks
        .filter((m) => m.type === displayType)
        .map((m) => {
          const pct = computePercentage(m.score, m.max_score);
          const grade = computeGrade(pct);
          return {
            id: m.student_id,
            name: m.profiles?.name ?? "—",
            score: m.score,
            max_score: m.max_score,
            percentage: pct,
            grade,
            pass: pct >= 40,
          };
        });
    }

    // Build per-student pivot
    const map = {};
    for (const m of marks) {
      if (!map[m.student_id]) {
        map[m.student_id] = {
          id: m.student_id,
          name: m.profiles?.name ?? "—",
          internal: null,
          assignment: null,
        };
      }
      if (m.type === "internal") map[m.student_id].internal = m;
      else if (m.type === "assignment") map[m.student_id].assignment = m;
    }

    return Object.values(map).map((s) => {
      const iPct = s.internal
        ? computePercentage(s.internal.score, s.internal.max_score)
        : null;
      const aPct = s.assignment
        ? computePercentage(s.assignment.score, s.assignment.max_score)
        : null;

      const activePcts = [iPct, aPct].filter((p) => p != null);
      const totalPct =
        activePcts.length > 0
          ? Math.round(
              activePcts.reduce((sum, p) => sum + p, 0) / activePcts.length,
            )
          : 0;

      return {
        id: s.id,
        name: s.name,
        internal: s.internal,
        assignment: s.assignment,
        internalPct: iPct,
        assignmentPct: aPct,
        totalPct,
        grade: computeGrade(totalPct),
        pass: totalPct >= 40,
      };
    });
  }, [marks, displayType]);

  // ── Stats computation ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (tableData.length === 0) {
      return { avg: null, highest: null, lowest: null, atRisk: 0 };
    }

    const pcts = tableData.map((r) =>
      displayType === "both" ? r.totalPct : r.percentage,
    );
    const avg = Math.round(pcts.reduce((sum, p) => sum + p, 0) / pcts.length);

    const maxPct = Math.max(...pcts);
    const minPct = Math.min(...pcts);
    const maxIdx = pcts.indexOf(maxPct);
    const minIdx = pcts.indexOf(minPct);

    return {
      avg,
      highest: { pct: maxPct, name: tableData[maxIdx]?.name ?? "—" },
      lowest: { pct: minPct, name: tableData[minIdx]?.name ?? "—" },
      atRisk: pcts.filter((p) => p < 40).length,
    };
  }, [tableData, displayType]);

  // ── Column definitions ──────────────────────────────────────────────────
  const columns = useMemo(() => {
    const studentCol = {
      key: "name",
      label: "Student",
      render: (val) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar name={val} />
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: "0.875rem",
            }}
          >
            {val}
          </span>
        </div>
      ),
    };

    const gradeCol = {
      key: "grade",
      label: "Grade",
      render: (val) =>
        val ? (
          <Badge variant={gradeBadgeVariant(val)} size="sm">
            {val}
          </Badge>
        ) : (
          <span style={{ color: "var(--text-muted)" }}>—</span>
        ),
    };

    const statusCol = {
      key: "pass",
      label: "Status",
      render: (val) =>
        val ? (
          <Badge variant="green" size="sm">
            Pass
          </Badge>
        ) : (
          <Badge variant="red" dot size="sm">
            Fail
          </Badge>
        ),
    };

    if (displayType === "both") {
      return [
        studentCol,
        {
          key: "internal",
          label: "Internal",
          render: (val, row) => {
            if (!val)
              return <span style={{ color: "var(--text-muted)" }}>—</span>;
            return (
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: percentageColor(row.internalPct),
                }}
              >
                {val.score}/{val.max_score}
              </span>
            );
          },
        },
        {
          key: "assignment",
          label: "Assignment",
          render: (val, row) => {
            if (!val)
              return <span style={{ color: "var(--text-muted)" }}>—</span>;
            return (
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: percentageColor(row.assignmentPct),
                }}
              >
                {val.score}/{val.max_score}
              </span>
            );
          },
        },
        {
          key: "totalPct",
          label: "Total %",
          render: (val) => (
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.875rem",
                color: percentageColor(val),
              }}
            >
              {val}%
            </span>
          ),
        },
        gradeCol,
        statusCol,
      ];
    }

    // Single type columns
    return [
      studentCol,
      {
        key: "score",
        label: "Score",
        render: (val, row) => (
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "0.875rem",
              color: percentageColor(row.percentage),
            }}
          >
            {val}
          </span>
        ),
      },
      {
        key: "max_score",
        label: "Max",
        render: (val) => (
          <span
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
            }}
          >
            {val}
          </span>
        ),
      },
      {
        key: "percentage",
        label: "Percentage",
        render: (val) => (
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "0.875rem",
              color: percentageColor(val),
            }}
          >
            {val}%
          </span>
        ),
      },
      gradeCol,
      statusCol,
    ];
  }, [displayType]);

  return (
    <Card
      title="Marks Overview"
      action={<ActionToggle value={displayType} onChange={setDisplayType} />}
    >
      {error && (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            color: "var(--accent-red)",
            marginBottom: 16,
          }}
        >
          {error}
        </p>
      )}

      {/* ── Stats row ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <StatCard
          label="Class Average"
          value={stats.avg != null ? `${stats.avg}%` : "—"}
          valueColor={
            stats.avg != null ? percentageColor(stats.avg) : "var(--text-muted)"
          }
        />
        <StatCard
          label="Highest Score"
          value={stats.highest ? `${stats.highest.pct}%` : "—"}
          sub={stats.highest?.name}
          valueColor="var(--accent-green)"
        />
        <StatCard
          label="Lowest Score"
          value={stats.lowest ? `${stats.lowest.pct}%` : "—"}
          sub={stats.lowest?.name}
          valueColor="var(--accent-red)"
        />
        <StatCard
          label="Below 40%"
          value={String(stats.atRisk)}
          sub="at-risk students"
          valueColor={
            stats.atRisk > 0 ? "var(--accent-red)" : "var(--accent-green)"
          }
        />
      </div>

      {/* ── Marks table ───────────────────────────────────────────── */}
      <Table
        columns={columns}
        data={tableData}
        loading={loading}
        emptyMessage="No marks entered yet."
      />
    </Card>
  );
}
