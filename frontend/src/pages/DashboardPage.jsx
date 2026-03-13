// DashboardPage.jsx — Role-aware dashboard.
// Student view: full personal dashboard with stats, rings, marks card, and activity.
// Faculty view: subject overview, quick attendance, grade distribution.
// Admin: "coming soon" stub (built next sprint).

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useAttendance } from "@/hooks/useAttendance";
import { useMarks } from "@/hooks/useMarks";
import { Card } from "@/components/ui";
import StatCard from "@/components/dashboard/StatCard";
import AttendanceRing from "@/components/dashboard/AttendanceRing";
import AtRiskBanner from "@/components/dashboard/AtRiskBanner";
import RecentActivity from "@/components/dashboard/RecentActivity";
import StudentMarksCard from "@/components/marks/StudentMarksCard";
import SubjectCard from "@/components/dashboard/SubjectCard";
import QuickMarkAttendance from "@/components/dashboard/QuickMarkAttendance";
import ClassPerformance from "@/components/dashboard/ClassPerformance";
import AttendanceSummary from "@/components/attendance/AttendanceSummary";

// ── Helpers ────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Stubs ──────────────────────────────────────────────────────────────────

function ComingSoonStub({ title }) {
  return (
    <div style={{ padding: "24px" }}>
      <Card title={title}>
        <div
          style={{
            padding: "48px 0",
            textAlign: "center",
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            color: "var(--text-muted)",
            fontStyle: "italic",
          }}
        >
          {title} — coming soon
        </div>
      </Card>
    </div>
  );
}

// ── Ring skeleton ──────────────────────────────────────────────────────────

function RingSkeleton({ size = 120 }) {
  const shimmer = {
    background:
      "linear-gradient(90deg, var(--bg-elevated) 0%, rgba(255,255,255,0.04) 50%, var(--bg-elevated) 100%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          ...shimmer,
          width: size,
          height: size,
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          ...shimmer,
          width: size * 0.7,
          height: 12,
          borderRadius: 4,
          marginTop: 10,
        }}
      />
      <div
        style={{
          ...shimmer,
          width: size * 0.4,
          height: 10,
          borderRadius: 4,
          marginTop: 4,
        }}
      />
    </div>
  );
}

// ── Student dashboard ──────────────────────────────────────────────────────

