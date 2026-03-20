import { useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarCheck, ClipboardList } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useAttendance } from "@/hooks/useAttendance";
import { useMarks, computePercentage } from "@/hooks/useMarks";
import {
  fetchAttendanceTrend,
  fetchGradeDistribution,
  fetchAtRiskStudents,
  fetchSubjectComparison,
} from "@/hooks/useAnalytics";

import AttendanceTrendChart from "@/components/dashboard/AttendanceTrendChart";
import ClassPerformance from "@/components/dashboard/ClassPerformance";
import AtRiskTable from "@/components/dashboard/AtRiskTable";
import AttendanceRing from "@/components/dashboard/AttendanceRing";
import StatCard from "@/components/dashboard/StatCard";
import SubjectComparisonChart from "@/components/analytics/SubjectComparisonChart";
import AttendanceHeatmap from "@/components/analytics/AttendanceHeatmap";
import MarksDistributionChart from "@/components/analytics/MarksDistributionChart";

// ── Shared pill helper ────────────────────────────────────────────────────────

function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 14px",
        borderRadius: "var(--radius-pill)",
        fontFamily: "var(--font-body)",
        fontSize: "0.8rem",
        fontWeight: 500,
        cursor: "pointer",
        border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
        background: active ? "var(--accent-subtle)" : "transparent",
        color: active ? "var(--accent)" : "var(--text-muted)",
        transition: "all 150ms ease",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

// ── Admin + Faculty View ──────────────────────────────────────────────────────

