// AttendanceMarker.jsx — Faculty/admin marks attendance for a class session.
// Role guard: only renders for faculty or admin.
// Realtime: subscribes to attendance changes while the form is open.

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useAttendance } from "@/hooks/useAttendance";
import { Card, Button, Input } from "@/components/ui";

// ── Helpers ────────────────────────────────────────────────────

function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function StudentAvatar({ name }) {
  return (
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
        userSelect: "none",
      }}
    >
      {initials(name)}
    </div>
  );
}

const STATUS_STYLES = {
  present: {
    bg: "var(--accent-green-bg)",
    border: "var(--accent-green-border)",
    color: "var(--accent-green)",
  },
  late: {
    bg: "var(--accent-amber-bg)",
    border: "var(--accent-amber-border)",
    color: "var(--accent-amber)",
  },
  absent: {
    bg: "var(--accent-red-bg)",
    border: "var(--accent-red-border)",
    color: "var(--accent-red)",
  },
};

const STATUS_LABELS = { present: "Present", late: "Late", absent: "Absent" };

function StatusPill({ status, selected, onClick }) {
  const styles = STATUS_STYLES[status];
  const active = selected === status;
  return (
    <button
      type="button"
      onClick={() => onClick(status)}
      style={{
        padding: "4px 11px",
        borderRadius: "999px",
        fontSize: "0.72rem",
        fontFamily: "var(--font-body)",
        fontWeight: 500,
        cursor: "pointer",
        outline: "none",
        transition: "all 150ms ease",
        background: active ? styles.bg : "var(--bg-elevated)",
        border: `1px solid ${active ? styles.border : "var(--border)"}`,
        color: active ? styles.color : "var(--text-muted)",
      }}
    >
      {STATUS_LABELS[status]}
    </button>
  );
}

// Styled native select matching Input.jsx appearance
function SubjectSelect({ subjects, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--text-muted)",
          display: "block",
        }}
      >
        Subject
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "var(--input-bg)",
          color: value ? "var(--text-primary)" : "var(--text-muted)",
          width: "100%",
          height: "42px",
          borderRadius: "10px",
          fontFamily: "var(--font-body)",
          fontSize: "0.9rem",
          border: "1px solid var(--input-border)",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
          padding: "0 14px",
          outline: "none",
          cursor: "pointer",
          boxSizing: "border-box",
          appearance: "none",
          WebkitAppearance: "none",
        }}
      >
        <option value="">Select subject...</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} ({s.code})
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────

