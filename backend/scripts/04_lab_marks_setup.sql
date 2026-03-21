-- Step 1: Create lab_marks table
CREATE TABLE IF NOT EXISTS lab_marks (
  id                  uuid PRIMARY KEY
                        DEFAULT gen_random_uuid(),
  student_id          uuid REFERENCES profiles(id),
  subject_id          uuid REFERENCES subjects(id),
  -- Internal (40)
  internal_viva       numeric DEFAULT 0
    CHECK (internal_viva BETWEEN 0 AND 10),
  observation_record  numeric DEFAULT 0
    CHECK (observation_record BETWEEN 0 AND 10),
  lab_performance     numeric DEFAULT 0
    CHECK (lab_performance BETWEEN 0 AND 20),
  -- External (60)
  external_viva       numeric DEFAULT 0
    CHECK (external_viva BETWEEN 0 AND 10),
  external_record     numeric DEFAULT 0
    CHECK (external_record BETWEEN 0 AND 10),
  lab_exam            numeric DEFAULT 0
    CHECK (lab_exam BETWEEN 0 AND 40),
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now(),
  UNIQUE(student_id, subject_id)
);

ALTER TABLE lab_marks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lab_marks_read" ON lab_marks
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "lab_marks_write" ON lab_marks
  FOR ALL USING (auth.role() = 'authenticated');

ALTER PUBLICATION supabase_realtime
  ADD TABLE lab_marks;
