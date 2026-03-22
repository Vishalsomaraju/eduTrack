// csvExport.js — Pure utility functions for generating and downloading CSV files.
// No dependencies. Works entirely in the browser.

// ── Core helpers ──────────────────────────────────────────────────────────────

function escapeCell(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Wrap in quotes if it contains commas, quotes, or newlines
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCSV(headers, rows) {
  const lines = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => row.map(escapeCell).join(",")),
  ];
  return lines.join("\n");
}

function downloadCSV(csvString, filename) {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function todayString() {
  return new Date().toISOString().split("T")[0];
}

// ── Attendance stats helper ───────────────────────────────────────────────────
// Given a flat array of attendance records, compute per-student totals.
// Returns a map: { [student_id]: { present, absent, late, total, percentage } }

export function buildAttendanceMap(attendanceRecords) {
  const map = {};
  for (const r of attendanceRecords ?? []) {
    if (!map[r.student_id]) {
      map[r.student_id] = { present: 0, absent: 0, late: 0, total: 0 };
    }
    map[r.student_id].total += 1;
    if (r.status === "present") map[r.student_id].present += 1;
    else if (r.status === "absent") map[r.student_id].absent += 1;
    else if (r.status === "late") map[r.student_id].late += 1;
  }
  // Add percentage
  for (const sid of Object.keys(map)) {
    const s = map[sid];
    s.percentage = s.total > 0 ? Math.round((s.present / s.total) * 100) : 0;
  }
  return map;
}

// ── Faculty: per-subject export ───────────────────────────────────────────────
// students       — [{ id, name, roll_number? }]
// theoryMarks    — marks array from /marks/{subject_id}   (may be empty)
// labMarks       — marks array from /lab-marks/{subject_id} (may be empty)
// attendanceRecs — raw records from /attendance/{subject_id}
// subjectName    — string for the filename

export function exportFacultyCSV({
  students,
  theoryMarks,
  labMarks,
  attendanceRecs,
  subjectName,
  subjectCode,
}) {
  const attMap = buildAttendanceMap(attendanceRecs);

  // Index marks by student_id for quick lookup
  const theoryMap = {};
  for (const m of theoryMarks ?? []) theoryMap[m.student_id] = m;

  const labMap = {};
  for (const m of labMarks ?? []) labMap[m.student_id] = m;

  const hasTheory =
    (theoryMarks ?? []).length > 0 || students.some((s) => theoryMap[s.id]);
  const hasLab =
    (labMarks ?? []).length > 0 || students.some((s) => labMap[s.id]);

  // ── Build header ──────────────────────────────────────────────────────────
  const headers = ["Student Name"];

  if (hasTheory) {
    headers.push(
      "M1 Exam (/30)",
      "M1 Assign (/10)",
      "M1 Total (/40)",
      "M2 Exam (/30)",
      "M2 Assign (/10)",
      "M2 Total (/40)",
      "Internal (/40)",
      "External (/60)",
      "Theory Total (/100)",
      "Theory Grade",
    );
  }

  if (hasLab) {
    headers.push(
      "Int. Viva (/10)",
      "Obs/Record (/10)",
      "Lab Perf (/20)",
      "Ext. Viva (/10)",
      "Ext. Record (/10)",
      "Lab Exam (/40)",
      "Lab Internal (/40)",
      "Lab External (/60)",
      "Lab Total (/100)",
      "Lab Grade",
    );
  }

  headers.push(
    "Present",
    "Absent",
    "Late",
    "Total Classes",
    "Attendance %",
    "Attendance Status",
  );

  // ── Build rows ────────────────────────────────────────────────────────────
  const rows = students.map((st) => {
    const t = theoryMap[st.id] ?? {};
    const l = labMap[st.id] ?? {};
    const a = attMap[st.id] ?? {
      present: 0,
      absent: 0,
      late: 0,
      total: 0,
      percentage: 0,
    };

    const row = [st.name];

    if (hasTheory) {
      row.push(
        t.mid1_exam ?? "",
        t.mid1_assign ?? "",
        t.mid1_total ?? "",
        t.mid2_exam ?? "",
        t.mid2_assign ?? "",
        t.mid2_total ?? "",
        t.internal ?? "",
        t.external ?? "",
        t.total ?? "",
        t.grade ?? "",
      );
    }

    if (hasLab) {
      row.push(
        l.internal_viva ?? "",
        l.observation_record ?? "",
        l.lab_performance ?? "",
        l.external_viva ?? "",
        l.external_record ?? "",
        l.lab_exam ?? "",
        l.internal_total ?? "",
        l.external_total ?? "",
        l.total ?? "",
        l.grade ?? "",
      );
    }

    const attStatus =
      a.percentage >= 75 ? "Safe" : a.percentage >= 60 ? "Warning" : "At Risk";
    row.push(
      a.present,
      a.absent,
      a.late,
      a.total,
      `${a.percentage}%`,
      attStatus,
    );

    return row;
  });

  const csv = buildCSV(headers, rows);
  const safeName = (subjectName || subjectCode || "Subject").replace(
    /[^a-zA-Z0-9]/g,
    "_",
  );
  downloadCSV(csv, `${safeName}_${subjectCode}_${todayString()}.csv`);
}

// ── Student: all-subjects export ──────────────────────────────────────────────
// allSubjects    — [{ id, name, code, semester, subject_type }]
// theoryMarks    — /marks/student/me  result (has subjects join)
// labMarks       — /lab-marks/student/me result
// attendanceSummaries — { [subject_id]: { present, absent, late, total, percentage } }
// studentName    — string for the filename

export function exportStudentCSV({
  allSubjects,
  theoryMarks,
  labMarks,
  attendanceSummaries,
  studentName,
}) {
  // Index by subject_id
  const theoryMap = {};
  for (const m of theoryMarks ?? []) theoryMap[m.subject_id] = m;

  const labMap = {};
  for (const m of labMarks ?? []) labMap[m.subject_id] = m;

  const headers = [
    "Semester",
    "Subject",
    "Code",
    "Type",
    // Theory
    "M1 Exam (/30)",
    "M1 Assign (/10)",
    "M1 Total (/40)",
    "M2 Exam (/30)",
    "M2 Assign (/10)",
    "M2 Total (/40)",
    "Internal (/40)",
    "External (/60)",
    "Theory Total",
    "Theory Grade",
    // Lab
    "Lab Int. Viva (/10)",
    "Lab Obs/Rec (/10)",
    "Lab Perf (/20)",
    "Lab Ext. Viva (/10)",
    "Lab Ext. Rec (/10)",
    "Lab Exam (/40)",
    "Lab Internal (/40)",
    "Lab External (/60)",
    "Lab Total",
    "Lab Grade",
    // Attendance
    "Present",
    "Absent",
    "Late",
    "Total Classes",
    "Attendance %",
    "Attendance Status",
  ];

  // Sort subjects by semester then name
  const sorted = [...(allSubjects ?? [])].sort((a, b) =>
    a.semester !== b.semester
      ? a.semester - b.semester
      : a.name.localeCompare(b.name),
  );

  const rows = sorted.map((subj) => {
    const t = theoryMap[subj.id] ?? {};
    const l = labMap[subj.id] ?? {};
    const a = attendanceSummaries?.[subj.id] ?? {
      present: 0,
      absent: 0,
      late: 0,
      total: 0,
      percentage: 0,
    };

    const attStatus =
      a.percentage >= 75 ? "Safe" : a.percentage >= 60 ? "Warning" : "At Risk";

    return [
      subj.semester,
      subj.name,
      subj.code,
      subj.subject_type,
      // Theory
      t.mid1_exam ?? "",
      t.mid1_assign ?? "",
      t.mid1_total ?? "",
      t.mid2_exam ?? "",
      t.mid2_assign ?? "",
      t.mid2_total ?? "",
      t.internal ?? "",
      t.external ?? "",
      t.total ?? "",
      t.grade ?? "",
      // Lab
      l.internal_viva ?? "",
      l.observation_record ?? "",
      l.lab_performance ?? "",
      l.external_viva ?? "",
      l.external_record ?? "",
      l.lab_exam ?? "",
      l.internal_total ?? "",
      l.external_total ?? "",
      l.total ?? "",
      l.grade ?? "",
      // Attendance
      a.present,
      a.absent,
      a.late,
      a.total,
      a.percentage ? `${a.percentage}%` : "0%",
      attStatus,
    ];
  });

  const csv = buildCSV(headers, rows);
  const safeName = (studentName || "Student").replace(/[^a-zA-Z0-9]/g, "_");
  downloadCSV(csv, `${safeName}_Academic_Report_${todayString()}.csv`);
}
