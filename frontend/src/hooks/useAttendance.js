import api from "@/lib/api";
import { supabase } from "@/lib/supabase";

export function useAttendance() {
  async function fetchSubjects() {
    try {
      const data = await api.get("/subjects/");
      return { data: Array.isArray(data) ? data : (data?.data ?? []), error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async function fetchAttendance(subjectId) {
    try {
      const data = await api.get(`/attendance/${subjectId}`);
      return { data: Array.isArray(data) ? data : (data?.data ?? []), error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async function fetchMyAttendanceHistory(subjectId) {
    try {
      const data = await api.get(`/attendance/${subjectId}/student/me`);
      return { data: Array.isArray(data) ? data : (data?.data ?? []), error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async function fetchStudentsForSubject(subjectId) {
    try {
      const data = await api.get(`/subjects/${subjectId}/students`);
      return { data: Array.isArray(data) ? data : (data?.data ?? []), error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async function markAttendance(records) {
    try {
      // The old frontend upsert passed an array of objects. FastAPI accepts one at a time via POST,
      // but wait, does our FastAPI POST "/" endpoint handle a single object or a list?
      // Our API POST `/attendance/` takes a single AttendanceCreate object.
      // So if 'records' is an array, we must map over them.
      for (const record of Array.isArray(records) ? records : [records]) {
        await api.post("/attendance/", record);
      }
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  async function fetchAttendanceSummary(subjectId, studentId) {
    try {
      const params = studentId ? { student_id: studentId } : {};
      const data = await api.get(`/attendance/${subjectId}/summary`, params);
      return { data: data || {}, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async function fetchStudentAttendance(subjectId, studentId) {
    try {
      const all = await api.get(`/attendance/${subjectId}`);
      const arr = Array.isArray(all) ? all : (all?.data ?? []);
      const data = arr.filter((r) => r.student_id === studentId);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async function fetchRecentActivity(subjectId, role, studentId) {
    try {
      if (!subjectId) {
        return { data: [], error: null };
      }

      if (role === "student") {
        const records = await api.get(`/attendance/${subjectId}/student/me`);
        const arr = Array.isArray(records) ? records : (records?.data ?? []);
        return { data: arr.slice(0, 10), error: null };
      }

      const records = await api.get(`/attendance/${subjectId}`);
      const arr = Array.isArray(records) ? records : (records?.data ?? []);
      const filtered =
        role === "faculty" && studentId
          ? arr.filter((r) => r.student_id === studentId)
          : arr;

      return { data: filtered.slice(0, 10), error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async function fetchAttendanceTrend(subjectId, days = 30) {
    try {
      const data = await api.get("/analytics/attendance-trend", {
        subject_id: subjectId,
        days,
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async function fetchAllProfiles() {
    try {
      const data = await api.get("/students/");
      return { data: Array.isArray(data) ? data : (data?.data ?? []), error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  function subscribeToAttendance(subjectId, date, onChange, onStatus) {
    const channel = supabase
      .channel("attendance-" + subjectId + "-" + date)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attendance",
          filter: "subject_id=eq." + subjectId,
        },
        onChange,
      )
      .subscribe((status) => {
        if (onStatus) onStatus(status);
      });
    return channel;
  }

  function unsubscribe(channel) {
    supabase.removeChannel(channel);
  }

  return {
    fetchSubjects,
    fetchAttendance,
    fetchMyAttendanceHistory,
    fetchStudentsForSubject,
    markAttendance,
    fetchAttendanceSummary,
    fetchStudentAttendance,
    fetchRecentActivity,
    fetchAttendanceTrend,
    fetchAllProfiles,
    subscribeToAttendance,
    unsubscribe,
  };
}
