// StudentMarksCard.jsx — Student's marks across all enrolled subjects.
// Used on the student dashboard (compact=true) and the Marks page (compact=false).

import { useEffect, useMemo, useState } from "react";
import { Badge, Card } from "@/components/ui";
import {
  computeGrade,
  computePercentage,
  useMarks,
} from "@/hooks/useMarks";

// ── Grade Badge styling ────────────────────────────────────────────────────
function gradeBadgeStyle(grade) {
  const map = {
    'O':  { bg: 'var(--accent-green-bg)', color: 'var(--accent-green)', border: 'var(--accent-green-border)' },
    'A+': { bg: 'var(--accent-green-bg)', color: 'var(--accent-green)', border: 'var(--accent-green-border)' },
    'A':  { bg: 'var(--accent-blue-bg)', color: 'var(--accent-blue)', border: 'var(--accent-blue-border)' },
    'B+': { bg: 'var(--accent-blue-bg)', color: 'var(--accent-blue)', border: 'var(--accent-blue-border)' },
    'B':  { bg: 'var(--accent-amber-bg)', color: 'var(--accent-amber)', border: 'var(--accent-amber-border)' },
    'F':  { bg: 'var(--accent-red-bg)', color: 'var(--accent-red)', border: 'var(--accent-red-border)' },
  };
  return map[grade] || map['B'];
}

// ── Skeleton shimmer row ───────────────────────────────────────────────────
function SkeletonSubject() {
  return (
    <div style={{ padding: "16px 0" }}>
      {[80, 60].map((w) => (
        <div
          key={w}
          style={{
            height: 14,
            borderRadius: 4,
            width: `${w}%`,
            background:
              "linear-gradient(90deg, var(--bg-elevated) 0%, rgba(255,255,255,0.05) 50%, var(--bg-elevated) 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            marginBottom: 8,
          }}
        />
      ))}
    </div>
  );
}

// ── Single mark type row ───────────────────────────────────────────────────
function MarkRow({ label, mark }) {
  if (!mark) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            width: 80,
            flexShrink: 0,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            fontStyle: "italic",
          }}
        >
          Not entered
        </span>
      </div>
    );
  }

  const pct = computePercentage(mark.score, mark.max_score);
  const grade = computeGrade(pct);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 6,
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          width: 80,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "0.875rem",
          color: "var(--text-primary)",
        }}
      >
        {mark.score}/{mark.max_score}
      </span>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
        }}
      >
        {pct}%
      </span>
      <span style={{
        background: gradeBadgeStyle(grade).bg,
        color: gradeBadgeStyle(grade).color,
        border: `1px solid ${gradeBadgeStyle(grade).border}`,
        borderRadius: 9999,
        padding: '2px 8px',
        fontSize: '0.7rem',
        fontWeight: 700,
        fontFamily: 'var(--font-display)',
      }}>
        {grade}
      </span>
    </div>
  );
}

// ── Progress bar ───────────────────────────────────────────────────────────
function ProgressBar({ pct }) {
  const fillColor = "var(--accent)";
  return (
    <div style={{ marginTop: 10 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
          }}
        >
          Overall
        </span>
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
            fontWeight: 600,
          }}
        >
          {pct}%
        </span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: "var(--bg-elevated)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(pct, 100)}%`,
            borderRadius: 999,
            background: fillColor,
            transition: "width 600ms ease",
          }}
        />
      </div>
    </div>
  );
}

