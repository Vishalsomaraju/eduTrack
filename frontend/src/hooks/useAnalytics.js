import api from "@/lib/api";

export async function fetchAttendanceTrend(subjectId, days = 30) {
  return await api.get("/analytics/attendance-trend", {
    subject_id: subjectId,
    days,
  });
}

export async function fetchGradeDistribution(subjectId) {
  return await api.get("/analytics/grade-distribution", {
    subject_id: subjectId,
  });
}

export async function fetchAtRiskStudents(subjectId) {
  return await api.get("/analytics/at-risk", { subject_id: subjectId });
}

export async function fetchSubjectComparison() {
  return await api.get("/analytics/subject-comparison");
}
