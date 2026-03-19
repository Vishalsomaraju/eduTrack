// SystemStats.jsx — Institution-wide summary row of 6 stat cards.
// Used only in the admin dashboard.
//
// Props:
//   totalStudents     — number
//   totalFaculty      — number
//   totalSubjects     — number
//   overallAttendance — number (mean % across all subjects)
//   atRiskCount       — number (unique students flagged)
//   marksAvg          — number (mean score % across all marks)
//   loading           — bool

import {
  AlertTriangle,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  UserCheck,
  Users,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

export default function SystemStats({
  totalStudents = 0,
  totalFaculty = 0,
  totalSubjects = 0,
  overallAttendance = 0,
  atRiskCount = 0,
  marksAvg = 0,
  loading = false,
}) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3"
      style={{ marginBottom: 24 }}
    >
      <StatCard
        label="Total Students"
        value={loading ? "—" : totalStudents}
        icon={Users}
        color="default"
        loading={loading}
      />

      <StatCard
        label="Faculty Members"
        value={loading ? "—" : totalFaculty}
        icon={UserCheck}
        color="blue"
        loading={loading}
      />

      <StatCard
        label="Active Subjects"
        value={loading ? "—" : totalSubjects}
        icon={BookOpen}
        color="blue"
        loading={loading}
      />

      <StatCard
        label="Avg Attendance"
        value={loading ? "—" : `${overallAttendance}%`}
        icon={CalendarCheck}
        color={loading ? "default" : overallAttendance >= 75 ? "green" : "red"}
        trend={
          loading
            ? undefined
            : {
                direction: overallAttendance >= 75 ? "up" : "down",
                value:
                  overallAttendance >= 75
                    ? "Institution healthy"
                    : "Needs attention",
              }
        }
        loading={loading}
      />

      <StatCard
        label="At Risk"
        value={loading ? "—" : atRiskCount}
        sub={
          loading
            ? undefined
            : atRiskCount > 0
              ? "students flagged"
              : "All clear"
        }
        icon={AlertTriangle}
        color={loading ? "default" : atRiskCount > 0 ? "red" : "green"}
        loading={loading}
      />

      <StatCard
        label="Avg Marks"
        value={loading ? "—" : `${marksAvg}%`}
        sub="across all assessments"
        icon={ClipboardList}
        color={
          loading
            ? "default"
            : marksAvg >= 60
              ? "green"
              : marksAvg >= 40
                ? "amber"
                : "red"
        }
        loading={loading}
      />
    </div>
  );
}
