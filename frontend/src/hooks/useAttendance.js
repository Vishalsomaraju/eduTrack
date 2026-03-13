// useAttendance.js — The ONLY place Supabase is called for attendance.
// Components must never import supabase directly for attendance operations.

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

export function useAttendance() {
  const { user, role } = useAuthStore();

  // ── fetchSubjects ──────────────────────────────────────────────
  // Role-scoped: faculty sees their subjects, student sees enrolled
  // subjects, admin sees all.
  async function fetchSubjects() {
    if (role === "faculty") {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("faculty_id", user.id);
      return { data, error };
    }

    if (role === "student") {
      const { data: enrollData, error: enrollError } = await supabase
        .from("enrollments")
        .select("subject_id")
        .eq("student_id", user.id);
      if (enrollError) return { data: null, error: enrollError };

      const subjectIds = (enrollData ?? []).map((e) => e.subject_id);
      if (subjectIds.length === 0) return { data: [], error: null };

      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .in("id", subjectIds);
      return { data, error };
    }

    // admin — all subjects
    const { data, error } = await supabase.from("subjects").select("*");
    return { data, error };
  }

  // ── fetchAttendance ────────────────────────────────────────────
  // Returns all attendance rows for a given subject + date,
  // joined with student name from profiles.
  async function fetchAttendance(subjectId, date) {
    const { data, error } = await supabase
      .from("attendance")
      .select("*, profiles(name)")
      .eq("subject_id", subjectId)
      .eq("date", date);
    return { data, error };
  }

  // ── fetchStudentsForSubject ────────────────────────────────────
  // Returns the list of enrolled students (id, name, email) for a subject.
  async function fetchStudentsForSubject(subjectId) {
    const { data: enrollData, error: enrollError } = await supabase
      .from("enrollments")
      .select("student_id")
      .eq("subject_id", subjectId);
    if (enrollError) return { data: null, error: enrollError };

    const studentIds = (enrollData ?? []).map((e) => e.student_id);
    if (studentIds.length === 0) return { data: [], error: null };

    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email")
      .in("id", studentIds)
      .eq("role", "student");
    return { data, error };
  }

  // ── markAttendance ─────────────────────────────────────────────
  // Upserts a batch of attendance records. Re-marking the same
  // subject/student/date updates the existing row instead of inserting.
  async function markAttendance(records) {
    const { error } = await supabase
      .from("attendance")
      .upsert(records, { onConflict: "student_id,subject_id,date" });
    return { error };
  }

  // ── fetchAttendanceSummary ─────────────────────────────────────
  // Returns per-student summary: present/absent/late counts,
  // percentage, atRisk flag. Calculation happens in JS.
  // If studentId is provided, only that student's rows are processed.
  async function fetchAttendanceSummary(subjectId, studentId) {
    let query = supabase
      .from("attendance")
      .select("student_id, date, status, profiles(name)")
      .eq("subject_id", subjectId);

    if (studentId) {
      query = query.eq("student_id", studentId);
    }

    const { data, error } = await query;
    if (error) return { data: null, totalClasses: 0, error };

    const studentMap = {};
    const allDates = new Set();

    for (const row of data ?? []) {
      allDates.add(row.date);
      if (!studentMap[row.student_id]) {
        studentMap[row.student_id] = {
          id: row.student_id,
          name: row.profiles?.name ?? "Unknown",
          present: 0,
          absent: 0,
          late: 0,
        };
      }
      if (row.status === "present") studentMap[row.student_id].present++;
      else if (row.status === "absent") studentMap[row.student_id].absent++;
      else if (row.status === "late") studentMap[row.student_id].late++;
    }

    const totalClasses = allDates.size;

    const summary = Object.values(studentMap).map((s) => {
      // Late counts as attended for percentage calculation
      const attended = s.present + s.late;
      const percentage =
        totalClasses > 0 ? Math.round((attended / totalClasses) * 100) : 0;
      return {
        ...s,
        total: totalClasses,
        attended,
        percentage,
        atRisk: percentage < 75,
      };
    });

    return { data: summary, totalClasses, error: null };
  }

  // ── fetchStudentAttendance ─────────────────────────────────────
  // Returns raw { date, status } rows for one student in a subject.
  // Used by AttendanceCalendar to populate individual day cells.
  async function fetchStudentAttendance(subjectId, studentId) {
    const { data, error } = await supabase
      .from("attendance")
      .select("date, status")
      .eq("subject_id", subjectId)
      .eq("student_id", studentId);
    return { data, error };
  }

  // ── fetchRecentActivity ────────────────────────────────────────
  // Returns last 10 attendance records for a student across all
  // subjects, sorted by date desc. Used by the student dashboard.
  async function fetchRecentActivity(studentId) {
    const { data, error } = await supabase
      .from("attendance")
      .select("date, status, subjects!subject_id(name)")
      .eq("student_id", studentId)
      .order("date", { ascending: false })
      .limit(10);
    if (error) return { data: null, error };
    const records = (data ?? []).map((r) => ({
      date: r.date,
      status: r.status,
      subject_name: r.subjects?.name ?? "—",
    }));
    return { data: records, error: null };
  }

  // ── fetchAttendanceTrend ───────────────────────────────────────
  // Returns daily attendance percentage for the last 30 days, sorted
  // ascending by date. Groups rows in JS; Supabase does the date filter.
  // Returns: [{ date, percentage }]
  async function fetchAttendanceTrend() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const fromDate = thirtyDaysAgo.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("attendance")
      .select("date, status")
      .gte("date", fromDate)
      .order("date", { ascending: true });

    if (error) return { data: null, error };

    const dateMap = {};
    for (const row of data ?? []) {
      if (!dateMap[row.date]) {
        dateMap[row.date] = { total: 0, present: 0 };
      }
      dateMap[row.date].total++;
      if (row.status === "present" || row.status === "late") {
        dateMap[row.date].present++;
      }
    }

    const trend = Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { total, present }]) => ({
        date,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0,
      }));

    return { data: trend, error: null };
  }

  // ── fetchAllProfiles ───────────────────────────────────────────
  // Admin only — returns every profile in the system sorted by name.
  // Used to derive totalStudents, totalFaculty for admin dashboard.
  async function fetchAllProfiles() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email, role, avatar_url")
      .order("name", { ascending: true });
    return { data, error };
  }

  // ── subscribeToAttendance ──────────────────────────────────────
  // Opens a Realtime channel for a subject. Returns the channel so
  // the caller can clean it up with unsubscribe().
  // onStatus is optional — receives Supabase channel status strings.
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

  // ── unsubscribe ────────────────────────────────────────────────
  function unsubscribe(channel) {
    supabase.removeChannel(channel);
  }

  return {
    fetchSubjects,
    fetchAttendance,
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
