// QuickMarkAttendance.jsx — Compact attendance marking widget for faculty dashboard.
// Marks today's attendance for a selected subject via pill + student list.
//
// Props:
//   subjects — [{ id, name, code }]

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { useAttendance } from "@/hooks/useAttendance";
import { Button, Card } from "@/components/ui";

const TODAY = new Date().toISOString().split("T")[0];

const todayFormatted = new Date().toLocaleDateString("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const STATUS_LABELS = ["P", "L", "A"];
const STATUS_VALUES = ["present", "late", "absent"];
const STATUS_COLORS = {
  present: "var(--accent-green)",
  late: "var(--accent-amber)",
  absent: "var(--accent-red)",
};

// ── Shimmer skeleton ────────────────────────────────────────────────────────
const shimmerStyle = {
  background:
    "linear-gradient(90deg, var(--bg-elevated) 0%, rgba(255,255,255,0.04) 50%, var(--bg-elevated) 100%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
};

function initials(name) {
  return (name ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// ── Main component ──────────────────────────────────────────────────────────
export default function QuickMarkAttendance({ subjects = [] }) {
  const { fetchStudentsForSubject, fetchAttendance, markAttendance } =
    useAttendance();

  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [students, setStudents] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  // When subject changes: fetch students + today's existing marks
  useEffect(() => {
    if (!selectedSubjectId) {
      setStudents([]);
      setStatusMap({});
      return;
    }

    setLoadingStudents(true);
    Promise.all([
      fetchStudentsForSubject(selectedSubjectId),
      fetchAttendance(selectedSubjectId, TODAY),
    ]).then(([studsResult, existingResult]) => {
      const studs = studsResult.data ?? [];
      const existing = existingResult.data ?? [];

      const map = {};
      studs.forEach((s) => {
        const rec = existing.find((r) => r.student_id === s.id);
        map[s.id] = rec?.status ?? null;
      });

      setStudents(studs);
      setStatusMap(map);
      setLoadingStudents(false);
    });
  }, [selectedSubjectId]);

  function setStatus(studentId, status) {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
  }

  function markAllPresent() {
    const map = {};
    students.forEach((s) => (map[s.id] = "present"));
    setStatusMap(map);
  }

  async function handleSave() {
    setSaving(true);
    const records = students
      .filter((s) => statusMap[s.id] != null)
      .map((s) => ({
        student_id: s.id,
        subject_id: selectedSubjectId,
        date: TODAY,
        status: statusMap[s.id],
      }));

    const { error } = await markAttendance(records);
    setSaving(false);

    if (!error) {
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    }
  }

  return (
    <Card
      title="Quick Attendance"
      action={
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
          }}
        >
          {todayFormatted}
        </span>
      }
    >
      {/* ── Subject selector pills ───────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 4,
          marginBottom: 16,
        }}
      >
        {subjects.map((s) => {
          const active = selectedSubjectId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedSubjectId(s.id)}
              style={{
                background: active
                  ? "var(--accent-subtle)"
                  : "var(--bg-elevated)",
                border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                color: active ? "var(--accent)" : "var(--text-muted)",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "0.8rem",
                borderRadius: 999,
                padding: "6px 12px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                transition: "all 150ms ease",
              }}
            >
              {s.name}
            </button>
          );
        })}
      </div>

      {/* ── Content area ─────────────────────────────────────────── */}
      {!selectedSubjectId ? (
        /* Empty state: no subject selected */
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
          <Calendar
            size={28}
            style={{ color: "var(--text-muted)", opacity: 0.5 }}
          />
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              color: "var(--text-muted)",
              fontStyle: "italic",
              textAlign: "center",
            }}
          >
            Select a subject to mark today&apos;s attendance
          </span>
        </div>
      ) : loadingStudents ? (
        /* Skeleton rows while loading students */
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "8px 0",
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{ ...shimmerStyle, height: 36, borderRadius: 8 }}
            />
          ))}
        </div>
      ) : students.length === 0 ? (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            color: "var(--text-muted)",
            fontStyle: "italic",
            textAlign: "center",
            padding: "24px 0",
          }}
        >
          No students enrolled
        </p>
      ) : (
        <>
          {/* ── Student rows ────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              marginBottom: 16,
              maxHeight: 280,
              overflowY: "auto",
            }}
          >
            {students.map((student) => {
              const current = statusMap[student.id];
              return (
                <div
                  key={student.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "6px 0",
                  }}
                >
                  {/* Avatar initials */}
                  <div
                    style={{
                      width: 24,
                      height: 24,
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
                    {initials(student.name)}
                  </div>

                  {/* Student name */}
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 500,
                      fontSize: "0.85rem",
                      color: "var(--text-primary)",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {student.name}
                  </span>

                  {/* P / L / A toggle buttons */}
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    {STATUS_LABELS.map((label, idx) => {
                      const val = STATUS_VALUES[idx];
                      const active = current === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setStatus(student.id, val)}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            border: `1px solid ${
                              active ? STATUS_COLORS[val] : "var(--border)"
                            }`,
                            background: active
                              ? STATUS_COLORS[val] + "22"
                              : "var(--bg-elevated)",
                            color: active
                              ? STATUS_COLORS[val]
                              : "var(--text-muted)",
                            fontFamily: "var(--font-body)",
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 120ms ease",
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Footer: mark all + save ──────────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 12,
              borderTop: "1px solid var(--border)",
            }}
          >
            <Button variant="ghost" size="sm" onClick={markAllPresent}>
              Mark All Present
            </Button>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {savedMsg && (
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.8rem",
                    color: "var(--accent-green)",
                    fontWeight: 500,
                  }}
                >
                  Saved ✓
                </span>
              )}
              <Button
                variant="primary"
                size="sm"
                loading={saving}
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
