/**
 * csvExport.js — Client-side CSV generation utilities.
 * No backend needed — works from data already in component state.
 *
 * Usage:
 *   import { downloadCSV, buildMarksCSV, buildAttendanceCSV } from "@/lib/csvExport";
 *   downloadCSV(buildMarksCSV(students, marks), "marks_CS401PC.csv");
 */

// ── Core download trigger ─────────────────────────────────────────

/**
 * Converts a 2D array to a CSV string and triggers a file download.
 * @param {string[][]} rows  - Array of arrays (first row = headers)
 * @param {string}     filename
 */
export function downloadCSV(rows, filename) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const val = cell === null || cell === undefined ? "" : String(cell);
          // Wrap in quotes if contains comma, newline, or double-quote
          return /[,\n"]/.test(val) ? `"${val.replace(/"/g, '""')}"` : val;
        })
        .join(","),
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// ── Filename helpers ──────────────────────────────────────────────

export function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// ── MARKS — Faculty / Admin view ──────────────────────────────────
/**
 * Export marks for a subject (faculty view — all students).
 *
 * @param {object[]} students    - [{id, name}]
 * @param {object[]} subjectMarks - array of mark rows from API
 * @param {string}   subjectCode
 * @returns {string[][]}
 */
export function buildFacultyMarksCSV(students, subjectMarks, subjectCode) {
  const marksMap = Object.fromEntries(
    subjectMarks.map((m) => [m.student_id, m]),
  );

  const headers = [
    "Student Name",
    "Mid-1 Exam (30)",
    "Mid-1 Assign (10)",
    "Mid-1 Total (40)",
    "Mid-2 Exam (30)",
    "Mid-2 Assign (10)",
    "Mid-2 Total (40)",
    "Internal (40)",
    "External (60)",
    "Total (100)",
    "Grade",
  ];

  const rows = students.map((stu) => {
    const m = marksMap[stu.id];
    if (!m) {
      return [stu.name, ...Array(10).fill("—")];
    }
    const mid1_total = (m.mid1_exam || 0) + (m.mid1_assign || 0);
    const mid2_total = (m.mid2_exam || 0) + (m.mid2_assign || 0);
    return [
      stu.name,
      m.mid1_exam ?? 0,
      m.mid1_assign ?? 0,
      mid1_total,
      m.mid2_exam ?? 0,
      m.mid2_assign ?? 0,
      mid2_total,
      m.internal ?? 0,
      m.external ?? 0,
      m.total ?? 0,
      m.grade ?? "—",
    ];
  });

  return [headers, ...rows];
}

// ── LAB MARKS — Faculty / Admin view ─────────────────────────────
/**
 * @param {object[]} students
 * @param {object[]} labMarks
 * @returns {string[][]}
 */
export function buildFacultyLabMarksCSV(students, labMarks) {
  const marksMap = Object.fromEntries(labMarks.map((m) => [m.student_id, m]));

  const headers = [
    "Student Name",
    "Internal Viva (10)",
    "Observation / Record (10)",
    "Lab Performance (20)",
    "Internal Total (40)",
    "External Viva (10)",
    "External Record (10)",
    "Lab Exam (40)",
    "External Total (60)",
    "Total (100)",
    "Grade",
  ];

  const rows = students.map((stu) => {
    const m = marksMap[stu.id];
    if (!m) return [stu.name, ...Array(10).fill("—")];
    return [
      stu.name,
      m.internal_viva ?? 0,
      m.observation_record ?? 0,
      m.lab_performance ?? 0,
      m.internal_total ?? 0,
      m.external_viva ?? 0,
      m.external_record ?? 0,
      m.lab_exam ?? 0,
      m.external_total ?? 0,
      m.total ?? 0,
      m.grade ?? "—",
    ];
  });

  return [headers, ...rows];
}

// ── MARKS — Student view ──────────────────────────────────────────
/**
 * Export a student's own theory marks across all subjects.
 *
 * @param {object[]} marks       - from /marks/student/me
 * @param {object[]} allSubjects - from /courses/subjects
 * @returns {string[][]}
 */
export function buildStudentMarksCSV(marks, allSubjects) {
  const subjectMap = Object.fromEntries(allSubjects.map((s) => [s.id, s]));

  const headers = [
    "Subject",
    "Code",
    "Semester",
    "Mid-1 Exam (30)",
    "Mid-1 Assign (10)",
    "Mid-1 Total (40)",
    "Mid-2 Exam (30)",
    "Mid-2 Assign (10)",
    "Mid-2 Total (40)",
    "Internal (40)",
    "External (60)",
    "Total (100)",
    "Grade",
  ];

  const rows = marks.map((m) => {
    const subj = subjectMap[m.subject_id] || m.subjects || {};
    const mid1_total = (m.mid1_exam || 0) + (m.mid1_assign || 0);
    const mid2_total = (m.mid2_exam || 0) + (m.mid2_assign || 0);
    return [
      subj.name || "—",
      subj.code || "—",
      subj.semester || "—",
      m.mid1_exam ?? 0,
      m.mid1_assign ?? 0,
      mid1_total,
      m.mid2_exam ?? 0,
      m.mid2_assign ?? 0,
      mid2_total,
      m.internal ?? 0,
      m.external ?? 0,
      m.total ?? 0,
      m.grade ?? "—",
    ];
  });

  return [headers, ...rows];
}

// ── LAB MARKS — Student view ──────────────────────────────────────
/**
 * @param {object[]} labMarks    - from /lab-marks/student/me
 * @param {object[]} allSubjects
 * @returns {string[][]}
 */
export function buildStudentLabMarksCSV(labMarks, allSubjects) {
  const subjectMap = Object.fromEntries(allSubjects.map((s) => [s.id, s]));

  const headers = [
    "Subject",
    "Code",
    "Semester",
    "Internal Viva (10)",
    "Observation / Record (10)",
    "Lab Performance (20)",
    "Internal Total (40)",
    "External Viva (10)",
    "External Record (10)",
    "Lab Exam (40)",
    "External Total (60)",
    "Total (100)",
    "Grade",
  ];

  const rows = labMarks.map((m) => {
    const subj = subjectMap[m.subject_id] || m.subjects || {};
    return [
      subj.name || "—",
      subj.code || "—",
      subj.semester || "—",
      m.internal_viva ?? 0,
      m.observation_record ?? 0,
      m.lab_performance ?? 0,
      m.internal_total ?? 0,
      m.external_viva ?? 0,
      m.external_record ?? 0,
      m.lab_exam ?? 0,
      m.external_total ?? 0,
      m.total ?? 0,
      m.grade ?? "—",
    ];
  });

  return [headers, ...rows];
}

// ── ATTENDANCE — Faculty / Admin summary view ─────────────────────
/**
 * Export per-student attendance summary for a subject.
 *
 * @param {object[]} summaryRows - [{name, present, absent, late, total, percentage, at_risk}]
 * @param {string}   subjectName
 * @returns {string[][]}
 */
export function buildFacultyAttendanceCSV(summaryRows, subjectName) {
  const headers = [
    "Student Name",
    "Total Classes",
    "Present",
    "Late",
    "Absent",
    "Attendance %",
    "Status",
  ];

  const rows = summaryRows.map((r) => [
    r.name || r.student_name || "—",
    r.total || 0,
    r.present || 0,
    r.late || 0,
    r.absent || 0,
    r.percentage ?? 0,
    (r.percentage ?? 0) >= 75 ? "Safe" : "At Risk",
  ]);

  // Metadata row at top
  const meta = [[`Subject: ${subjectName}`, `Exported: ${todayStr()}`], []];

  return [...meta, headers, ...rows];
}

// ── ATTENDANCE — Student own records ─────────────────────────────
/**
 * Export a student's attendance records for a subject (date-wise).
 *
 * @param {object[]} records     - [{date, status}]
 * @param {string}   subjectName
 * @param {object}   summary     - {total, present, absent, late, percentage}
 * @returns {string[][]}
 */
export function buildStudentAttendanceCSV(records, subjectName, summary) {
  const headers = ["Date", "Day", "Status"];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const rows = records.map((r) => {
    const d = new Date(r.date + "T00:00:00");
    return [
      r.date,
      dayNames[d.getDay()],
      r.status.charAt(0).toUpperCase() + r.status.slice(1),
    ];
  });

  const summaryBlock = [
    [],
    ["Summary"],
    ["Total Classes", summary?.total ?? 0],
    ["Present", summary?.present ?? 0],
    ["Late", summary?.late ?? 0],
    ["Absent", summary?.absent ?? 0],
    ["Percentage", `${summary?.percentage ?? 0}%`],
    ["Status", (summary?.percentage ?? 0) >= 75 ? "Safe" : "At Risk"],
  ];

  const meta = [[`Subject: ${subjectName}`, `Exported: ${todayStr()}`], []];

  return [...meta, headers, ...rows, ...summaryBlock];
}
