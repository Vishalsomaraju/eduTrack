import api from "@/lib/api";

export function computePercentage(score, maxScore) {
  if (!maxScore || maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
}

export function computeGrade(percentage) {
  if (percentage >= 90) return "O";
  if (percentage >= 75) return "A+";
  if (percentage >= 60) return "A";
  if (percentage >= 50) return "B+";
  if (percentage >= 40) return "B";
  return "F";
}

export function gradeBadgeVariant(grade) {
  if (grade === "O" || grade === "A+") return "green";
  if (grade === "A" || grade === "B+") return "blue";
  if (grade === "B") return "amber";
  return "red";
}

export function percentageColor(pct) {
  if (pct >= 75) return "var(--accent-green)";
  if (pct >= 60) return "var(--accent-amber)";
  return "var(--accent-red)";
}

export function useMarks() {
  async function fetchSubjects() {
    try {
      const data = await api.get("/subjects/");
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async function fetchMarks(subjectId) {
    try {
      const data = await api.get(`/marks/${subjectId}`);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async function fetchMyMarks(subjectId) {
    try {
      const all = await api.get("/marks/student/me");
      const data = (all || []).filter((m) => m.subject_id === subjectId);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async function fetchAllMyMarks() {
    try {
      const data = await api.get("/marks/student/me");
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async function upsertMark(data) {
    try {
      const res = await api.post("/marks/", data);
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  async function upsertBulkMarks(records) {
    try {
      for (const record of records) {
        await api.post("/marks/", record);
      }
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  async function fetchStudentsForSubject(subjectId) {
    try {
      const data = await api.get(`/subjects/${subjectId}/students`);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  return {
    fetchSubjects,
    fetchMarks,
    fetchMyMarks,
    fetchAllMyMarks,
    upsertMark,
    upsertBulkMarks,
    fetchStudentsForSubject,
  };
}