export default function AttendanceMarker() {
  const { role } = useAuthStore();
  const {
    fetchSubjects,
    fetchAttendance,
    fetchStudentsForSubject,
    markAttendance,
    subscribeToAttendance,
    unsubscribe,
  } = useAttendance();

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // attendance map: { [student_id]: 'present' | 'late' | 'absent' }
  const [attendance, setAttendance] = useState({});
  const [students, setStudents] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successCount, setSuccessCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // 'live' | 'reconnecting' | null
  const [liveStatus, setLiveStatus] = useState(null);
  const channelRef = useRef(null);

  // Load subjects on mount
  useEffect(() => {
    fetchSubjects().then(({ data }) => setSubjects(data ?? []));
  }, []);

  // Realtime subscription — restart when subject or date changes
  useEffect(() => {
    if (!selectedSubject) return;

    if (channelRef.current) {
      unsubscribe(channelRef.current);
      channelRef.current = null;
    }

    const channel = subscribeToAttendance(
      selectedSubject,
      date,
      (payload) => {
        // Silently merge incoming changes from other faculty/admin
        const record = payload.new ?? payload.old;
        if (record?.student_id) {
          setAttendance((prev) => ({
            ...prev,
            [record.student_id]: record.status,
          }));
        }
      },
      (status) => {
        if (status === "SUBSCRIBED") setLiveStatus("live");
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setLiveStatus("reconnecting");
        }
      },
    );
    channelRef.current = channel;
    setLiveStatus("live");

    return () => {
      if (channelRef.current) {
        unsubscribe(channelRef.current);
        channelRef.current = null;
      }
      setLiveStatus(null);
    };
  }, [selectedSubject, date]);

  // Auto-dismiss success banner after 3 s
  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => setShowSuccess(false), 3000);
    return () => clearTimeout(t);
  }, [showSuccess]);

  // Role guard
  if (role !== "faculty" && role !== "admin") return null;

  async function handleLoadStudents() {
    if (!selectedSubject) return;
    setLoadingStudents(true);
    setLoaded(false);
    setError(null);

    const [studentsResult, attendanceResult] = await Promise.all([
      fetchStudentsForSubject(selectedSubject),
      fetchAttendance(selectedSubject, date),
    ]);

    setLoadingStudents(false);

    if (studentsResult.error) {
      setError("Failed to load students. Check your connection and try again.");
      return;
    }

    // Pre-fill attendance map with any existing records for this date
    const existing = {};
    for (const r of attendanceResult.data ?? []) {
      existing[r.student_id] = r.status;
    }

    setStudents(studentsResult.data ?? []);
    setAttendance(existing);
    setLoaded(true);
  }

  function setStatus(studentId, status) {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  }

  function markAll(status) {
    const all = {};
    students.forEach((s) => {
      all[s.id] = status;
    });
    setAttendance(all);
  }

  async function handleSave() {
    if (!selectedSubject || students.length === 0) return;
    setSaving(true);
    setError(null);

    const records = students
      .filter((s) => attendance[s.id])
      .map((s) => ({
        student_id: s.id,
        subject_id: selectedSubject,
        date,
        status: attendance[s.id],
      }));

    const { error: saveError } = await markAttendance(records);
    setSaving(false);

    if (saveError) {
      setError("Failed to save attendance. Please try again.");
      return;
    }

    setSuccessCount(records.length);
    setShowSuccess(true);
  }

  const unmarkedCount = students.filter((s) => !attendance[s.id]).length;

  return (
    <>
      <style>{`
        @keyframes att-live-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .att-live-dot { animation: att-live-pulse 2s ease-in-out infinite; }
      `}</style>

      <Card
        title="Mark Attendance"
        action={
          liveStatus ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                className="att-live-dot"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background:
                    liveStatus === "live"
                      ? "var(--accent-green)"
                      : "var(--accent-amber)",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: "0.75rem",
                  color:
                    liveStatus === "live"
                      ? "var(--accent-green)"
                      : "var(--accent-amber)",
                }}
              >
                {liveStatus === "live" ? "Live" : "Reconnecting..."}
              </span>
            </div>
          ) : null
        }
      >
        {/* ── Top controls row ── */}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "flex-end",
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <div style={{ flex: "1 1 180px" }}>
            <SubjectSelect
              subjects={subjects}
              value={selectedSubject}
              onChange={(val) => {
                setSelectedSubject(val);
                setLoaded(false);
              }}
            />
          </div>

          <div style={{ flex: "1 1 150px" }}>
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setLoaded(false);
              }}
            />
          </div>

          <div style={{ flexShrink: 0 }}>
            <Button
              variant="primary"
              onClick={handleLoadStudents}
              loading={loadingStudents}
              disabled={!selectedSubject}
            >
              Load Students
            </Button>
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
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
            {error}
          </div>
        )}

        {/* ── Success banner ── */}
        {showSuccess && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 8,
              background: "var(--accent-green-bg)",
              border: "1px solid var(--accent-green-border)",
              color: "var(--accent-green)",
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              marginBottom: 16,
            }}
          >
            Attendance saved — {successCount} records updated
          </div>
        )}

        {/* ── Empty enrolled state ── */}
        {loaded && students.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "var(--text-muted)",
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
            }}
          >
            No students enrolled in this subject.
          </div>
        )}

        {/* ── Student list + bulk actions ── */}
        {loaded && students.length > 0 && (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 4,
              }}
            >
              {students.map((student) => (
                <div
                  key={student.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <StudentAvatar name={student.name} />
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 500,
                        fontSize: "0.875rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      {student.name}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {["present", "late", "absent"].map((status) => (
                      <StatusPill
                        key={status}
                        status={status}
                        selected={attendance[student.id]}
                        onClick={(s) => setStatus(student.id, s)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Bulk action bar (sticky) ── */}
            <div
              style={{
                position: "sticky",
                bottom: 0,
                background: "var(--bg-surface)",
                borderTop: "1px solid var(--border)",
                paddingTop: 12,
                marginTop: 8,
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAll("present")}
              >
                Mark All Present
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAll("absent")}
              >
                Mark All Absent
              </Button>
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  flexShrink: 0,
                }}
              >
                {students.length} students
              </span>

              <div style={{ flexBasis: "100%", marginTop: 4 }}>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleSave}
                  loading={saving}
                >
                  {unmarkedCount > 0
                    ? `Save Attendance (${unmarkedCount} unmarked)`
                    : "Save Attendance"}
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </>
  );
}
