-- Add elective subjects to subjects table
INSERT INTO subjects (name, code, semester, year,
  sem_half, credits, subject_type, faculty_id)
SELECT name, code, semester, year, sem_half,
  credits, subject_type, NULL
FROM (VALUES

-- PE-I (available sem 5)
('Quantum Computing','CS511PE',5,3,'1',3,'elective'),
('Advanced Computer Architecture','CS512PE',5,3,'1',3,'elective'),
('Data Analytics','CS513PE',5,3,'1',3,'elective'),
('Image Processing','CS514PE',5,3,'1',3,'elective'),
('Principles of Programming Languages','CS515PE',5,3,'1',3,'elective'),

-- PE-II (available sem 5)
('Computer Graphics','CS521PE',5,3,'1',3,'elective'),
('Embedded Systems','CS522PE',5,3,'1',3,'elective'),
('Information Retrieval Systems','CS523PE',5,3,'1',3,'elective'),
('Distributed Databases','CS524PE',5,3,'1',3,'elective'),
('Natural Language Processing','CS525PE',5,3,'1',3,'elective'),

-- OE-I (available sem 6)
('Data Structures (OE)','CS611OE',6,3,'2',3,'elective'),
('Database Management Systems (OE)','CS612OE',6,3,'2',3,'elective'),

-- PE-III (available sem 6)
('Full Stack Development','CS631PE',6,3,'2',3,'elective'),
('Internet of Things','CS632PE',6,3,'2',3,'elective'),
('Scripting Languages','CS633PE',6,3,'2',3,'elective'),
('Mobile Application Development','CS634PE',6,3,'2',3,'elective'),
('Software Testing Methodologies','CS635PE',6,3,'2',3,'elective'),

-- PE-IV (available sem 7)
('Graph Theory','CS741PE',7,4,'1',3,'elective'),
('Cyber Security','CS742PE',7,4,'1',3,'elective'),
('Soft Computing','CS743PE',7,4,'1',3,'elective'),
('Cloud Computing','CS744PE',7,4,'1',3,'elective'),
('Ad hoc & Sensor Networks','CS745PE',7,4,'1',3,'elective'),

-- PE-V (available sem 7)
('Advanced Algorithms','CS751PE',7,4,'1',3,'elective'),
('Agile Methodology','CS752PE',7,4,'1',3,'elective'),
('Robotic Process Automation','CS753PE',7,4,'1',3,'elective'),
('Blockchain Technology','CS754PE',7,4,'1',3,'elective'),
('Software Process & Project Management','CS755PE',7,4,'1',3,'elective'),

-- OE-II (available sem 7)
('Operating Systems (OE)','CS721OE',7,4,'1',3,'elective'),
('Software Engineering (OE)','CS722OE',7,4,'1',3,'elective'),

-- PE-VI (available sem 8)
('Computational Complexity','CS861PE',8,4,'2',3,'elective'),
('Distributed Systems','CS862PE',8,4,'2',3,'elective'),
('Deep Learning','CS863PE',8,4,'2',3,'elective'),
('Human Computer Interaction','CS864PE',8,4,'2',3,'elective'),
('Cyber Forensics','CS865PE',8,4,'2',3,'elective'),

-- OE-III (available sem 8)
('Algorithms Design and Analysis (OE)','CS831OE',8,4,'2',3,'elective'),
('Introduction to Computer Networks (OE)','CS832OE',8,4,'2',3,'elective')

) AS t(name, code, semester, year, sem_half,
       credits, subject_type);

-- Elective registration table
CREATE TABLE IF NOT EXISTS elective_registrations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    uuid REFERENCES profiles(id),
  subject_id    uuid REFERENCES subjects(id),
  slot          text NOT NULL,
  -- slot values: 'PE1','PE2','PE3','PE4','PE5',
  --              'PE6','OE1','OE2','OE3'
  semester      int NOT NULL,
  registered_at timestamptz DEFAULT now(),
  UNIQUE(student_id, slot)
);

ALTER TABLE elective_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "elec_read" ON elective_registrations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "elec_write" ON elective_registrations FOR ALL USING (auth.role() = 'authenticated');

-- Elective deadlines table (admin sets these)
CREATE TABLE IF NOT EXISTS elective_deadlines (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot        text UNIQUE NOT NULL,
  deadline    timestamptz NOT NULL,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE elective_deadlines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deadline_read" ON elective_deadlines FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "deadline_write" ON elective_deadlines FOR ALL USING (auth.role() = 'authenticated');

-- Seed default deadlines (far future for demo)
INSERT INTO elective_deadlines (slot, deadline)
VALUES
  ('PE1', '2026-12-31 23:59:59+00'),
  ('PE2', '2026-12-31 23:59:59+00'),
  ('PE3', '2026-12-31 23:59:59+00'),
  ('PE4', '2026-12-31 23:59:59+00'),
  ('PE5', '2026-12-31 23:59:59+00'),
  ('PE6', '2026-12-31 23:59:59+00'),
  ('OE1', '2026-12-31 23:59:59+00'),
  ('OE2', '2026-12-31 23:59:59+00'),
  ('OE3', '2026-12-31 23:59:59+00')
ON CONFLICT (slot) DO NOTHING;

-- Add syllabus column to subjects
ALTER TABLE subjects
  ADD COLUMN IF NOT EXISTS syllabus_text text,
  ADD COLUMN IF NOT EXISTS syllabus_updated_at timestamptz;
