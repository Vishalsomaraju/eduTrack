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
import AtRiskTable from "@/components/dashboard/AtRiskTable";
import SystemStats from "@/components/dashboard/SystemStats";
import AttendanceTrendChart from "@/components/dashboard/AttendanceTrendChart";

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

// ── Admin dashboard ─────────────────────────────────────────────────────────

function AdminDashboard() {
  const { user, profile } = useAuthStore();
  const {
    fetchSubjects,
    fetchAttendanceSummary,
    fetchAttendanceTrend,
    fetchAllProfiles,
  } = useAttendance();
  const { fetchMarks } = useMarks();

  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  // { [subjectId]: { name, students: summaryArray, avg } }
  const [allSummaries, setAllSummaries] = useState({});
  // flat mark records, each enriched with subjectName
  const [allMarksFlat, setAllMarksFlat] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Derived stats ──────────────────────────────────────────────
  const totalStudents = students.length;
  const totalFaculty = faculty.length;
  const totalSubjects = subjects.length;

  const overallAttendance = useMemo(() => {
    const avgs = subjects.map((s) => allSummaries[s.id]?.avg ?? 0);
    if (avgs.length === 0) return 0;
    return Math.round(avgs.reduce((sum, v) => sum + v, 0) / avgs.length);
  }, [subjects, allSummaries]);

  const marksAvg = useMemo(() => {
    const pcts = allMarksFlat
      .filter((m) => m.max_score > 0)
      .map((m) => Math.round((m.score / m.max_score) * 100));
    if (pcts.length === 0) return 0;
    return Math.round(pcts.reduce((sum, p) => sum + p, 0) / pcts.length);
  }, [allMarksFlat]);

  const atRiskCount = useMemo(() => {
    const ids = new Set();
    Object.values(allSummaries).forEach(({ students: sums = [] }) => {
      sums.filter((s) => s.atRisk).forEach((s) => ids.add(s.id));
    });
    allMarksFlat
      .filter((m) => m.max_score > 0 && m.score / m.max_score < 0.4)
      .forEach((m) => ids.add(m.student_id));
    return ids.size;
  }, [allSummaries, allMarksFlat]);

  useEffect(() => {
    if (!user?.id) return;

    async function load() {
      // Step 1: base data in parallel
      const [subjectsResult, profilesResult] = await Promise.all([
        fetchSubjects(),
        fetchAllProfiles(),
      ]);

      const subs = subjectsResult.data ?? [];
      const allProfiles = profilesResult.data ?? [];
      setSubjects(subs);
      setStudents(allProfiles.filter((p) => p.role === "student"));
      setFaculty(allProfiles.filter((p) => p.role === "faculty"));

      if (subs.length === 0) {
        setLoading(false);
        return;
      }

      // Step 2: per-subject summaries + marks + trend in parallel
      const [summaryResults, marksResults, trendResult] = await Promise.all([
        Promise.all(subs.map((s) => fetchAttendanceSummary(s.id))),
        Promise.all(subs.map((s) => fetchMarks(s.id))),
        fetchAttendanceTrend(),
      ]);

      // Build summaries map
      const summaries = {};
      subs.forEach((s, i) => {
        const data = summaryResults[i].data ?? [];
        const avg =
          data.length > 0
            ? Math.round(
                data.reduce((sum, st) => sum + st.percentage, 0) / data.length,
              )
            : 0;
        summaries[s.id] = { name: s.name, students: data, avg };
      });
      setAllSummaries(summaries);

      // Build flat marks array enriched with subject name
      const marks = [];
      subs.forEach((s, i) => {
        const data = marksResults[i].data ?? [];
        data.forEach((m) => marks.push({ ...m, subjectName: s.name }));
      });
      setAllMarksFlat(marks);

      setTrendData(trendResult.data ?? []);
      setLoading(false);
    }

    load();
  }, [user?.id]);

  const firstName = profile?.name?.split(" ")[0] ?? "there";

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
          System Overview · {getFormattedDate()}
        </p>
      </div>

      {/* ── System stats row ──────────────────────────────────────── */}
      <SystemStats
        totalStudents={totalStudents}
        totalFaculty={totalFaculty}
        totalSubjects={totalSubjects}
        overallAttendance={overallAttendance}
        atRiskCount={atRiskCount}
        marksAvg={marksAvg}
        loading={loading}
      />

      {/* ── Two-column: trend chart + subjects list ────────────────── */}
      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        style={{ marginBottom: 16 }}
      >
        {/* Left (span 2): attendance trend */}
        <div className="lg:col-span-2">
          <AttendanceTrendChart data={trendData} loading={loading} />
        </div>

        {/* Right (span 1): subjects overview */}
        <Card title="Subjects Overview">
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    height: 48,
                    borderRadius: 6,
                    background:
                      "linear-gradient(90deg, var(--bg-elevated) 0%, rgba(255,255,255,0.04) 50%, var(--bg-elevated) 100%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
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
              No subjects found
            </p>
          ) : (
            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {subjects.map((s, i) => {
                const avg = allSummaries[s.id]?.avg ?? 0;
                const avgColor =
                  avg >= 75
                    ? "var(--accent-green)"
                    : avg >= 60
                      ? "var(--accent-amber)"
                      : "var(--accent-red)";
                const isLast = i === subjects.length - 1;
                return (
                  <div
                    key={s.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: isLast ? "none" : "1px solid var(--border)",
                      transition: "background 150ms ease",
                      borderRadius: 4,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--accent-subtle)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          color: "var(--text-primary)",
                        }}
                      >
                        {s.name}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          letterSpacing: "0.05em",
                          color: "var(--accent-blue)",
                          background: "var(--accent-blue-bg)",
                          border: "1px solid var(--accent-blue-border)",
                          borderRadius: 999,
                          padding: "1px 7px",
                        }}
                      >
                        {s.code}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        color: avgColor,
                      }}
                    >
                      {avg}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ── At-risk table (full width) ─────────────────────────────── */}
      <AtRiskTable
        attendanceSummaries={allSummaries}
        allMarks={allMarksFlat}
        students={students}
        loading={loading}
      />
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
    return <AdminDashboard />;
  }

  return <StudentDashboard />;
}
