// DashboardPage.jsx — Role-aware dashboard with flattened data-fetching waterfalls.
// Student:  2 parallel waves instead of 3 (saves N round-trips via /attendance/my-summary)
// Faculty:  1 parallel wave after subject load (unchanged structure, already parallel)
// Admin:    unchanged

import { useEffect, useMemo, useRef, useState } from "react";
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
import { Card, SkeletonCard } from "@/components/ui";
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
import api from "@/lib/api";

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
        style={{ ...shimmer, width: size, height: size, borderRadius: "50%" }}
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

// ── Student Dashboard ──────────────────────────────────────────────────────
// WATERFALL BEFORE: subjects → recent-activity(N) → summaries(N)  = 3 rounds
// WATERFALL AFTER:  [subjects + marks] parallel → [recent + summaries-batch] parallel = 2 rounds

function StudentDashboard() {
  const { user, profile } = useAuthStore();
  const { fetchSubjects, fetchRecentActivity } = useAttendance();
  const { fetchAllMyMarks } = useMarks();

  const [subjects, setSubjects] = useState([]);
  const [summaries, setSummaries] = useState({}); // { [subject_id]: summary }
  const [allMarks, setAllMarks] = useState([]);
  const [recentActivity, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;
    if (loadedRef.current === user.id) return;
    loadedRef.current = user.id;

    async function load() {
      // ── Wave 1: subjects + marks (fully parallel) ──────────────────────
      const [subjectsResult, marksResult] = await Promise.all([
        fetchSubjects(),
        fetchAllMyMarks(),
      ]);

      const subs = subjectsResult.data ?? [];
      const marks = marksResult.data ?? [];
      setSubjects(subs);
      setAllMarks(marks);

      if (subs.length === 0) {
        setLoading(false);
        return;
      }

      // ── Wave 2: recent activity + ALL summaries in ONE batch call ──────
      // Old: N calls to /attendance/{id}/summary  → very slow
      // New: 1 call to /attendance/my-summary     → returns all at once
      const [recentResults, summaryBatch] = await Promise.all([
        // Recent activity: fetch per-subject but share one token round-trip via Promise.all
        Promise.all(
          subs.map((s) => fetchRecentActivity(s.id, "student", user.id)),
        ),
        // NEW: single batch endpoint
        api.get("/attendance/my-summary").catch(() => null),
      ]);

      // Merge recent activity
      const merged = recentResults
        .flatMap((r) => r.data ?? [])
        .sort((a, b) => String(b.date).localeCompare(String(a.date)))
        .slice(0, 10);
      setRecent(merged);

      // Batch summaries
      if (summaryBatch && typeof summaryBatch === "object") {
        setSummaries(summaryBatch);
      }

      setLoading(false);
    }

    load();
  }, [user?.id]);

  // ── Derived stats ────────────────────────────────────────────────────────
  const overallAttendance = useMemo(() => {
    const pcts = subjects.map((s) => summaries[s.id]?.percentage ?? 0);
    if (!pcts.length) return 0;
    return Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
  }, [subjects, summaries]);

  const avgScore = useMemo(() => {
    if (!allMarks.length) return 0;
    const pcts = allMarks.map((m) =>
      m.max_score > 0 ? Math.round((m.score / m.max_score) * 100) : 0,
    );
    return Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
  }, [allMarks]);

  const subjectMap = useMemo(
    () => Object.fromEntries(subjects.map((s) => [s.id, s])),
    [subjects],
  );

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
          subjectName: subjectMap[m.subject_id]?.name || m.subject_id,
          type: m.type,
          score: m.score,
          maxScore: m.max_score,
        })),
    [allMarks, subjectMap],
  );

  const totalWarnings = attendanceWarnings.length + marksWarnings.length;
  const firstName = profile?.name?.split(" ")[0] ?? "there";

  return (
    <div>
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
            fontSize: "0.9rem",
            color: "var(--text-muted)",
            margin: "4px 0 0",
          }}
        >
          {getFormattedDate()}
        </p>
      </div>

      {!loading && (
        <AtRiskBanner
          attendanceWarnings={attendanceWarnings}
          marksWarnings={marksWarnings}
        />
      )}

      {loading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
          style={{ marginBottom: 24 }}
        >
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
          style={{ marginBottom: 24 }}
        >
          <StatCard
            label="Attendance"
            value={`${overallAttendance}%`}
            sub={`across ${subjects.length} subjects`}
            icon={CalendarCheck}
            color={overallAttendance >= 75 ? "green" : "red"}
            trend={{
              direction: overallAttendance >= 75 ? "up" : "down",
              value: overallAttendance >= 75 ? "On track" : "Below threshold",
            }}
          />
          <StatCard
            label="Subjects"
            value={subjects.length}
            sub="enrolled this semester"
            icon={BookOpen}
            color="blue"
          />
          <StatCard
            label="Avg Score"
            value={`${avgScore}%`}
            sub="across all assessments"
            icon={ClipboardList}
            color={avgScore >= 60 ? "green" : avgScore >= 40 ? "amber" : "red"}
          />
          <StatCard
            label="At Risk"
            value={totalWarnings}
            sub={totalWarnings > 0 ? "subjects need attention" : "All clear"}
            icon={AlertTriangle}
            color={totalWarnings > 0 ? "red" : "green"}
          />
        </div>
      )}

      {/* Attendance rings */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StudentMarksCard compact={true} subjectMap={subjectMap} />
        <RecentActivity records={recentActivity} loading={loading} />
      </div>
    </div>
  );
}