function StudentDashboard() {
  const { user, profile } = useAuthStore();
  const { fetchSubjects, fetchAttendanceSummary, fetchRecentActivity } =
    useAttendance();
  const { fetchAllMyMarks } = useMarks();

  const [subjects, setSubjects] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [allMarks, setAllMarks] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    async function loadData() {
      // Parallel first-wave fetches
      const [subjectsResult, marksResult, recentResult] = await Promise.all([
        fetchSubjects(),
        fetchAllMyMarks(),
        fetchRecentActivity(user.id),
      ]);

      const subs = subjectsResult.data ?? [];
      setSubjects(subs);
      setAllMarks(marksResult.data ?? []);
      setRecentActivity(recentResult.data ?? []);

      // Second wave — per-subject attendance summaries
      if (subs.length > 0) {
        const summaryResults = await Promise.all(
          subs.map((s) => fetchAttendanceSummary(s.id, user.id)),
        );
        const map = {};
        subs.forEach((s, i) => {
          const entry = summaryResults[i].data?.[0];
          if (entry) map[s.id] = entry;
        });
        setSummaries(map);
      }

      setLoading(false);
    }

    loadData();
  }, [user?.id]);

  // ── Derived stats ────────────────────────────────────────────────────
  const overallAttendance = useMemo(() => {
    const pcts = subjects.map((s) => summaries[s.id]?.percentage ?? 0);
    if (pcts.length === 0) return 0;
    return Math.round(pcts.reduce((sum, p) => sum + p, 0) / pcts.length);
  }, [subjects, summaries]);

  const totalSubjects = subjects.length;

  const avgScore = useMemo(() => {
    if (allMarks.length === 0) return 0;
    const pcts = allMarks.map((m) =>
      m.max_score > 0 ? Math.round((m.score / m.max_score) * 100) : 0,
    );
    return Math.round(pcts.reduce((sum, p) => sum + p, 0) / pcts.length);
  }, [allMarks]);

  const attendanceWarnings = useMemo(
    () =>
      subjects
        .filter((s) => (summaries[s.id]?.percentage ?? 0) < 75)
        .map((s) => ({
          subjectName: s.name,
          percentage: summaries[s.id]?.percentage ?? 0,
        })),
    [subjects, summaries],
  );

  const marksWarnings = useMemo(
    () =>
      allMarks
        .filter((m) => m.max_score > 0 && m.score / m.max_score < 0.4)
        .map((m) => ({
          subjectName: m.subjects?.name ?? "—",
          type: m.type,
          score: m.score,
          maxScore: m.max_score,
        })),
    [allMarks],
  );

  const totalWarnings = attendanceWarnings.length + marksWarnings.length;
  const firstName = profile?.name?.split(" ")[0] ?? "there";

  return (
    <div style={{ padding: "24px" }}>
      {/* ── Greeting header ───────────────────────────────────────── */}
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
          {getGreeting()}, {firstName} 👋
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            fontSize: "0.9rem",
            color: "var(--text-muted)",
            margin: "4px 0 0",
          }}
        >
          {getFormattedDate()}
        </p>
      </div>

      {/* ── At-risk banner ────────────────────────────────────────── */}
      {!loading && (
        <AtRiskBanner
          attendanceWarnings={attendanceWarnings}
          marksWarnings={marksWarnings}
        />
      )}

      {/* ── Stats row ─────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        style={{ marginBottom: 24 }}
      >
        <StatCard
          label="Attendance"
          value={loading ? "—" : `${overallAttendance}%`}
          sub={loading ? undefined : `across ${totalSubjects} subjects`}
          icon={CalendarCheck}
          color={
            loading ? "default" : overallAttendance >= 75 ? "green" : "red"
          }
          trend={
            loading
              ? undefined
              : {
                  direction: overallAttendance >= 75 ? "up" : "down",
                  value:
                    overallAttendance >= 75 ? "On track" : "Below threshold",
                }
          }
          loading={loading}
        />
        <StatCard
          label="Subjects"
          value={loading ? "—" : totalSubjects}
          sub="enrolled this semester"
          icon={BookOpen}
          color="blue"
          loading={loading}
        />
        <StatCard
          label="Avg Score"
          value={loading ? "—" : `${avgScore}%`}
          sub="across all assessments"
          icon={ClipboardList}
          color={
            loading
              ? "default"
              : avgScore >= 60
                ? "green"
                : avgScore >= 40
                  ? "amber"
                  : "red"
          }
          loading={loading}
        />
        <StatCard
          label="At Risk"
          value={loading ? "—" : totalWarnings}
          sub={totalWarnings > 0 ? "subjects need attention" : "All clear"}
          icon={AlertTriangle}
          color={loading ? "default" : totalWarnings > 0 ? "red" : "green"}
          loading={loading}
        />
      </div>

      {/* ── Attendance rings ──────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--text-primary)",
            margin: "0 0 16px",
          }}
        >
          Attendance by Subject
        </h2>

        {loading ? (
          <div
            style={{
              display: "flex",
              gap: 16,
              overflowX: "auto",
              paddingBottom: 8,
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <RingSkeleton key={i} />
            ))}
          </div>
        ) : subjects.length === 0 ? (
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
            No enrolled subjects
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              gap: 16,
              overflowX: "auto",
              paddingBottom: 8,
            }}
          >
            {subjects.map((s) => (
              <AttendanceRing
                key={s.id}
                percentage={summaries[s.id]?.percentage ?? 0}
                subjectName={s.name}
                subjectCode={s.code}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom two-column grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StudentMarksCard compact={true} />
        <RecentActivity records={recentActivity} loading={loading} />
      </div>
    </div>
  );
}

// ── Subject card skeleton (used in faculty loading state) ──────────────────

function SubjectCardSkeleton() {
  const shimmer = {
    background:
      "linear-gradient(90deg, var(--bg-elevated) 0%, rgba(255,255,255,0.04) 50%, var(--bg-elevated) 100%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
    borderRadius: 4,
  };
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: 20,
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              ...shimmer,
              height: 22,
              width: 60,
              borderRadius: 999,
              marginBottom: 10,
            }}
          />
          <div
            style={{ ...shimmer, height: 18, width: "80%", marginBottom: 6 }}
          />
          <div style={{ ...shimmer, height: 14, width: "50%" }} />
        </div>
        <div
          style={{ ...shimmer, width: 80, height: 80, borderRadius: "50%" }}
        />
      </div>
      <div style={{ ...shimmer, height: 1, margin: "12px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ ...shimmer, height: 14, width: 90 }} />
        <div style={{ ...shimmer, height: 14, width: 70 }} />
      </div>
    </div>
  );
}

// ── Faculty dashboard ───────────────────────────────────────────────────────

function FacultyDashboard() {
  const { user, profile } = useAuthStore();
  const {
    fetchSubjects,
    fetchAttendanceSummary,
    fetchStudentsForSubject,
  } = useAttendance();

  const [subjects, setSubjects] = useState([]);
  const [perSubjectStats, setPerSubjectStats] = useState({});
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalAtRisk, setTotalAtRisk] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  const overallAvgAttendance = useMemo(() => {
    const vals = subjects.map((s) => perSubjectStats[s.id]?.avg ?? 0);
    if (vals.length === 0) return 0;
    return Math.round(vals.reduce((sum, v) => sum + v, 0) / vals.length);
  }, [subjects, perSubjectStats]);

  useEffect(() => {
    if (!user?.id) return;

    async function load() {
      const subjectsResult = await fetchSubjects();
      const subs = subjectsResult.data ?? [];
      setSubjects(subs);

      if (subs.length === 0) {
        setLoading(false);
        return;
      }

      // Parallel: per-subject summaries + enrolled student lists
      const [summaryResults, studentResults] = await Promise.all([
        Promise.all(subs.map((s) => fetchAttendanceSummary(s.id))),
        Promise.all(subs.map((s) => fetchStudentsForSubject(s.id))),
      ]);

      const stats = {};
      const allStudentIds = new Set();
      const atRiskIds = new Set();

      subs.forEach((s, i) => {
        const summary = summaryResults[i].data ?? [];
        const students = studentResults[i].data ?? [];

        const avg =
          summary.length > 0
            ? Math.round(
                summary.reduce((sum, st) => sum + st.percentage, 0) /
                  summary.length,
              )
            : 0;
        const atRisk = summary.filter((st) => st.atRisk).length;

        students.forEach((st) => allStudentIds.add(st.id));
        summary.filter((st) => st.atRisk).forEach((st) => atRiskIds.add(st.id));

        stats[s.id] = { avg, count: students.length, atRisk };
      });

      setPerSubjectStats(stats);
      setTotalStudents(allStudentIds.size);
      setTotalAtRisk(atRiskIds.size);
      setSelectedSubject(subs[0]);
      setLoading(false);
    }

    load();
  }, [user?.id]);

  const firstName = profile?.name?.split(" ")[0] ?? "there";
  const totalSubjects = subjects.length;

  return (
    <div style={{ padding: 24 }}>
      {/* ── Greeting ──────────────────────────────────────────────── */}
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
          {getGreeting()}, {firstName} 👋
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            fontSize: "0.9rem",
            color: "var(--text-muted)",
            margin: "4px 0 0",
          }}
        >
          {getFormattedDate()}
        </p>
      </div>

      {/* ── Stats row ─────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        style={{ marginBottom: 24 }}
      >
        <StatCard
          label="My Subjects"
          value={loading ? "—" : totalSubjects}
          sub="assigned this semester"
          icon={BookOpen}
          color="blue"
          loading={loading}
        />
        <StatCard
          label="Total Students"
          value={loading ? "—" : totalStudents}
          sub="across all subjects"
          icon={Users}
          color="default"
          loading={loading}
        />
        <StatCard
          label="Avg Attendance"
          value={loading ? "—" : `${overallAvgAttendance}%`}
          sub="across all classes"
          icon={CalendarCheck}
          color={
            loading ? "default" : overallAvgAttendance >= 75 ? "green" : "red"
          }
          trend={
            loading
              ? undefined
              : {
                  direction: overallAvgAttendance >= 75 ? "up" : "down",
                  value:
                    overallAvgAttendance >= 75
                      ? "Healthy"
                      : "Needs attention",
                }
          }
          loading={loading}
        />
        <StatCard
          label="At Risk Students"
          value={loading ? "—" : totalAtRisk}
          sub={
            totalAtRisk > 0
              ? "need immediate attention"
              : "All students on track"
          }
          icon={AlertTriangle}
          color={loading ? "default" : totalAtRisk > 0 ? "red" : "green"}
          loading={loading}
        />
      </div>

      {/* ── My Classes ────────────────────────────────────────────── */}
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "1rem",
          color: "var(--text-primary)",
          margin: "0 0 16px",
        }}
      >
        My Classes
      </h2>

      {loading ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          style={{ marginBottom: 24 }}
        >
          {[0, 1, 2].map((i) => (
            <SubjectCardSkeleton key={i} />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            color: "var(--text-muted)",
            fontStyle: "italic",
            textAlign: "center",
            padding: "24px 0",
            marginBottom: 24,
          }}
        >
          No subjects assigned
        </p>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          style={{ marginBottom: 24 }}
        >
          {subjects.map((s) => (
            <SubjectCard
              key={s.id}
              subject={s}
              attendanceAvg={perSubjectStats[s.id]?.avg ?? 0}
              studentCount={perSubjectStats[s.id]?.count ?? 0}
              atRiskCount={perSubjectStats[s.id]?.atRisk ?? 0}
              onClick={() => setSelectedSubject(s)}
              selected={selectedSubject?.id === s.id}
            />
          ))}
        </div>
      )}

      {/* ── Quick actions + performance (two column) ──────────────── */}
      {!loading && subjects.length > 0 && (
        <>
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            style={{ marginBottom: 16 }}
          >
            <QuickMarkAttendance subjects={subjects} />
            <ClassPerformance
              subjectId={selectedSubject?.id}
              subjectName={selectedSubject?.name}
            />
          </div>

          {/* ── Full-width attendance summary ───────────────────── */}
          {selectedSubject && (
            <AttendanceSummary
              subjectId={selectedSubject.id}
              subjectName={selectedSubject.name}
            />
          )}
        </>
      )}
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { role } = useAuthStore();

  if (role === "faculty") {
    return <FacultyDashboard />;
  }

  if (role === "admin") {
    return <ComingSoonStub title="Admin Dashboard" />;
  }

  return <StudentDashboard />;
}
