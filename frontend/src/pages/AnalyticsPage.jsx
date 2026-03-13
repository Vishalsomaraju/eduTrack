// AnalyticsPage.jsx — Role-aware analytics page.
// Admin + faculty: institution/class deep view.
// Student: personal academic analytics.

import { useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarCheck, ClipboardList } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useAttendance } from "@/hooks/useAttendance";
import { useMarks, computePercentage } from "@/hooks/useMarks";
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
        borderRadius: 9999,
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
  const { fetchSubjects, fetchAttendanceSummary, fetchAttendanceTrend } =
    useAttendance();
  const { fetchMarks } = useMarks();

  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [marksTypeFilter, setMarksTypeFilter] = useState("all");

  const [trendData, setTrendData] = useState([]);
  const [attendanceSummaries, setAttendanceSummaries] = useState({});
  const [attendanceData, setAttendanceData] = useState({});
  const [allMarksFlat, setAllMarksFlat] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [allStudents, setAllStudents] = useState([]);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Phase 1: parallel subjects + trend
      const [{ data: subs }, { data: trend }] = await Promise.all([
        fetchSubjects(),
        fetchAttendanceTrend(),
      ]);

      setTrendData(trend ?? []);
      const subjectList = subs ?? [];
      setSubjects(subjectList);

      if (subjectList.length === 0) {
        setLoading(false);
        return;
      }

      // Phase 2: per-subject summaries + marks in parallel
      const [summaryResults, marksResults] = await Promise.all([
        Promise.all(subjectList.map((s) => fetchAttendanceSummary(s.id))),
        Promise.all(subjectList.map((s) => fetchMarks(s.id))),
      ]);

      // Build attendance summaries map + avg data
      const summaries = {};
      const aData = {};
      subjectList.forEach((s, i) => {
        const sum = summaryResults[i].data ?? [];
        const avg =
          sum.length > 0
            ? Math.round(
                sum.reduce((acc, r) => acc + r.percentage, 0) / sum.length,
              )
            : 0;
        summaries[s.id] = { name: s.name, students: sum, avg };
        aData[s.id] = avg;
      });
      setAttendanceSummaries(summaries);
      setAttendanceData(aData);

      // Build flat marks array + per-subject average
      const mData = {};
      const flat = [];
      subjectList.forEach((s, i) => {
        const sMarks = marksResults[i].data ?? [];
        const enriched = sMarks.map((m) => ({ ...m, subjectName: s.name }));
        flat.push(...enriched);

        // Per-student avg % for this subject
        const byStudent = {};
        for (const m of sMarks) {
          if (!byStudent[m.student_id]) byStudent[m.student_id] = [];
          if (m.max_score > 0) {
            byStudent[m.student_id].push(
              computePercentage(m.score, m.max_score),
            );
          }
        }
        const avgs = Object.values(byStudent)
          .filter((p) => p.length > 0)
          .map((p) => Math.round(p.reduce((a, b) => a + b, 0) / p.length));
        mData[s.id] =
          avgs.length > 0
            ? Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length)
            : 0;
      });
      setAllMarksFlat(flat);
      setMarksData(mData);

      // Build students list from summaries (name) + marks (email supplement)
      const studentsMap = {};
      subjectList.forEach((s, i) => {
        const sum = summaryResults[i].data ?? [];
        sum.forEach((r) => {
          if (!studentsMap[r.id]) {
            studentsMap[r.id] = { id: r.id, name: r.name, email: "" };
          }
        });
      });
      flat.forEach((m) => {
        if (m.profiles?.name) {
          if (!studentsMap[m.student_id]) {
            studentsMap[m.student_id] = {
              id: m.student_id,
              name: m.profiles.name,
              email: m.profiles.email ?? "",
            };
          } else if (!studentsMap[m.student_id].email) {
            studentsMap[m.student_id].email = m.profiles.email ?? "";
          }
        }
      });
      setAllStudents(Object.values(studentsMap));

      setLoading(false);
    }
    load();
  }, []);

  // Filtered data based on subject + marks type filter
  const filteredMarks = useMemo(() => {
    let marks = allMarksFlat;
    if (selectedSubjectId) {
      marks = marks.filter((m) => m.subject_id === selectedSubjectId);
    }
    if (marksTypeFilter !== "all") {
      marks = marks.filter((m) => m.type === marksTypeFilter);
    }
    return marks;
  }, [allMarksFlat, selectedSubjectId, marksTypeFilter]);

  const filteredSummaries = useMemo(() => {
    if (!selectedSubjectId) return attendanceSummaries;
    const sub = attendanceSummaries[selectedSubjectId];
    return sub ? { [selectedSubjectId]: sub } : {};
  }, [attendanceSummaries, selectedSubjectId]);

  const comparisonSubjects = selectedSubjectId
    ? subjects.filter((s) => s.id === selectedSubjectId)
    : subjects;

  const selectedSubject =
    subjects.find((s) => s.id === selectedSubjectId) ?? null;

  const headerSub =
    role === "faculty"
      ? "Your classes performance insights"
      : "Institution-wide performance insights";

  return (
    <div>
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
        <FilterPill
          label="All Subjects"
          active={!selectedSubjectId}
          onClick={() => setSelectedSubjectId(null)}
        />
        {subjects.map((s) => (
          <FilterPill
            key={s.id}
            label={s.code}
            active={selectedSubjectId === s.id}
            onClick={() =>
              setSelectedSubjectId((id) => (id === s.id ? null : s.id))
            }
          />
        ))}
        <div
          style={{
            width: 1,
            height: 24,
            background: "var(--border)",
            margin: "0 4px",
          }}
        />
        <FilterPill
          label="All"
          active={marksTypeFilter === "all"}
          onClick={() => setMarksTypeFilter("all")}
        />
        <FilterPill
          label="Internal"
          active={marksTypeFilter === "internal"}
          onClick={() => setMarksTypeFilter("internal")}
        />
        <FilterPill
          label="Assignment"
          active={marksTypeFilter === "assignment"}
          onClick={() => setMarksTypeFilter("assignment")}
        />
      </div>

      {/* Row 1: Trend + Subject Comparison */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        style={{ marginBottom: 16 }}
      >
        <AttendanceTrendChart data={trendData} loading={loading} />
        <SubjectComparisonChart
          subjects={comparisonSubjects}
          attendanceData={attendanceData}
          marksData={marksData}
          loading={loading}
        />
      </div>

      {/* Row 2: Grade Distribution + Class Performance */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        style={{ marginBottom: 16 }}
      >
        <MarksDistributionChart marksData={filteredMarks} loading={loading} />
        <ClassPerformance
          subjectId={selectedSubject?.id ?? subjects[0]?.id}
          subjectName={selectedSubject?.name ?? subjects[0]?.name}
        />
      </div>

      {/* Row 3: Attendance Heatmap */}
      <div style={{ marginBottom: 16 }}>
        <AttendanceHeatmap data={trendData} loading={loading} />
      </div>

      {/* Row 4: At-Risk Table */}
      <div>
        <AtRiskTable
          attendanceSummaries={filteredSummaries}
          allMarks={filteredMarks}
          students={allStudents}
          loading={loading}
        />
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
  const [mySummaries, setMySummaries] = useState({}); // subjectId → summary row
  const [personalHeatmap, setPersonalHeatmap] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    async function load() {
      setLoading(true);

      // Phase 1: subjects + marks + attendance history in parallel
      const [{ data: subs }, { data: marksData }, { data: history }] =
        await Promise.all([
          fetchSubjects(),
          fetchAllMyMarks(),
          fetchMyAttendanceHistory(user.id),
        ]);

      const subjectList = subs ?? [];
      setSubjects(subjectList);
      setMyMarks(marksData ?? []);

      // Build personal heatmap from full history
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

      // Phase 2: per-subject attendance summaries (filtered to this student)
      const summaryResults = await Promise.all(
        subjectList.map((s) => fetchAttendanceSummary(s.id, user.id)),
      );

      const summaries = {};
      subjectList.forEach((s, i) => {
        const rows = summaryResults[i].data ?? [];
        // For a single student, rows[0] is the summary
        summaries[s.id] = rows[0] ?? null;
      });
      setMySummaries(summaries);

      setLoading(false);
    }
    load();
  }, [user?.id]);

  // Derived stats
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

  return (
    <div>
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

      {/* Stats row: 3 StatCards */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
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

      {/* Row 1: Subject selector + rings  |  Grade Distribution */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        style={{ marginBottom: 16 }}
      >
        {/* Subject selector + attendance ring */}
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

          {/* Subject pills */}
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

          {/* Attendance ring + marks summary for selected subject */}
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

        {/* Grade distribution */}
        <MarksDistributionChart marksData={myMarks} loading={loading} />
      </div>

      {/* Row 2: Personal Attendance Heatmap */}
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