// ── Faculty Dashboard ──────────────────────────────────────────────────────

function FacultyDashboard() {
  const { user, profile } = useAuthStore();
  const { fetchSubjects, fetchAttendanceSummary, fetchStudentsForSubject } =
    useAttendance();

  const [subjects, setSubjects] = useState([]);
  const [perSubjectStats, setPerSubjectStats] = useState({});
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalAtRisk, setTotalAtRisk] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef(null);

  const overallAvgAttendance = useMemo(() => {
    const vals = subjects.map((s) => perSubjectStats[s.id]?.avg ?? 0);
    if (!vals.length) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [subjects, perSubjectStats]);

  useEffect(() => {
    if (!user?.id) return;
    if (loadedRef.current === user.id) return;
    loadedRef.current = user.id;

    async function load() {
      const { data: subs } = await fetchSubjects();
      const subjectList = subs ?? [];
      setSubjects(subjectList);

      if (!subjectList.length) {
        setLoading(false);
        return;
      }

      // Parallel: summaries + student lists for all subjects at once
      const [summaryResults, studentResults] = await Promise.all([
        Promise.all(subjectList.map((s) => fetchAttendanceSummary(s.id))),
        Promise.all(subjectList.map((s) => fetchStudentsForSubject(s.id))),
      ]);

      const stats = {};
      const allStudentIds = new Set();
      const atRiskIds = new Set();

      subjectList.forEach((s, i) => {
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
      setSelectedSubject(subjectList[0]);
      setLoading(false);
    }

    load();
  }, [user?.id]);

  const firstName = profile?.name?.split(" ")[0] ?? "there";

  return (
    <div style={{ padding: "clamp(1rem, 2vw, 1.5rem)" }}>
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
            fontSize: "0.9rem",
            color: "var(--text-muted)",
            margin: "4px 0 0",
          }}
        >
          {getFormattedDate()}
        </p>
      </div>

      {loading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
          style={{ marginBottom: 24 }}
        >
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
          style={{ marginBottom: 24 }}
        >
          <StatCard
            label="My Subjects"
            value={subjects.length}
            sub="assigned this semester"
            icon={BookOpen}
            color="blue"
          />
          <StatCard
            label="Total Students"
            value={totalStudents}
            sub="across all subjects"
            icon={Users}
            color="default"
          />
          <StatCard
            label="Avg Attendance"
            value={`${overallAvgAttendance}%`}
            sub="across all classes"
            icon={CalendarCheck}
            color={overallAvgAttendance >= 75 ? "green" : "red"}
            trend={{
              direction: overallAvgAttendance >= 75 ? "up" : "down",
              value: overallAvgAttendance >= 75 ? "Healthy" : "Needs attention",
            }}
          />
          <StatCard
            label="At Risk Students"
            value={totalAtRisk}
            sub={
              totalAtRisk > 0
                ? "need immediate attention"
                : "All students on track"
            }
            icon={AlertTriangle}
            color={totalAtRisk > 0 ? "red" : "green"}
          />
        </div>
      )}

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
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
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
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
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

// ── Admin Dashboard ─────────────────────────────────────────────────────────

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
  const [allSummaries, setAllSummaries] = useState({});
  const [allMarksFlat, setAllMarksFlat] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef(null);

  const totalStudents = students.length;
  const totalFaculty = faculty.length;
  const totalSubjects = subjects.length;

  const overallAttendance = useMemo(() => {
    const avgs = subjects.map((s) => allSummaries[s.id]?.avg ?? 0);
    if (!avgs.length) return 0;
    return Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length);
  }, [subjects, allSummaries]);

  const marksAvg = useMemo(() => {
    const pcts = allMarksFlat
      .filter((m) => m.max_score > 0)
      .map((m) => Math.round((m.score / m.max_score) * 100));
    if (!pcts.length) return 0;
    return Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
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
    if (loadedRef.current === user.id) return;
    loadedRef.current = user.id;

    async function load() {
      const [subjectsResult, profilesResult] = await Promise.all([
        fetchSubjects(),
        fetchAllProfiles(),
      ]);

      const subs = subjectsResult.data ?? [];
      const allProfiles = profilesResult.data ?? [];
      setSubjects(subs);
      setStudents(allProfiles.filter((p) => p.role === "student"));
      setFaculty(allProfiles.filter((p) => p.role === "faculty"));

      if (!subs.length) {
        setLoading(false);
        return;
      }

      const [summaryResults, marksResults, trendResult] = await Promise.all([
        Promise.all(subs.map((s) => fetchAttendanceSummary(s.id))),
        Promise.all(subs.map((s) => fetchMarks(s.id))),
        fetchAttendanceTrend(),
      ]);

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

      const marks = [];
      subs.forEach((s, i) => {
        (marksResults[i].data ?? []).forEach((m) =>
          marks.push({ ...m, subjectName: s.name }),
        );
      });
      setAllMarksFlat(marks);
      setTrendData(trendResult.data ?? []);
      setLoading(false);
    }

    load();
  }, [user?.id]);

  const firstName = profile?.name?.split(" ")[0] ?? "there";

  return (
    <div style={{ padding: "clamp(1rem, 2vw, 1.5rem)" }}>
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
            fontSize: "0.9rem",
            color: "var(--text-muted)",
            margin: "4px 0 0",
          }}
        >
          System Overview · {getFormattedDate()}
        </p>
      </div>

      <SystemStats
        totalStudents={totalStudents}
        totalFaculty={totalFaculty}
        totalSubjects={totalSubjects}
        overallAttendance={overallAttendance}
        atRiskCount={atRiskCount}
        marksAvg={marksAvg}
        loading={loading}
      />

      <div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        style={{ marginBottom: 16 }}
      >
        <div className="lg:col-span-2">
          <AttendanceTrendChart data={trendData} loading={loading} />
        </div>
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
                return (
                  <div
                    key={s.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom:
                        i === subjects.length - 1
                          ? "none"
                          : "1px solid var(--border)",
                      borderRadius: 4,
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
  if (role === "faculty") return <FacultyDashboard />;
  if (role === "admin") return <AdminDashboard />;
  return <StudentDashboard />;
}
