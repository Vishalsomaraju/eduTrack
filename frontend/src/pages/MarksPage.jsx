import React, { useState, useEffect } from "react";
import {
  useMarks,
  computeGrade,
  gradeBadgeVariant,
  percentageColor,
} from "@/hooks/useMarks";
import { useAttendance } from "@/hooks/useAttendance";
import { useAuthStore } from "@/stores/authStore";
import { EmptyState, SkeletonCard } from "@/components/ui";
import { BookOpen } from "lucide-react";
import api from "@/lib/api";
import ExportButton from "@/components/ui/ExportButton";
import {
  downloadCSV,
  buildFacultyMarksCSV,
  buildFacultyLabMarksCSV,
  buildStudentMarksCSV,
  buildStudentLabMarksCSV,
  todayStr,
} from "@/lib/csvExport";

const semLabel = (sem) => {
  const map = {
    1: "1-1",
    2: "1-2",
    3: "2-1",
    4: "2-2",
    5: "3-1",
    6: "3-2",
    7: "4-1",
    8: "4-2",
  };
  return map[sem] || sem;
};

const CURRENT_SEM = 4;

const ELECTIVE_SLOTS = {
  5: ["Professional Elective I", "Professional Elective II"],
  6: ["Open Elective I", "Professional Elective III"],
  7: [
    "Professional Elective IV",
    "Professional Elective V",
    "Open Elective II",
  ],
  8: ["Professional Elective VI", "Open Elective III"],
};

const SLOT_PREFIX_MAP = {
  "Professional Elective I": "CS51",
  "Professional Elective II": "CS52",
  "Open Elective I": "CS61",
  "Professional Elective III": "CS63",
  "Professional Elective IV": "CS74",
  "Professional Elective V": "CS75",
  "Open Elective II": "CS72",
  "Professional Elective VI": "CS86",
  "Open Elective III": "CS83",
};

function GradeBadge({ grade }) {
  if (!gradeBadgeVariant)
    return <span style={{ color: "var(--text-muted)" }}>{grade}</span>;
  const variant = gradeBadgeVariant(grade);
  return (
    <span
      style={{
        padding: "6px 14px",
        borderRadius: 8,
        fontWeight: 700,
        fontSize: "0.85rem",
        background: `var(--accent-${variant}-bg)`,
        color: `var(--accent-${variant})`,
      }}
    >
      {grade}
    </span>
  );
}

