// SubjectCard.jsx — Faculty dashboard card representing one subject.
// Shows attendance ring, student count, and at-risk indicator.
//
// Props:
//   subject       — { id, name, code, semester }
//   attendanceAvg — number  (mean attendance % across enrolled students)
//   studentCount  — number
//   atRiskCount   — number  (students below 75% attendance)
//   onClick       — fn
//   selected      — bool

import { motion } from "framer-motion";
import { Users, AlertTriangle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui";
import AttendanceRing from "@/components/dashboard/AttendanceRing";

export default function SubjectCard({
  subject,
  attendanceAvg,
  studentCount,
  atRiskCount,
  onClick,
  selected = false,
}) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      style={{
        background: "var(--bg-surface)",
        border: selected
          ? "1px solid var(--accent)"
          : "1px solid var(--border)",
        borderTop: "var(--glass-top)",
        borderRadius: 14,
        padding: 20,
        boxShadow: selected
          ? "0 0 0 3px var(--accent-glow)"
          : "var(--shadow-sm)",
        cursor: "pointer",
        transition: "border 200ms, box-shadow 200ms",
      }}
    >
      {/* ── Top row: subject info + attendance ring ─────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        {/* Left: code badge + name + semester */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Badge variant="blue" size="sm">
            {subject.code}
          </Badge>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1rem",
              color: "var(--text-primary)",
              marginTop: 6,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {subject.name}
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              marginTop: 4,
            }}
          >
            Semester {subject.semester}
          </div>
        </div>

        {/* Right: attendance ring (no labels) */}
        <AttendanceRing
          size={80}
          percentage={attendanceAvg}
          subjectName=""
          subjectCode=""
        />
      </div>

      {/* ── Divider ─────────────────────────────────────────────── */}
      <div
        style={{
          height: 1,
          background: "var(--border)",
          margin: "12px 0",
        }}
      />

      {/* ── Bottom row: student count + at-risk indicator ────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Users size={14} style={{ color: "var(--text-muted)" }} />
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: "0.8rem",
              color: "var(--text-muted)",
            }}
          >
            {studentCount} students
          </span>
        </div>

        {atRiskCount > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={14} style={{ color: "var(--accent-red)" }} />
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "0.8rem",
                color: "var(--accent-red)",
              }}
            >
              {atRiskCount} at risk
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <CheckCircle size={14} style={{ color: "var(--accent-green)" }} />
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "0.8rem",
                color: "var(--accent-green)",
              }}
            >
              All on track
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