// ── Subject block ──────────────────────────────────────────────────────────
function SubjectBlock({ subject, compact }) {
  const { internal, assignment } = subject;

  const combinedPct = useMemo(() => {
    const pcts = [];
    if (internal)
      pcts.push(computePercentage(internal.score, internal.max_score));
    if (assignment)
      pcts.push(computePercentage(assignment.score, assignment.max_score));
    if (pcts.length === 0) return 0;
    return Math.round(pcts.reduce((sum, p) => sum + p, 0) / pcts.length);
  }, [internal, assignment]);

  return (
    <div style={{ padding: compact ? "10px 0" : "14px 0" }}>
      {/* Subject header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "0.9rem",
            color: "var(--text-primary)",
          }}
        >
          {subject.name}
        </span>
        {subject.code && (
          <Badge variant="blue" size="sm">
            {subject.code}
          </Badge>
        )}
      </div>

      {/* Mark rows */}
      <MarkRow label="Internal" mark={internal} />
      <MarkRow label="Assignment" mark={assignment} />

      {/* Combined progress bar */}
      <ProgressBar pct={combinedPct} />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function StudentMarksCard({ compact = false, subjectMap = {} }) {
  const { fetchAllMyMarks } = useMarks();
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllMyMarks().then(({ data, error: err }) => {
      setLoading(false);
      if (err) {
        setError(err.message);
        return;
      }
      setMarks(data ?? []);
    });
  }, []);

  // Group marks by subject
  const subjects = useMemo(() => {
    const map = {};
    for (const m of marks) {
      const sid = m.subject_id;
      if (!map[sid]) {
        map[sid] = {
          id: sid,
          name: subjectMap[sid]?.name ?? m.subjects?.name ?? sid,
          code: subjectMap[sid]?.code ?? m.subjects?.code ?? "",
          internal: null,
          assignment: null,
        };
      }
      if (m.type === "internal") map[sid].internal = m;
      else if (m.type === "assignment") map[sid].assignment = m;
    }
    return Object.values(map);
  }, [marks, subjectMap]);

  // Overall GPA equivalent — mean of all individual mark percentages
  const overallPct = useMemo(() => {
    const allPcts = [];
    for (const s of subjects) {
      if (s.internal)
        allPcts.push(computePercentage(s.internal.score, s.internal.max_score));
      if (s.assignment)
        allPcts.push(
          computePercentage(s.assignment.score, s.assignment.max_score),
        );
    }
    if (allPcts.length === 0) return 0;
    return Math.round(allPcts.reduce((sum, p) => sum + p, 0) / allPcts.length);
  }, [subjects]);

  const overallGrade = computeGrade(overallPct);

  // ── Content ──────────────────────────────────────────────────────────
  const content = (
    <>
      {error && (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            color: "var(--accent-red)",
          }}
        >
          {error}
        </p>
      )}

      {loading ? (
        <>
          <SkeletonSubject />
          <SkeletonSubject />
          <SkeletonSubject />
        </>
      ) : subjects.length === 0 ? (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            color: "var(--text-muted)",
            fontStyle: "italic",
            padding: "24px 0",
            textAlign: "center",
          }}
        >
          No marks available yet.
        </p>
      ) : (
        <>
          {subjects.map((subject, idx) => (
            <div key={subject.id}>
              <SubjectBlock subject={subject} compact={compact} />
              {idx < subjects.length - 1 && (
                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid var(--border)",
                    margin: 0,
                  }}
                />
              )}
            </div>
          ))}

          {/* Bottom summary — full view only */}
          {!compact && subjects.length > 0 && (
            <div
              style={{
                marginTop: 24,
                paddingTop: 20,
                borderTop: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--text-muted)",
                    marginBottom: 4,
                  }}
                >
                  Overall GPA Equivalent
                </div>
                <div
                  style={{ display: "flex", alignItems: "baseline", gap: 12 }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "2rem",
                      color: "var(--text-primary)",
                      lineHeight: 1,
                    }}
                  >
                    {overallPct}%
                  </span>
                  <span style={{
                    background: gradeBadgeStyle(overallGrade).bg,
                    color: gradeBadgeStyle(overallGrade).color,
                    border: `1px solid ${gradeBadgeStyle(overallGrade).border}`,
                    borderRadius: 9999,
                    padding: '2px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                  }}>
                    {overallGrade}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );

  // compact=true: no Card wrapper — used directly inside dashboard widgets
  if (compact) {
    return <div style={{ padding: "4px 0" }}>{content}</div>;
  }

  return <Card title="My Marks">{content}</Card>;
}
