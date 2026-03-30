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
import api from "@/lib/api";
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

function RingSkeleton({ size = 120 }) {
  const s = {
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
      <div style={{ ...s, width: size, height: size, borderRadius: "50%" }} />
      <div
        style={{
          ...s,
          width: size * 0.7,
          height: 12,
          borderRadius: 4,
          marginTop: 10,
        }}
      />
      <div
        style={{
          ...s,
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
  const s = {
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
              ...s,
              height: 22,
              width: 60,
              borderRadius: 999,
              marginBottom: 10,
            }}
          />
          <div style={{ ...s, height: 18, width: "80%", marginBottom: 6 }} />
          <div style={{ ...s, height: 14, width: "50%" }} />
        </div>
        <div style={{ ...s, width: 80, height: 80, borderRadius: "50%" }} />
      </div>
      <div style={{ ...s, height: 1, margin: "12px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ ...s, height: 14, width: 90 }} />
        <div style={{ ...s, height: 14, width: 70 }} />
      </div>
    </div>
  );
}

// ── Student Dashboard ──────────────────────────────────────────────────────

function StudentDashboard() {
  const { user, profile } = useAuthStore();
  const { fetchSubjects, fetchRecentActivity } = useAttendance();
  const { fetchAllMyMarks } = useMarks();

  const [subjects, setSubjects] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [allMarks, setAllMarks] = useState([]);
  const [recentActivity, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef(null);

  useEffect(() => {
    if (!user?.id || loadedRef.current === user.id) return;
    loadedRef.current = user.id;

    async function load() {
      const [subjectsResult, marksResult] = await Promise.all([
        fetchSubjects(),
        fetchAllMyMarks(),
      ]);
      const subs = subjectsResult.data ?? [];
      const marks = marksResult.data ?? [];
      setSubjects(subs);
      setAllMarks(marks);
      if (!subs.length) {
        setLoading(false);
        return;
      }

      // /attendance/my-summary = 1 call replacing N summary calls
      const [recentResults, summaryBatch] = await Promise.all([
        Promise.all(
          subs.map((s) => fetchRecentActivity(s.id, "student", user.id)),
        ),
        api.get("/attendance/my-summary").catch(() => null),
      ]);

      setRecent(
        recentResults
          .flatMap((r) => r.data ?? [])
          .sort((a, b) => String(b.date).localeCompare(String(a.date)))
          .slice(0, 10),
      );
      if (summaryBatch && typeof summaryBatch === "object")
        setSummaries(summaryBatch);
      setLoading(false);
    }
    load();
  }, [user?.id]);

  const overallAttendance = useMemo(() => {
    const pcts = subjects.map((s) => summaries[s.id]?.percentage ?? 0);
    return pcts.length
      ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length)
      : 0;
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
    return vals.length
      ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
      : 0;
  }, [subjects, perSubjectStats]);

  useEffect(() => {
    if (!user?.id || loadedRef.current === user.id) return;
    loadedRef.current = user.id;

    async function load() {
      const { data: subs } = await fetchSubjects();
      const subjectList = subs ?? [];
      setSubjects(subjectList);
      if (!subjectList.length) {
        setLoading(false);
        return;
      }

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
        students.forEach((st) => allStudentIds.add(st.id));
        summary.filter((st) => st.atRisk).forEach((st) => atRiskIds.add(st.id));
        stats[s.id] = {
          avg,
          count: students.length,
          atRisk: summary.filter((st) => st.atRisk).length,
        };
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
// BEFORE: N×/attendance/{id}/summary (400 Bad Request) + N×/marks/{id} = 2N broken calls
// AFTER:  /analytics/subject-comparison (1 call) returns avg_attendance + avg_marks per subject

function AdminDashboard() {
  const { user, profile } = useAuthStore();
  const { fetchSubjects, fetchAllProfiles } = useAttendance();

  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [comparisonData, setComparison] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef(null);

  const overallAttendance = useMemo(() => {
    if (!comparisonData.length) return 0;
    const avgs = comparisonData.map((s) => s.avg_attendance ?? 0);
    return Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length);
  }, [comparisonData]);

  const marksAvg = useMemo(() => {
    const avgs = comparisonData
      .filter((s) => s.avg_marks > 0)
      .map((s) => s.avg_marks);
    return avgs.length
      ? Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length)
      : 0;
  }, [comparisonData]);

  const atRiskCount = useMemo(
    () => comparisonData.filter((s) => s.avg_attendance < 75).length,
    [comparisonData],
  );

  useEffect(() => {
    if (!user?.id || loadedRef.current === user.id) return;
    loadedRef.current = user.id;

    async function load() {
      // Wave 1: subjects + profiles
      const [subjectsResult, profilesResult, facultyRes] = await Promise.all([
        fetchSubjects(),
        fetchAllProfiles(),
        api.get("/faculty"),
      ]);
      const subs = subjectsResult.data ?? [];
      const allProfiles = profilesResult.data ?? [];
      setSubjects(subs);
      setStudents(allProfiles.filter((p) => p.role === "student"));
      setFaculty(facultyRes || []);

      // Wave 2: subject-comparison replaces N attendance + N marks calls
      const firstSubjectId = subs[0]?.id;
      const [compRes, trendRes] = await Promise.all([
        api.get("/analytics/subject-comparison").catch(() => []),
        firstSubjectId
          ? api
              .get("/analytics/attendance-trend", {
                subject_id: firstSubjectId,
                days: 30,
              })
              .catch(() => [])
          : Promise.resolve([]),
      ]);

      setComparison(Array.isArray(compRes) ? compRes : []);
      setTrendData(Array.isArray(trendRes) ? trendRes : []);
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
        totalStudents={students.length}
        totalFaculty={faculty.length}
        totalSubjects={subjects.length}
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
          ) : comparisonData.length === 0 ? (
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
              No data yet
            </p>
          ) : (
            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {comparisonData.map((s, i) => {
                const avg = s.avg_attendance ?? 0;
                const avgColor =
                  avg >= 75
                    ? "var(--accent-green)"
                    : avg >= 60
                      ? "var(--accent-amber)"
                      : "var(--accent-red)";
                return (
                  <div
                    key={s.subject_id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom:
                        i === comparisonData.length - 1
                          ? "none"
                          : "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          color: "var(--text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.subject_name}
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
                          flexShrink: 0,
                        }}
                      >
                        {s.subject_code}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        color: avgColor,
                        flexShrink: 0,
                        marginLeft: 8,
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

      <AtRiskTable data={[]} loading={loading} />
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
