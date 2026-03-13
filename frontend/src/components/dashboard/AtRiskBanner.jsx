// AtRiskBanner.jsx — Warning banner shown when a student is at risk.
// Renders only when at least one subject < 75% attendance OR any mark < 40%.
//
// Props:
//   attendanceWarnings = [{ subjectName, percentage }]
//   marksWarnings = [{ subjectName, type, score, maxScore }]

import { AlertTriangle } from "lucide-react";

export default function AtRiskBanner({
  attendanceWarnings = [],
  marksWarnings = [],
}) {
  if (attendanceWarnings.length === 0 && marksWarnings.length === 0)
    return null;

  return (
    <div
      style={{
        background: "var(--accent-red-bg)",
        border: "1px solid var(--accent-red-border)",
        borderRadius: 12,
        padding: "16px 20px",
        marginBottom: 24,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <AlertTriangle
          size={18}
          style={{ color: "var(--accent-red)", flexShrink: 0 }}
        />
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "0.9rem",
            color: "var(--accent-red)",
          }}
        >
          Action Required
        </span>
      </div>

      {/* Warning list */}
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "0 0 12px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {attendanceWarnings.map((w, i) => (
          <li
            key={`att-${i}`}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.85rem",
              color: "var(--accent-red)",
            }}
          >
            • {w.subjectName} — attendance at {w.percentage}%
            <span style={{ opacity: 0.75 }}> (minimum 75% required)</span>
          </li>
        ))}
        {marksWarnings.map((w, i) => (
          <li
            key={`marks-${i}`}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.85rem",
              color: "var(--accent-red)",
            }}
          >
            • {w.subjectName} {w.type} — {w.score}/{w.maxScore}
            <span style={{ opacity: 0.75 }}> (below passing threshold)</span>
          </li>
        ))}
      </ul>

      {/* Footer note */}
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.8rem",
          color: "var(--accent-red)",
          opacity: 0.8,
          fontStyle: "italic",
        }}
      >
        Contact your faculty immediately to avoid academic penalty.
      </div>
    </div>
  );
}
