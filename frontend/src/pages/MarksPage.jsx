// MarksPage.jsx — Role-aware marks page.
// Admin:   top subject selector + two-column layout (entry | table)
// Faculty: top subject selector + full-width entry + table below
// Student: StudentMarksCard, no selector needed

import { useEffect, useState } from "react";
import { BarChart2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useMarks } from "@/hooks/useMarks";
import MarksEntry from "@/components/marks/MarksEntry";
import MarksTable from "@/components/marks/MarksTable";
import StudentMarksCard from "@/components/marks/StudentMarksCard";
import { EmptyState, SkeletonTable } from "@/components/ui";

const SUBTITLE = {
  admin: "Enter and review marks across all subjects",
  faculty: "Enter marks for your classes",
  student: "Your academic performance",
};

// ── Shared subject selector dropdown ──────────────────────────────────────
function SubjectSelector({ value, onChange, subjects, loading }) {
  if (loading) {
    return (
      <div
        className="w-full sm:w-auto"
        style={{
          height: 42,
          width: "100%",
          maxWidth: 280,
          borderRadius: 10,
          background:
            "linear-gradient(90deg, var(--bg-elevated) 0%, rgba(255,255,255,0.04) 50%, var(--bg-elevated) 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
        }}
      />
    );
  }

  if (subjects.length === 0) {
    return (
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.875rem",
          color: "var(--text-muted)",
          fontStyle: "italic",
        }}
      >
        No subjects found.
      </span>
    );
  }

  return (
    <select
      className="w-full sm:w-auto"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: "var(--input-bg)",
        color: "var(--text-primary)",
        border: "1px solid var(--input-border)",
        borderRadius: 10,
        height: 42,
        padding: "0 14px",
        fontFamily: "var(--font-body)",
        fontSize: "0.875rem",
        outline: "none",
        cursor: "pointer",
        width: "100%",
        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
      }}
    >
      {subjects.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name} ({s.code})
        </option>
      ))}
    </select>
  );
}

// ── Page header ────────────────────────────────────────────────────────────
function PageHeader({ role }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "1.5rem",
          color: "var(--text-primary)",
          margin: 0,
          letterSpacing: "-0.02em",
        }}
      >
        Marks
      </h1>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.9rem",
          color: "var(--text-muted)",
          margin: "4px 0 0",
        }}
      >
        {SUBTITLE[role]}
      </p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function MarksPage() {
  const { role } = useAuthStore();
  const { fetchSubjects } = useMarks();

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  useEffect(() => {
    // Students don't need a subject selector — skip the fetch
    if (role === "student") {
      setLoadingSubjects(false);
      return;
    }

    fetchSubjects().then(({ data }) => {
      setLoadingSubjects(false);
      const list = data ?? [];
      setSubjects(list);
      if (list.length > 0) setSelectedSubject(list[0].id);
    });
  }, [role]);

  // ── Student view ──────────────────────────────────────────────────────
  if (role === "student") {
    return (
      <div style={{ padding: "24px" }}>
        <PageHeader role="student" />
        <StudentMarksCard compact={false} />
      </div>
    );
  }

  // ── Admin view ─────────────────────────────────────────────────────────
  if (role === "admin") {
    return (
      <div style={{ padding: "24px" }}>
        <PageHeader role="admin" />

        {/* Subject selector */}
        <div style={{ marginBottom: 24 }}>
          <SubjectSelector
            value={selectedSubject}
            onChange={setSelectedSubject}
            subjects={subjects}
            loading={loadingSubjects}
          />
        </div>

        {loadingSubjects && <SkeletonTable />}

        {!loadingSubjects && subjects.length === 0 && (
          <EmptyState
            icon={BarChart2}
            title="No marks recorded"
            description="Marks will appear here once entered."
          />
        )}

        {!loadingSubjects && selectedSubject && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            <MarksEntry subjectId={selectedSubject} />
            <MarksTable subjectId={selectedSubject} />
          </div>
        )}
      </div>
    );
  }

  // ── Faculty view ───────────────────────────────────────────────────────
  return (
    <div style={{ padding: "24px" }}>
      <PageHeader role="faculty" />

      {/* Subject selector */}
      <div style={{ marginBottom: 24 }}>
        <SubjectSelector
          value={selectedSubject}
          onChange={setSelectedSubject}
          subjects={subjects}
          loading={loadingSubjects}
        />
      </div>

      {loadingSubjects && <SkeletonTable />}

      {!loadingSubjects && subjects.length === 0 && (
        <EmptyState
          icon={BarChart2}
          title="No marks recorded"
          description="Marks will appear here once entered."
        />
      )}

      {!loadingSubjects && selectedSubject && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <MarksEntry subjectId={selectedSubject} />
          <MarksTable subjectId={selectedSubject} />
        </div>
      )}
    </div>
  );
}
