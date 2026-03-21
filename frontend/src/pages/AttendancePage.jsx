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
  const { fetchMyAttendanceHistory, fetchAttendanceSummary } = useAttendance();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [studentError, setStudentError] = useState(null);
  const [calMonth, setCalMonth] = useState(() => new Date());
  const selected = subjects.find((s) => s.id === selectedSubject);

  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) setSelectedSubject(subjects[0].id);
  }, [subjects, selectedSubject]);

  useEffect(() => {
    if (!selectedSubject || !userId) {
      setRecords([]);
      setSummary(null);
      setStudentError(null);
      return;
    }
    setStudentError(null);

    // Records — array
    fetchMyAttendanceHistory(selectedSubject)
      .then(({ data, error }) => {
        if (error) throw new Error(error.message);
        const arr = Array.isArray(data) ? data : (data?.data ?? []);
        setRecords(arr);
      })
      .catch((err) => {
        console.error(err);
        setStudentError(err.message || "Failed to load attendance records.");
        setRecords([]);
      });

    // Summary — object
    fetchAttendanceSummary(selectedSubject, userId)
      .then(({ data, error }) => {
        if (!error) setSummary(data || {});
      })
      .catch(console.error);

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

  // Safe wrapper for all array operations
  const safeRecords = Array.isArray(records) ? records : [];

  useEffect(() => {
    if (safeRecords.length > 0) {
      const latest = safeRecords[0]; // already sorted desc
      const d = new Date(latest.date + 'T00:00:00');
      setCalMonth(d);
    }
  }, [safeRecords]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <select
        value={selectedSubject}
        onChange={(e) => {
          setSelectedSubject(e.target.value);
          setRecords([]);
          setSummary(null);
        }}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'var(--input-bg)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.95rem',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <option value="">Select subject...</option>
        {subjects.map(s => (
          <option key={s.id} value={s.id}>
            {s.name} ({s.code})
          </option>
        ))}
      </select>

      {selectedSubject && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "clamp(1rem, 2vw, 1.5rem)" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)", marginBottom: 16 }}>Attendance Summary</h3>
            {summary ? (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
                 <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px' }}>
                   <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 8, fontWeight: 600 }}>TOTAL CLASSES</div>
                   <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>{summary.total || summary.total_classes || 0}</div>
                 </div>
                 <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px' }}>
                   <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 8, fontWeight: 600 }}>ATTENDANCE %</div>
                   <div style={{ fontSize: "1.75rem", fontWeight: 700, color: (summary.percentage || 0) >= 75 ? "var(--accent-green)" : "var(--accent-red)", lineHeight: 1 }}>{summary.percentage || 0}%</div>
                 </div>
                 <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px' }}>
                   <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 8, fontWeight: 600 }}>PRESENT</div>
                   <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--accent-green)", lineHeight: 1 }}>{summary.present || 0}</div>
                 </div>
                 <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px' }}>
                   <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 8, fontWeight: 600 }}>ABSENT</div>
                   <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--accent-red)", lineHeight: 1 }}>{summary.absent || 0}</div>
                 </div>
                 <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px' }}>
                   <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>LATE</div>
                   <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-amber)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                     {summary?.late ?? 0}
                   </div>
                 </div>
               </div>
            ) : (
               <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Loading summary...</div>
            )}
            <div style={{ marginTop: 24 }}>
              <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: 12 }}>Recent Records</h4>
              <div style={{ overflow: "hidden", borderRadius: 8, border: "1px solid var(--border)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                      <th style={{ padding: "8px 12px", fontWeight: 600, color: "var(--text-secondary)" }}>Date</th>
                      <th style={{ padding: "8px 12px", fontWeight: 600, color: "var(--text-secondary)" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeRecords.length > 0 ? safeRecords.slice(0, 5).map((r, i) => (
                      <tr key={i} style={{ borderBottom: i < Math.min(safeRecords.length, 5) - 1 ? "1px solid var(--border)" : "none" }}>
                        <td style={{ padding: "8px 12px", color: "var(--text-primary)" }}>{new Date(r.date).toLocaleDateString()}</td>
                        <td style={{ padding: "8px 12px" }}>
                           <span style={{ 
                             color: r.status === "present" ? "var(--accent-green)" : r.status === "late" ? "var(--accent-amber)" : "var(--accent-red)", 
                             fontWeight: 600, 
                           }}>
                             {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                           </span>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={2} style={{ padding: "12px", textAlign: "center", color: "var(--text-muted)" }}>No records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <AttendanceCalendar records={safeRecords} month={calMonth.getMonth()} year={calMonth.getFullYear()} />
        </div>
      )}

      {!selectedSubject && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontFamily: "var(--font-body)", fontSize: "0.9rem" }}>
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
          const list = Array.isArray(data) ? data : (data?.data ?? []);
          setSubjects(list);
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
    <div>
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
