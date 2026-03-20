// AttendancePage.jsx — Role-aware attendance page.
// Admin: summary + marker. Faculty: marker + summary. Student: summary + calendar.

import { useState, useEffect } from "react";
import { BookOpen, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useAttendance } from "@/hooks/useAttendance";
import AttendanceMarker from "@/components/attendance/AttendanceMarker";
import AttendanceSummary from "@/components/attendance/AttendanceSummary";
import AttendanceCalendar from "@/components/attendance/AttendanceCalendar";
import { EmptyState, SkeletonTable } from "@/components/ui";

const ROLE_SUBTITLE = {
  admin: "System-wide attendance overview",
  faculty: "Mark and review class attendance",
  student: "Your attendance record",
};

// Shared subject selector (native select, Input-style)
function SubjectSelect({ subjects, value, onChange, label = "Subject" }) {
  return (
    <div
      className="w-full sm:w-auto"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
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
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "var(--input-bg)",
          color: value ? "var(--text-primary)" : "var(--text-muted)",
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
          width: "100%",
        }}
      >
        <option value="">All subjects</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} ({s.code})
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Admin view ─────────────────────────────────────────────────
function AdminView({ subjects }) {
  const [selectedSubject, setSelectedSubject] = useState("");
  const selected = subjects.find((s) => s.id === selectedSubject);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SubjectSelect
        subjects={subjects}
        value={selectedSubject}
        onChange={setSelectedSubject}
        label="Filter by Subject"
      />
      <AttendanceSummary
        subjectId={selectedSubject || undefined}
        subjectName={selected?.name}
      />
      <AttendanceMarker />
    </div>
  );
}

// ── Faculty view ───────────────────────────────────────────────
function FacultyView({ subjects }) {
  // AttendanceMarker manages its own subject selector internally.
  // Here we show a summary below the marker once a subject is chosen.
  // We expose a separate selector so summary can be driven independently.
  const [selectedSubject, setSelectedSubject] = useState("");
  const selected = subjects.find((s) => s.id === selectedSubject);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <AttendanceMarker />
      {subjects.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SubjectSelect
            subjects={subjects}
            value={selectedSubject}
            onChange={setSelectedSubject}
            label="Review Subject"
          />
          {selectedSubject && (
            <AttendanceSummary
              subjectId={selectedSubject}
              subjectName={selected?.name}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── Student view ───────────────────────────────────────────────
function StudentView({ subjects, userId }) {
  const { fetchMyAttendanceHistory } = useAttendance();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [calRecords, setCalRecords] = useState([]);
  const [studentError, setStudentError] = useState(null);
  const today = new Date();
  const selected = subjects.find((s) => s.id === selectedSubject);

  // Auto-select first subject
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0].id);
    }
  }, [subjects]);

  // Fetch raw attendance records for the calendar whenever subject changes
  useEffect(() => {
    if (!selectedSubject || !userId) {
      setCalRecords([]);
      setStudentError(null);
      return;
    }
    setStudentError(null);
    fetchMyAttendanceHistory(selectedSubject)
      .then(({ data, error }) => {
        if (error) {
          setStudentError("Failed to load your attendance records.");
          setCalRecords([]);
        } else {
          setCalRecords(data ?? []);
        }
      })
      .catch((err) => {
        console.error(err);
        setStudentError(err.message || "Failed to load attendance.");
        setCalRecords([]);
      });
  }, [selectedSubject, userId]);

  if (studentError) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Something went wrong"
        description={studentError}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SubjectSelect
        subjects={subjects}
        value={selectedSubject}
        onChange={(val) => {
          setSelectedSubject(val);
          setCalRecords([]);
        }}
      />

      {selectedSubject && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <AttendanceSummary
            subjectId={selectedSubject}
            studentId={userId}
            subjectName={selected?.name}
          />
          <AttendanceCalendar
            records={calRecords}
            month={today.getMonth()}
            year={today.getFullYear()}
          />
        </div>
      )}

      {!selectedSubject && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--text-muted)",
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
          }}
        >
          Select a subject above to view your attendance.
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────

export default function AttendancePage() {
  const { user, role } = useAuthStore();
  const { fetchSubjects } = useAttendance();
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [pageError, setPageError] = useState(null);

  useEffect(() => {
    setPageError(null);
    fetchSubjects()
      .then(({ data, error }) => {
        setLoadingSubjects(false);
        if (error) {
          setPageError("Failed to load subjects.");
          setSubjects([]);
        } else {
          setSubjects(data ?? []);
        }
      })
      .catch((err) => {
        console.error(err);
        setPageError(err.message || "Failed to load subjects.");
        setLoadingSubjects(false);
        setSubjects([]);
      });
  }, []);

  if (pageError) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Something went wrong"
        description={pageError}
      />
    );
  }

  return (
    <div style={{ padding: "clamp(1rem, 2vw, 1.5rem)" }}>
      {/* ── Page title ── */}
      <div style={{ marginBottom: 28 }}>
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
          Attendance
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            color: "var(--text-muted)",
            margin: 0,
          }}
        >
          {ROLE_SUBTITLE[role] ?? ""}
        </p>
      </div>

      {/* ── Loading subjects ── */}
      {loadingSubjects && <SkeletonTable />}

      {!loadingSubjects && subjects.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No subjects found"
          description="No subjects are assigned yet."
        />
      )}

      {/* ── Role views ── */}
      {!loadingSubjects && subjects.length > 0 && role === "admin" && (
        <AdminView subjects={subjects} />
      )}
      {!loadingSubjects && subjects.length > 0 && role === "faculty" && (
        <FacultyView subjects={subjects} />
      )}
      {!loadingSubjects && subjects.length > 0 && role === "student" && (
        <StudentView subjects={subjects} userId={user?.id} />
      )}
    </div>
  );
}