function TheoryBreakdown({ subj, m, getBadgeColors }) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          background: "var(--bg-elevated)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--text-primary)",
          }}
        >
          {m.subjects?.name || subj?.name}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
            }}
          >
            {m.subjects?.code || subj?.code}
          </span>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              background: "var(--accent-subtle)",
              border: "1px solid var(--border)",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--accent)",
            }}
          >
            {m.subjects?.credits || subj?.credits} Credits
          </span>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "0.85rem",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid var(--border)",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <th style={{ padding: "12px 20px", fontWeight: 600 }}>
                Component
              </th>
              <th style={{ padding: "12px 20px", fontWeight: 600 }}>Marks</th>
              <th style={{ padding: "12px 20px", fontWeight: 600 }}>Max</th>
              <th style={{ padding: "12px 20px", fontWeight: 600 }}>%</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <td
                style={{ padding: "10px 20px", color: "var(--text-secondary)" }}
              >
                Mid-1 Exam
              </td>
              <td
                style={{ padding: "10px 20px", color: "var(--text-primary)" }}
              >
                {m.mid1_exam}
              </td>
              <td style={{ padding: "10px 20px", color: "var(--text-muted)" }}>
                /30
              </td>
              <td style={{ padding: "10px 20px", color: "var(--text-muted)" }}>
                {Math.round((m.mid1_exam / 30) * 100)}%
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <td
                style={{ padding: "10px 20px", color: "var(--text-secondary)" }}
              >
                Mid-1 Assignment
              </td>
              <td
                style={{ padding: "10px 20px", color: "var(--text-primary)" }}
              >
                {m.mid1_assign}
              </td>
              <td style={{ padding: "10px 20px", color: "var(--text-muted)" }}>
                /10
              </td>
              <td style={{ padding: "10px 20px", color: "var(--text-muted)" }}>
                {Math.round((m.mid1_assign / 10) * 100)}%
              </td>
            </tr>
            <tr
              style={{
                borderBottom: "1px solid var(--border)",
                background: "var(--bg-elevated)",
              }}
            >
              <td
                style={{
                  padding: "10px 20px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                Mid-1 Total
              </td>
              <td
                style={{
                  padding: "10px 20px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {m.mid1_total}
              </td>
              <td style={{ padding: "10px 20px", color: "var(--text-muted)" }}>
                /40
              </td>
              <td
                style={{
                  padding: "10px 20px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {Math.round((m.mid1_total / 40) * 100)}%
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <td
                style={{ padding: "10px 20px", color: "var(--text-secondary)" }}
              >
                Mid-2 Exam
              </td>
              <td
                style={{ padding: "10px 20px", color: "var(--text-primary)" }}
              >
                {m.mid2_exam}
              </td>
              <td style={{ padding: "10px 20px", color: "var(--text-muted)" }}>
                /30
              </td>
              <td style={{ padding: "10px 20px", color: "var(--text-muted)" }}>
                {Math.round((m.mid2_exam / 30) * 100)}%
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <td
                style={{ padding: "10px 20px", color: "var(--text-secondary)" }}
              >
                Mid-2 Assignment
              </td>
              <td
                style={{ padding: "10px 20px", color: "var(--text-primary)" }}
              >
                {m.mid2_assign}
              </td>
              <td style={{ padding: "10px 20px", color: "var(--text-muted)" }}>
                /10
              </td>
              <td style={{ padding: "10px 20px", color: "var(--text-muted)" }}>
                {Math.round((m.mid2_assign / 10) * 100)}%
              </td>
            </tr>
            <tr
              style={{
                borderBottom: "1px solid var(--border)",
                background: "var(--bg-elevated)",
              }}
            >
              <td
                style={{
                  padding: "10px 20px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                Mid-2 Total
              </td>
              <td
                style={{
                  padding: "10px 20px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {m.mid2_total}
              </td>
              <td style={{ padding: "10px 20px", color: "var(--text-muted)" }}>
                /40
              </td>
              <td
                style={{
                  padding: "10px 20px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {Math.round((m.mid2_total / 40) * 100)}%
              </td>
            </tr>
            <tr
              style={{
                borderBottom: "1px solid var(--border)",
                background: "var(--accent-subtle)",
              }}
            >
              <td
                style={{
                  padding: "10px 20px",
                  fontWeight: 700,
                  color: "var(--accent)",
                }}
              >
                Internal (Avg)
              </td>
              <td
                style={{
                  padding: "10px 20px",
                  fontWeight: 700,
                  color: "var(--accent)",
                }}
              >
                {m.internal}
              </td>
              <td style={{ padding: "10px 20px", color: "var(--accent)" }}>
                /40
              </td>
              <td
                style={{
                  padding: "10px 20px",
                  fontWeight: 700,
                  color: "var(--accent)",
                }}
              >
                {Math.round((m.internal / 40) * 100)}%
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <td
                style={{ padding: "10px 20px", color: "var(--text-secondary)" }}
              >
                External / Sem
              </td>
              <td
                style={{ padding: "10px 20px", color: "var(--text-primary)" }}
              >
                {m.external}
              </td>
              <td style={{ padding: "10px 20px", color: "var(--text-muted)" }}>
                /60
              </td>
              <td
                style={{ padding: "10px 20px", color: "var(--text-primary)" }}
              >
                {Math.round((m.external / 60) * 100)}%
              </td>
            </tr>
            <tr
              style={{
                background: "var(--bg-elevated)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <td
                style={{
                  padding: "14px 20px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                TOTAL
              </td>
              <td
                style={{
                  padding: "14px 20px",
                  fontWeight: 700,
                  color: percentageColor
                    ? percentageColor(m.percentage)
                    : "var(--accent-green)",
                }}
              >
                {m.total}
              </td>
              <td style={{ padding: "14px 20px", color: "var(--text-muted)" }}>
                /100
              </td>
              <td
                style={{
                  padding: "14px 20px",
                  fontWeight: 700,
                  color: percentageColor
                    ? percentageColor(m.percentage)
                    : "var(--accent-green)",
                }}
              >
                {m.percentage}%
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: "14px 20px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                GRADE
              </td>
              <td colSpan={3} style={{ padding: "14px 20px" }}>
                <GradeBadge grade={m.grade} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{ padding: "16px 20px" }}>
        <div
          style={{
            width: "100%",
            height: 8,
            background: "var(--bg-elevated)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${m.percentage}%`,
              height: "100%",
              background: percentageColor
                ? percentageColor(m.percentage)
                : "var(--accent-green)",
              borderRadius: 4,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function EmptySubjectCard({ subj }) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "20px 24px",
        marginBottom: 16,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--text-primary)",
          }}
        >
          {subj.name}
        </div>
        <div
          style={{
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            marginTop: 4,
          }}
        >
          {subj.code} · {subj.credits} Credits
        </div>
      </div>
      <span
        style={{
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          fontStyle: "italic",
          background: "var(--bg-elevated)",
          padding: "6px 14px",
          borderRadius: 8,
          border: "1px solid var(--border)",
        }}
      >
        Marks not uploaded yet
      </span>
    </div>
  );
}

function ElectiveSlotCard({ label }) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "20px 24px",
        marginBottom: 16,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--text-muted)",
            fontStyle: "italic",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            marginTop: 4,
          }}
        >
          Not registered yet — go to My Courses to choose
        </div>
      </div>
      <span
        style={{
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          background: "var(--bg-elevated)",
          padding: "4px 12px",
          borderRadius: 8,
          border: "1px solid var(--border)",
        }}
      >
        Elective
      </span>
    </div>
  );
}

function MCSubjectCard({ subj }) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "20px 24px",
        marginBottom: 16,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--text-primary)",
          }}
        >
          {subj.name}
        </div>
        <div
          style={{
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            marginTop: 4,
          }}
        >
          {subj.code} · S/U grading
        </div>
      </div>
      <span
        style={{
          background: "var(--bg-elevated)",
          color: "var(--text-muted)",
          fontSize: "0.8rem",
          padding: "6px 14px",
          borderRadius: 8,
          border: "1px solid var(--border)",
        }}
      >
        Mandatory Course
      </span>
    </div>
  );
}

function LabRow({ label, val, max }) {
  return (
    <tr style={{ borderBottom: "1px solid var(--border)" }}>
      <td style={{ padding: "10px 16px", color: "var(--text-secondary)" }}>
        {label}
      </td>
      <td
        style={{
          padding: "10px 16px",
          textAlign: "center",
          fontWeight: 600,
          color: "var(--text-primary)",
        }}
      >
        {val}
      </td>
      <td
        style={{
          padding: "10px 16px",
          textAlign: "center",
          color: "var(--text-muted)",
        }}
      >
        /{max}
      </td>
      <td
        style={{
          padding: "10px 16px",
          textAlign: "center",
          color: "var(--text-secondary)",
        }}
      >
        {Math.round((val / max) * 100)}%
      </td>
    </tr>
  );
}

function LabBreakdown({ subj, lm }) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "20px 24px",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--text-primary)",
          }}
        >
          {subj.name}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <span
            style={{
              background: "var(--accent-green-bg)",
              color: "var(--accent-green)",
              borderRadius: 9999,
              padding: "2px 10px",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            Lab
          </span>
          <span
            style={{
              background: "var(--bg-elevated)",
              color: "var(--text-muted)",
              borderRadius: 9999,
              padding: "2px 10px",
              fontSize: "0.75rem",
            }}
          >
            {subj.code}
          </span>
          <span
            style={{
              background: "var(--bg-elevated)",
              color: "var(--text-muted)",
              borderRadius: 9999,
              padding: "2px 10px",
              fontSize: "0.75rem",
            }}
          >
            {subj.credits} Credits
          </span>
        </div>
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.875rem",
        }}
      >
        <thead>
          <tr style={{ background: "var(--bg-elevated)" }}>
            <th
              style={{
                padding: "8px 16px",
                textAlign: "left",
                color: "var(--text-muted)",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Component
            </th>
            <th
              style={{
                padding: "8px 16px",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Marks
            </th>
            <th
              style={{
                padding: "8px 16px",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Max
            </th>
            <th
              style={{
                padding: "8px 16px",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              %
            </th>
          </tr>
        </thead>
        <tbody>
          <LabRow label="Internal Viva" val={lm.internal_viva} max={10} />
          <LabRow
            label="Observation / Record"
            val={lm.observation_record}
            max={10}
          />
          <LabRow label="Lab Performance" val={lm.lab_performance} max={20} />
          <tr
            style={{
              background: "var(--accent-subtle)",
              borderTop: "1px solid var(--border)",
            }}
          >
            <td
              style={{
                padding: "10px 16px",
                fontWeight: 700,
                color: "var(--accent)",
              }}
            >
              Internal Total
            </td>
            <td
              style={{
                padding: "10px 16px",
                textAlign: "center",
                fontWeight: 700,
                color: "var(--accent)",
              }}
            >
              {lm.internal_total}
            </td>
            <td
              style={{
                padding: "10px 16px",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              /40
            </td>
            <td
              style={{
                padding: "10px 16px",
                textAlign: "center",
                fontWeight: 700,
                color: "var(--accent)",
              }}
            >
              {Math.round((lm.internal_total / 40) * 100)}%
            </td>
          </tr>
          <LabRow label="External Viva" val={lm.external_viva} max={10} />
          <LabRow label="External Record" val={lm.external_record} max={10} />
          <LabRow label="Lab Exam" val={lm.lab_exam} max={40} />
          <tr
            style={{
              background: "var(--bg-elevated)",
              borderTop: "1px solid var(--border)",
            }}
          >
            <td
              style={{
                padding: "10px 16px",
                fontWeight: 700,
                color: "var(--text-secondary)",
              }}
            >
              External Total
            </td>
            <td
              style={{
                padding: "10px 16px",
                textAlign: "center",
                fontWeight: 700,
              }}
            >
              {lm.external_total}
            </td>
            <td
              style={{
                padding: "10px 16px",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              /60
            </td>
            <td
              style={{
                padding: "10px 16px",
                textAlign: "center",
                fontWeight: 700,
              }}
            >
              {Math.round((lm.external_total / 60) * 100)}%
            </td>
          </tr>
          <tr style={{ borderTop: "2px solid var(--border)" }}>
            <td
              style={{
                padding: "12px 16px",
                fontWeight: 700,
                fontSize: "1rem",
                color: "var(--text-primary)",
              }}
            >
              TOTAL
            </td>
            <td
              style={{
                padding: "12px 16px",
                textAlign: "center",
                fontWeight: 700,
                fontSize: "1rem",
                color:
                  lm.total >= 75
                    ? "var(--accent-green)"
                    : lm.total >= 40
                      ? "var(--accent-blue)"
                      : "var(--accent-red)",
              }}
            >
              {lm.total}
            </td>
            <td
              style={{
                padding: "12px 16px",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              /100
            </td>
            <td
              style={{
                padding: "12px 16px",
                textAlign: "center",
                fontWeight: 700,
                color:
                  lm.total >= 75
                    ? "var(--accent-green)"
                    : lm.total >= 40
                      ? "var(--accent-blue)"
                      : "var(--accent-red)",
              }}
            >
              {lm.total}%
            </td>
          </tr>
          <tr>
            <td
              style={{
                padding: "10px 16px",
                fontWeight: 700,
                color: "var(--text-secondary)",
              }}
            >
              GRADE
            </td>
            <td
              colSpan={3}
              style={{ padding: "10px 16px", textAlign: "center" }}
            >
              <GradeBadge grade={lm.grade} />
            </td>
          </tr>
        </tbody>
      </table>
      <div
        style={{
          marginTop: 16,
          height: 6,
          borderRadius: 9999,
          background: "var(--bg-elevated)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 9999,
            width: lm.total + "%",
            background:
              lm.total >= 75
                ? "var(--accent-green)"
                : lm.total >= 40
                  ? "var(--accent-blue)"
                  : "var(--accent-red)",
            transition: "width 600ms ease",
          }}
        />
      </div>
    </div>
  );
}

function LabEmptyCard({ subj }) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "20px 24px",
        marginBottom: 16,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1rem",
              color: "var(--text-primary)",
            }}
          >
            {subj.name}
          </span>
          <span
            style={{
              background: "var(--accent-green-bg)",
              color: "var(--accent-green)",
              borderRadius: 9999,
              padding: "2px 8px",
              fontSize: "0.7rem",
              fontWeight: 700,
            }}
          >
            Lab
          </span>
        </div>
        <div
          style={{
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            marginTop: 4,
          }}
        >
          {subj.code} · {subj.credits} Credits
        </div>
      </div>
      <span
        style={{
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          fontStyle: "italic",
          background: "var(--bg-elevated)",
          padding: "6px 14px",
          borderRadius: 8,
          border: "1px solid var(--border)",
        }}
      >
        Lab marks not uploaded yet
      </span>
    </div>
  );
}

// ── Student View ──────────────────────────────────────────────────────────────

function StudentView({ marks, labMarks, allSubjects = [] }) {
  const { profile } = useAuthStore();
  const { fetchAttendanceSummary } = useAttendance();
  const [activeSem, setActiveSem] = useState(CURRENT_SEM);
  const [marksTab, setMarksTab] = useState("theory");
  // Cache attendance summaries keyed by subject_id for export
  const [attendanceSummaries, setAttendanceSummaries] = useState({});

  const subjectsBySem = allSubjects.reduce((acc, s) => {
    const key = Number(s.semester);
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const marksMap = marks.reduce((acc, m) => {
    acc[m.subject_id] = m;
    return acc;
  }, {});
  const labMarksMap = labMarks.reduce((acc, m) => {
    acc[m.subject_id] = m;
    return acc;
  }, {});

  const sems = Object.keys(subjectsBySem).sort((a, b) => Number(a) - Number(b));

  if (sems.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No Subjects Found"
        description="Syllabus not configured yet."
      />
    );
  }

  const getBadgeColors = (grade) => {
    if (!gradeBadgeVariant)
      return { bg: "var(--bg-elevated)", text: "var(--text-secondary)" };
    const variant = gradeBadgeVariant(grade);
    return {
      bg: `var(--accent-${variant}-bg)`,
      text: `var(--accent-${variant})`,
    };
  };

  const semSubjectsForAvg = (subjectsBySem[activeSem] || []).filter(
    (s) =>
      s.subject_type === "core" ||
      s.subject_type === "elective" ||
      s.subject_type === "lab",
  );
  const semMarksForAvg = semSubjectsForAvg
    .map((s) => marksMap[s.id])
    .filter((m) => !!m);
  const avgPercentage =
    semMarksForAvg.length > 0
      ? Math.round(
          semMarksForAvg.reduce((sum, m) => sum + m.percentage, 0) /
            semMarksForAvg.length,
        )
      : 0;
  const displayAvg = semMarksForAvg.length > 0 ? `${avgPercentage}%` : "—";
  const overallGrade =
    semMarksForAvg.length > 0
      ? computeGrade
        ? computeGrade(avgPercentage)
        : "F"
      : "—";


  return (
    <div>
      {/* Page header + export button */}
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1.5rem",
              color: "var(--text-primary)",
              margin: 0,
              marginBottom: 4,
            }}
          >
            Academic Results
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.9rem",
              color: "var(--text-muted)",
              margin: 0,
            }}
          >
            R22 B.Tech CSE — KPRIT Hyderabad
          </p>
        </div>
      </div>

      {/* Semester tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          overflowX: "auto",
          paddingBottom: 8,
        }}
      >
        {sems.map((sem) => (
          <button
            key={sem}
            onClick={() => setActiveSem(Number(sem))}
            style={{
              padding: "6px 16px",
              borderRadius: 9999,
              border:
                activeSem === Number(sem) ? "none" : "1px solid var(--border)",
              background:
                activeSem === Number(sem) ? "var(--accent)" : "transparent",
              color:
                activeSem === Number(sem) ? "#fff" : "var(--text-secondary)",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {semLabel(sem)}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <ExportButton
          label="Export Theory Marks"
          disabled={marks.length === 0}
          onClick={() => {
            downloadCSV(
              buildStudentMarksCSV(marks, allSubjects),
              `my_theory_marks_${todayStr()}.csv`
            );
          }}
        />
        <ExportButton
          label="Export Lab Marks"
          disabled={labMarks.length === 0}
          onClick={() => {
            downloadCSV(
              buildStudentLabMarksCSV(labMarks, allSubjects),
              `my_lab_marks_${todayStr()}.csv`
            );
          }}
        />
      </div>

      {/* Theory / Lab tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          borderBottom: "1px solid var(--border)",
          paddingBottom: 0,
        }}
      >
        {["theory", "lab"].map((tab) => (
          <button
            key={tab}
            onClick={() => setMarksTab(tab)}
            style={{
              padding: "8px 20px",
              background: "transparent",
              border: "none",
              borderBottom:
                marksTab === tab
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
              color: marksTab === tab ? "var(--accent)" : "var(--text-muted)",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              textTransform: "capitalize",
              marginBottom: -1,
            }}
          >
            {tab === "theory" ? "📖 Theory" : "🔬 Lab"}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {marksTab === "theory" && (
          <>
            {(subjectsBySem[activeSem] || [])
              .filter(
                (s) =>
                  s.subject_type === "core" || s.subject_type === "elective",
              )
              .map((subj) => {
                const m = marksMap[subj.id];
                if (m)
                  return (
                    <TheoryBreakdown
                      key={subj.id}
                      subj={subj}
                      m={m}
                      getBadgeColors={getBadgeColors}
                    />
                  );
                return <EmptySubjectCard key={subj.id} subj={subj} />;
              })}
            {(ELECTIVE_SLOTS[activeSem] || []).map((slotLabel) => {
              const prefix = SLOT_PREFIX_MAP[slotLabel];
              const registered = marks.find(
                (m) =>
                  m.subjects?.subject_type === "elective" &&
                  m.subjects?.code?.startsWith(prefix),
              );
              if (registered)
                return (
                  <TheoryBreakdown
                    key={slotLabel}
                    subj={registered.subjects}
                    m={registered}
                    getBadgeColors={getBadgeColors}
                  />
                );
              return <ElectiveSlotCard key={slotLabel} label={slotLabel} />;
            })}
            {(subjectsBySem[activeSem] || [])
              .filter((s) => s.subject_type === "mc")
              .map((subj) => (
                <MCSubjectCard key={subj.id} subj={subj} />
              ))}
          </>
        )}
        {marksTab === "lab" && (
          <>
            {(() => {
              const labSubs = (subjectsBySem[activeSem] || []).filter(
                (s) => s.subject_type === "lab",
              );
              if (labSubs.length === 0)
                return (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "60px 20px",
                      color: "var(--text-muted)",
                    }}
                  >
                    No lab subjects in this semester
                  </div>
                );
              return labSubs.map((subj) => {
                const lm = labMarksMap[subj.id];
                if (lm)
                  return <LabBreakdown key={subj.id} subj={subj} lm={lm} />;
                return <LabEmptyCard key={subj.id} subj={subj} />;
              });
            })()}
          </>
        )}
      </div>

      {/* Semester summary footer */}
      <div
        style={{
          marginTop: 24,
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 24,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "0.8rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--text-muted)",
            marginBottom: 8,
            fontWeight: 700,
          }}
        >
          Overall Semester Performance
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "baseline",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: "3rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              fontFamily: "var(--font-display)",
              lineHeight: 1,
            }}
          >
            {displayAvg}
          </div>
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--text-secondary)",
            }}
          >
            {overallGrade} Grade
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Faculty View ──────────────────────────────────────────────────────────────

function FacultyView() {
  const { fetchSubjects, fetchStudentsForSubject } = useMarks();
  const { fetchAttendance } = useAttendance();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [students, setStudents] = useState([]);
  const [subjectMarks, setSubjectMarks] = useState([]);
  const [labSubjectMarks, setLabSubjectMarks] = useState([]);
  const [attendanceRecs, setAttendanceRecs] = useState([]);

  useEffect(() => {
    fetchSubjects().then(({ data }) =>
      setSubjects(Array.isArray(data) ? data : (data?.data ?? [])),
    );
  }, []);

  const selectedSubjectData = subjects.find((s) => s.id === selectedSubject);
  const isLab = selectedSubjectData?.subject_type === "lab";

  useEffect(() => {
    if (!selectedSubject) return;
    // Always fetch attendance and students
    Promise.all([
      fetchStudentsForSubject(selectedSubject),
      fetchAttendance(selectedSubject),
      isLab
        ? api.get(`/lab-marks/${selectedSubject}`)
        : api.get(`/marks/${selectedSubject}`),
    ]).then(([stRes, attRes, marksRes]) => {
      setStudents(
        Array.isArray(stRes.data) ? stRes.data : (stRes.data?.data ?? []),
      );
      setAttendanceRecs(
        Array.isArray(attRes.data) ? attRes.data : (attRes.data?.data ?? []),
      );
      if (isLab) {
        setLabSubjectMarks(
          Array.isArray(marksRes) ? marksRes : (marksRes.data ?? []),
        );
        setSubjectMarks([]);
      } else {
        setSubjectMarks(
          Array.isArray(marksRes) ? marksRes : (marksRes.data ?? []),
        );
        setLabSubjectMarks([]);
      }
    });
  }, [selectedSubject, isLab]);


  const handleUpdateTheory = async (studentId, field, value) => {
    const valObj = {};
    valObj[field] = value === "" ? 0 : Number(value);
    const existing = subjectMarks.find((m) => m.student_id === studentId) || {
      student_id: studentId,
      subject_id: selectedSubject,
      mid1_exam: 0,
      mid1_assign: 0,
      mid2_exam: 0,
      mid2_assign: 0,
      external: 0,
    };
    const updated = { ...existing, ...valObj };
    setSubjectMarks((prev) => {
      const idx = prev.findIndex((m) => m.student_id === studentId);
      if (idx >= 0)
        return [...prev.slice(0, idx), updated, ...prev.slice(idx + 1)];
      return [...prev, updated];
    });
    try {
      const res = await api.patch(
        `/marks/${studentId}/${selectedSubject}`,
        valObj,
      );
      if (res && res.id) {
        setSubjectMarks((prev) => {
          const idx = prev.findIndex((m) => m.student_id === studentId);
          if (idx >= 0)
            return [...prev.slice(0, idx), res, ...prev.slice(idx + 1)];
          return [...prev, res];
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLab = async (studentId, field, value) => {
    const valObj = {};
    valObj[field] = value === "" ? 0 : Number(value);
    const existing = labSubjectMarks.find(
      (m) => m.student_id === studentId,
    ) || {
      student_id: studentId,
      subject_id: selectedSubject,
      internal_viva: 0,
      observation_record: 0,
      lab_performance: 0,
      external_viva: 0,
      external_record: 0,
      lab_exam: 0,
    };
    const updated = { ...existing, ...valObj };
    setLabSubjectMarks((prev) => {
      const idx = prev.findIndex((m) => m.student_id === studentId);
      if (idx >= 0)
        return [...prev.slice(0, idx), updated, ...prev.slice(idx + 1)];
      return [...prev, updated];
    });
    try {
      const res = await api.patch(
        `/lab-marks/${studentId}/${selectedSubject}`,
        valObj,
      );
      if (res && res.id) {
        setLabSubjectMarks((prev) => {
          const idx = prev.findIndex((m) => m.student_id === studentId);
          if (idx >= 0)
            return [...prev.slice(0, idx), res, ...prev.slice(idx + 1)];
          return [...prev, res];
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1.5rem",
              color: "var(--text-primary)",
              margin: 0,
              marginBottom: 4,
            }}
          >
            Manage Marks
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.9rem",
              color: "var(--text-muted)",
              margin: 0,
            }}
          >
            Enter and update marks for your assigned classes.
          </p>
        </div>
      </div>

      {/* Subject selector */}
      <div style={{ marginBottom: 24 }}>
        <label
          style={{
            display: "block",
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Select Subject
        </label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 400,
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--input-bg)",
            color: "var(--text-primary)",
            fontSize: "0.95rem",
            outline: "none",
          }}
        >
          <option value="">Choose...</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code}) {s.subject_type === "lab" ? "[LAB]" : ""}
            </option>
          ))}
        </select>
        {selectedSubject && (
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <ExportButton
              label={isLab ? "Export Lab Marks CSV" : "Export Theory Marks CSV"}
              disabled={students.length === 0}
              onClick={() => {
                const subj = subjects.find((s) => s.id === selectedSubject);
                const code = subj?.code || selectedSubject;
                const date = todayStr();
                if (isLab) {
                  downloadCSV(
                    buildFacultyLabMarksCSV(students, labSubjectMarks),
                    `lab_marks_${code}_${date}.csv`
                  );
                } else {
                  downloadCSV(
                    buildFacultyMarksCSV(students, subjectMarks, code),
                    `marks_${code}_${date}.csv`
                  );
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Marks table */}
      {selectedSubject && (
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: "0.85rem",
            }}
          >
            <thead>
              {isLab ? (
                <tr
                  style={{
                    background: "var(--bg-elevated)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <th
                    style={{
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Student
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Int.Viva(10)
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Obs/Rec(10)
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Lab Perf(20)
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Ext.Viva(10)
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Ext.Rec(10)
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Lab Exam(40)
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "var(--accent)",
                    }}
                  >
                    Int(40)
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    Total
                  </th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>
                    Grade
                  </th>
                </tr>
              ) : (
                <tr
                  style={{
                    background: "var(--bg-elevated)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <th
                    style={{
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Student
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    M1 Ex (30)
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    M1 As (10)
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    M2 Ex (30)
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    M2 As (10)
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Ext (60)
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "var(--accent)",
                    }}
                  >
                    Int (40)
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    Total
                  </th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>
                    Grade
                  </th>
                </tr>
              )}
            </thead>
            <tbody>
              {students.map((st) => {
                const inputStyle = {
                  width: 60,
                  padding: "6px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: "var(--input-bg)",
                  color: "var(--text-primary)",
                  textAlign: "center",
                  outline: "none",
                };
                if (isLab) {
                  const lm =
                    labSubjectMarks.find((m) => m.student_id === st.id) || {};
                  return (
                    <tr
                      key={st.id}
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      <td
                        style={{
                          padding: "12px 16px",
                          color: "var(--text-primary)",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {st.name}
                      </td>
                      <td style={{ padding: "8px 16px" }}>
                        <input
                          type="number"
                          max="10"
                          min="0"
                          defaultValue={lm.internal_viva || ""}
                          onBlur={(e) =>
                            handleUpdateLab(
                              st.id,
                              "internal_viva",
                              e.target.value,
                            )
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" && e.target.blur()
                          }
                          style={inputStyle}
                        />
                      </td>
                      <td style={{ padding: "8px 16px" }}>
                        <input
                          type="number"
                          max="10"
                          min="0"
                          defaultValue={lm.observation_record || ""}
                          onBlur={(e) =>
                            handleUpdateLab(
                              st.id,
                              "observation_record",
                              e.target.value,
                            )
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" && e.target.blur()
                          }
                          style={inputStyle}
                        />
                      </td>
                      <td style={{ padding: "8px 16px" }}>
                        <input
                          type="number"
                          max="20"
                          min="0"
                          defaultValue={lm.lab_performance || ""}
                          onBlur={(e) =>
                            handleUpdateLab(
                              st.id,
                              "lab_performance",
                              e.target.value,
                            )
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" && e.target.blur()
                          }
                          style={inputStyle}
                        />
                      </td>
                      <td style={{ padding: "8px 16px" }}>
                        <input
                          type="number"
                          max="10"
                          min="0"
                          defaultValue={lm.external_viva || ""}
                          onBlur={(e) =>
                            handleUpdateLab(
                              st.id,
                              "external_viva",
                              e.target.value,
                            )
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" && e.target.blur()
                          }
                          style={inputStyle}
                        />
                      </td>
                      <td style={{ padding: "8px 16px" }}>
                        <input
                          type="number"
                          max="10"
                          min="0"
                          defaultValue={lm.external_record || ""}
                          onBlur={(e) =>
                            handleUpdateLab(
                              st.id,
                              "external_record",
                              e.target.value,
                            )
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" && e.target.blur()
                          }
                          style={inputStyle}
                        />
                      </td>
                      <td style={{ padding: "8px 16px" }}>
                        <input
                          type="number"
                          max="40"
                          min="0"
                          defaultValue={lm.lab_exam || ""}
                          onBlur={(e) =>
                            handleUpdateLab(st.id, "lab_exam", e.target.value)
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" && e.target.blur()
                          }
                          style={inputStyle}
                        />
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontWeight: 600,
                          color: "var(--accent)",
                        }}
                      >
                        {lm.internal_total || 0}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontWeight: 700,
                          color: "var(--text-primary)",
                        }}
                      >
                        {lm.total || 0}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontWeight: 700,
                          color: lm.grade
                            ? lm.grade === "F"
                              ? "var(--accent-red)"
                              : "var(--accent-green)"
                            : "var(--text-muted)",
                        }}
                      >
                        {lm.grade || "-"}
                      </td>
                    </tr>
                  );
                }
                const mk =
                  subjectMarks.find((m) => m.student_id === st.id) || {};
                return (
                  <tr
                    key={st.id}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "var(--text-primary)",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {st.name}
                    </td>
                    <td style={{ padding: "8px 16px" }}>
                      <input
                        type="number"
                        max="30"
                        min="0"
                        defaultValue={mk.mid1_exam || ""}
                        onBlur={(e) =>
                          handleUpdateTheory(st.id, "mid1_exam", e.target.value)
                        }
                        onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                        style={inputStyle}
                      />
                    </td>
                    <td style={{ padding: "8px 16px" }}>
                      <input
                        type="number"
                        max="10"
                        min="0"
                        defaultValue={mk.mid1_assign || ""}
                        onBlur={(e) =>
                          handleUpdateTheory(
                            st.id,
                            "mid1_assign",
                            e.target.value,
                          )
                        }
                        onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                        style={inputStyle}
                      />
                    </td>
                    <td style={{ padding: "8px 16px" }}>
                      <input
                        type="number"
                        max="30"
                        min="0"
                        defaultValue={mk.mid2_exam || ""}
                        onBlur={(e) =>
                          handleUpdateTheory(st.id, "mid2_exam", e.target.value)
                        }
                        onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                        style={inputStyle}
                      />
                    </td>
                    <td style={{ padding: "8px 16px" }}>
                      <input
                        type="number"
                        max="10"
                        min="0"
                        defaultValue={mk.mid2_assign || ""}
                        onBlur={(e) =>
                          handleUpdateTheory(
                            st.id,
                            "mid2_assign",
                            e.target.value,
                          )
                        }
                        onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                        style={inputStyle}
                      />
                    </td>
                    <td style={{ padding: "8px 16px" }}>
                      <input
                        type="number"
                        max="60"
                        min="0"
                        defaultValue={mk.external || ""}
                        onBlur={(e) =>
                          handleUpdateTheory(st.id, "external", e.target.value)
                        }
                        onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                        style={inputStyle}
                      />
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontWeight: 600,
                        color: "var(--accent)",
                      }}
                    >
                      {mk.internal || 0}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                      }}
                    >
                      {mk.total || 0}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontWeight: 700,
                        color: mk.grade
                          ? mk.grade === "F"
                            ? "var(--accent-red)"
                            : "var(--accent-green)"
                          : "var(--text-muted)",
                      }}
                    >
                      {mk.grade || "-"}
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td
                    colSpan={isLab ? 10 : 9}
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      color: "var(--text-muted)",
                    }}
                  >
                    No students found in this course.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function MarksPage() {
  const { role } = useAuthStore();

  const [marks, setMarks] = useState([]);
  const [labMarks, setLabMarks] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === "student") {
      Promise.all([
        api.get("/marks/student/me"),
        api.get("/lab-marks/student/me"),
        api.get("/courses/subjects"),
      ])
        .then(([m, lm, subs]) => {
          setMarks(Array.isArray(m) ? m : []);
          setLabMarks(Array.isArray(lm) ? lm : []);
          setAllSubjects(Array.isArray(subs) ? subs : []);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [role]);

  if (loading)
    return (
      <div style={{ padding: 24 }}>
        <SkeletonCard />
      </div>
    );

  if (role === "faculty" || role === "admin") return <FacultyView />;
  return (
    <StudentView marks={marks} labMarks={labMarks} allSubjects={allSubjects} />
  );
}
