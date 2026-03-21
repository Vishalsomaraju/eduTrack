-- Copy enrollments from theory to lab subjects
-- for the same semester students
INSERT INTO enrollments (student_id, subject_id)
SELECT e.student_id, s_lab.id
FROM enrollments e
JOIN subjects s_theory ON
  e.subject_id = s_theory.id
JOIN subjects s_lab ON
  s_lab.semester = s_theory.semester AND
  s_lab.subject_type = 'lab'
WHERE s_theory.subject_type = 'core'
  AND s_theory.semester = 4
ON CONFLICT (student_id, subject_id)
  DO NOTHING;