function AdminFacultyAnalytics({ role }) {
  const { fetchSubjects } = useAttendance();

  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);

  // Data states from unified analytics hooks
  const [trendData, setTrendData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [atRiskData, setAtRiskData] = useState([]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const { data: subs } = await fetchSubjects();
      const subjectList = subs ?? [];
      setSubjects(subjectList);
      if (subjectList.length > 0) {
        setSelectedSubjectId(subjectList[0].id);
      }
      setLoading(false);
    }
    init();
  }, []);

  // Fetch subject comparison once
  useEffect(() => {
    fetchSubjectComparison().then(setComparisonData).catch(console.error);
  }, []);

  // Fetch subject-specific analytics when selectedSubjectId changes
  useEffect(() => {
    if (!selectedSubjectId) return;
    setLoading(true);

    Promise.all([
      fetchAttendanceTrend(selectedSubjectId),
      fetchGradeDistribution(selectedSubjectId),
      fetchAtRiskStudents(selectedSubjectId),
    ])
      .then(([trend, dist, risk]) => {
        setTrendData(trend ?? []);
        setDistributionData(dist ?? []);
        setAtRiskData(risk ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedSubjectId]);

  const selectedSubject =
    subjects.find((s) => s.id === selectedSubjectId) ?? subjects[0];

  const headerSub =
    role === "faculty"
      ? "Your classes performance insights"
      : "Institution-wide performance insights";

  return (
    <div style={{ padding: "clamp(1rem, 2vw, 1.5rem)" }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1.5rem",
            color: "var(--text-primary)",
            margin: "0 0 4px",
          }}
        >
          Analytics
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            color: "var(--text-muted)",
            margin: 0,
          }}
        >
          {headerSub}
        </p>
      </div>

      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {subjects.map((s) => (
          <FilterPill
            key={s.id}
            label={s.code}
            active={selectedSubjectId === s.id}
            onClick={() => setSelectedSubjectId(s.id)}
          />
        ))}
      </div>

      {/* Row 1: Trend + Subject Comparison */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        style={{ marginBottom: 16 }}
      >
        <AttendanceTrendChart data={trendData} loading={loading} />
        <SubjectComparisonChart
          data={comparisonData}
          loading={!comparisonData.length}
        />
      </div>

      {/* Row 2: Grade Distribution + Class Performance */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        style={{ marginBottom: 16 }}
      >
        <MarksDistributionChart data={distributionData} loading={loading} />
        <ClassPerformance
          subjectId={selectedSubject?.id}
          subjectName={selectedSubject?.name}
        />
      </div>

      {/* Row 3: Attendance Heatmap */}
      <div style={{ marginBottom: 16 }}>
        <AttendanceHeatmap data={trendData} loading={loading} />
      </div>

      {/* Row 4: At-Risk Table */}
      <div>
        <AtRiskTable data={atRiskData} loading={loading} />
      </div>
    </div>
  );
}

// ── Student View ──────────────────────────────────────────────────────────────

function StudentAnalytics() {
  const { user } = useAuthStore();
  const { fetchSubjects, fetchAttendanceSummary, fetchMyAttendanceHistory } =
    useAttendance();
  const { fetchAllMyMarks } = useMarks();

  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);

  const [myMarks, setMyMarks] = useState([]);
  const [mySummaries, setMySummaries] = useState({});
  const [personalHeatmap, setPersonalHeatmap] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    async function load() {
      setLoading(true);

      const [{ data: subs }, { data: marksData }, { data: history }] =
        await Promise.all([
          fetchSubjects(),
          fetchAllMyMarks(),
          fetchMyAttendanceHistory(user.id), // No wait, student just needs history for heatmap
        ]);

      const subjectList = subs ?? [];
      setSubjects(subjectList);
      setMyMarks(marksData ?? []);

      const dateMap = {};
      for (const row of history ?? []) {
        if (!dateMap[row.date]) dateMap[row.date] = { total: 0, present: 0 };
        dateMap[row.date].total++;
        if (row.status === "present" || row.status === "late") {
          dateMap[row.date].present++;
        }
      }
      const heatmap = Object.entries(dateMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, { total, present }]) => ({
          date,
          percentage: total > 0 ? Math.round((present / total) * 100) : 0,
        }));
      setPersonalHeatmap(heatmap);

      if (subjectList.length > 0) {
        setSelectedSubjectId(subjectList[0].id);
      }

      const summaryResults = await Promise.all(
        subjectList.map((s) => fetchAttendanceSummary(s.id, user.id)),
      );

      const summaries = {};
      subjectList.forEach((s, i) => {
        summaries[s.id] = summaryResults[i].data ?? null;
      });
      setMySummaries(summaries);

      setLoading(false);
    }
    load();
  }, [user?.id]);

  const { overallAttendance, marksAvg } = useMemo(() => {
    const summaryRows = Object.values(mySummaries).filter(Boolean);
    const overallAttendance =
      summaryRows.length > 0
        ? Math.round(
            summaryRows.reduce((a, s) => a + s.percentage, 0) /
              summaryRows.length,
          )
        : 0;

    const pcts = myMarks
      .filter((m) => m.max_score > 0)
      .map((m) => computePercentage(m.score, m.max_score));
    const marksAvg =
      pcts.length > 0
        ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length)
        : 0;

    return { overallAttendance, marksAvg };
  }, [mySummaries, myMarks]);

  const selectedSummary = mySummaries[selectedSubjectId] ?? null;
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
  const myMarksDist = myMarks.length > 0 ? myMarks : [];

  return (
    <div style={{ padding: "clamp(1rem, 2vw, 1.5rem)" }}>
      <div style={{ marginBottom: 24 }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1.5rem",
            color: "var(--text-primary)",
            margin: "0 0 4px",
          }}
        >
          My Analytics
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            color: "var(--text-muted)",
            margin: 0,
          }}
        >
          Your personal academic performance
        </p>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        style={{ marginBottom: 24 }}
      >
        <StatCard
          label="Overall Attendance"
          value={loading ? "—" : `${overallAttendance}%`}
          icon={CalendarCheck}
          color={
            loading ? "default" : overallAttendance >= 75 ? "green" : "red"
          }
          loading={loading}
        />
        <StatCard
          label="Academic Score"
          value={loading ? "—" : `${marksAvg}%`}
          icon={ClipboardList}
          color={
            loading
              ? "default"
              : marksAvg >= 75
                ? "green"
                : marksAvg >= 60
                  ? "amber"
                  : "red"
          }
          loading={loading}
        />
        <StatCard
          label="Subjects Enrolled"
          value={loading ? "—" : subjects.length}
          icon={BookOpen}
          color="blue"
          loading={loading}
        />
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        style={{ marginBottom: 16 }}
      >
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "var(--text-primary)",
              marginBottom: 14,
            }}
          >
            Attendance by Subject
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 64,
                      height: 28,
                      borderRadius: 9999,
                      background:
                        "linear-gradient(90deg, var(--bg-elevated) 0%, rgba(255,255,255,0.04) 50%, var(--bg-elevated) 100%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s infinite",
                    }}
                  />
                ))
              : subjects.map((s) => (
                  <FilterPill
                    key={s.id}
                    label={s.code}
                    active={selectedSubjectId === s.id}
                    onClick={() => setSelectedSubjectId(s.id)}
                  />
                ))}
          </div>

          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "24px 0",
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(90deg, var(--bg-elevated) 0%, rgba(255,255,255,0.04) 50%, var(--bg-elevated) 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              />
            </div>
          ) : selectedSummary ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              <AttendanceRing
                percentage={selectedSummary.percentage}
                subjectName={selectedSubject?.name ?? ""}
                subjectCode={selectedSubject?.code ?? ""}
                size={120}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  fontFamily: "var(--font-body)",
                }}
              >
                {[
                  {
                    label: "Present",
                    value: selectedSummary.present,
                    color: "var(--accent-green)",
                  },
                  {
                    label: "Late",
                    value: selectedSummary.late,
                    color: "var(--accent-amber)",
                  },
                  {
                    label: "Absent",
                    value: selectedSummary.absent,
                    color: "var(--accent-red)",
                  },
                  {
                    label: "Total classes",
                    value: selectedSummary.total,
                    color: "var(--text-muted)",
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                    >
                      {label}:
                    </span>
                    <span
                      style={{ fontSize: "0.9rem", fontWeight: 600, color }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 120,
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                color: "var(--text-muted)",
                fontStyle: "italic",
              }}
            >
              No attendance data for this subject
            </div>
          )}
        </div>

        <MarksDistributionChart marksData={myMarksDist} loading={loading} />
      </div>

      <div>
        <AttendanceHeatmap data={personalHeatmap} loading={loading} />
      </div>
    </div>
  );
}

// ── Default export: role router ───────────────────────────────────────────────

export default function AnalyticsPage() {
  const { role } = useAuthStore();

  if (role === "student") return <StudentAnalytics />;
  return <AdminFacultyAnalytics role={role} />;
}
