// useMarks.js — The ONLY place Supabase is called for marks.
// Components must never import supabase directly for marks operations.
//
// Grade helpers are exported so all components share a single source of truth.

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

// ── Grade helpers (exported — used by all marks components) ────────────────
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

// Returns the Badge variant for a given grade string.
export function gradeBadgeVariant(grade) {
  if (grade === "O" || grade === "A+") return "green";
  if (grade === "A" || grade === "B+") return "blue";
  if (grade === "B") return "amber";
  return "red";
}

// Returns the CSS color token for a raw percentage value.
export function percentageColor(pct) {
  if (pct >= 75) return "var(--accent-green)";
  if (pct >= 60) return "var(--accent-amber)";
  return "var(--accent-red)";
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useMarks() {
  const { user, role } = useAuthStore();

  // ── fetchSubjects ──────────────────────────────────────────────────────
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

  // ── fetchMarks ─────────────────────────────────────────────────────────
  // Returns all marks for a subject joined with student name + email.
  // Sorted by student name (JS-side, as Supabase can't order on joined cols).
  async function fetchMarks(subjectId) {
    const { data, error } = await supabase
      .from("marks")
      .select("*, profiles!student_id(name, email)")
      .eq("subject_id", subjectId);

    if (error) return { data: null, error };

    const sorted = (data ?? []).sort((a, b) =>
      (a.profiles?.name ?? "").localeCompare(b.profiles?.name ?? ""),
    );
    return { data: sorted, error: null };
  }

  // ── fetchMyMarks ───────────────────────────────────────────────────────
  // For student role only — their marks in a specific subject.
  async function fetchMyMarks(subjectId) {
    const { data, error } = await supabase
      .from("marks")
      .select("*")
      .eq("student_id", user.id)
      .eq("subject_id", subjectId);
    return { data, error };
  }

  // ── fetchAllMyMarks ────────────────────────────────────────────────────
  // For student role only — all marks across all subjects.
  async function fetchAllMyMarks() {
    const { data, error } = await supabase
      .from("marks")
      .select("*, subjects(name, code)")
      .eq("student_id", user.id);
    return { data, error };
  }

  // ── upsertMark ─────────────────────────────────────────────────────────
  // Inserts or updates a single mark record.
  async function upsertMark({
    student_id,
    subject_id,
    type,
    score,
    max_score,
  }) {
    const { error } = await supabase
      .from("marks")
      .upsert(
        { student_id, subject_id, type, score, max_score },
        { onConflict: "student_id,subject_id,type" },
      );
    return { error };
  }

  // ── upsertBulkMarks ────────────────────────────────────────────────────
  // Inserts or updates many mark records in a single call.
  async function upsertBulkMarks(records) {
    const { error } = await supabase
      .from("marks")
      .upsert(records, { onConflict: "student_id,subject_id,type" });
    return { error };
  }

  // ── fetchStudentsForSubject ────────────────────────────────────────────
  // Returns enrolled students (id, name, email) for a subject.
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
