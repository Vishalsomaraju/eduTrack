-- Step 1: Drop old marks table and recreate
DROP TABLE IF EXISTS marks CASCADE;

-- Step 2: New marks structure
CREATE TABLE marks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   uuid REFERENCES profiles(id),
  subject_id   uuid REFERENCES subjects(id),
  mid1_exam    numeric DEFAULT 0 CHECK (mid1_exam BETWEEN 0 AND 30),
  mid1_assign  numeric DEFAULT 0 CHECK (mid1_assign BETWEEN 0 AND 10),
  mid2_exam    numeric DEFAULT 0 CHECK (mid2_exam BETWEEN 0 AND 30),
  mid2_assign  numeric DEFAULT 0 CHECK (mid2_assign BETWEEN 0 AND 10),
  external     numeric DEFAULT 0 CHECK (external BETWEEN 0 AND 60),
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  UNIQUE(student_id, subject_id)
);

ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "marks_read" ON marks
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "marks_write" ON marks
  FOR ALL USING (auth.role() = 'authenticated');

-- Step 3: Add semester to subjects table
ALTER TABLE subjects
  ADD COLUMN IF NOT EXISTS year int DEFAULT 1
    CHECK (year BETWEEN 1 AND 4),
  ADD COLUMN IF NOT EXISTS sem_half text DEFAULT '1'
    CHECK (sem_half IN ('1','2')),
  ADD COLUMN IF NOT EXISTS credits int DEFAULT 3,
  ADD COLUMN IF NOT EXISTS subject_type text DEFAULT 'core'
    CHECK (subject_type IN ('core','lab','elective','mc'));

-- Step 4: Insert ALL subjects from R22 KPRIT syllabus
-- Clear existing subjects first
DELETE FROM enrollments;
DELETE FROM subjects;

INSERT INTO subjects (name, code, semester, year,
  sem_half, credits, subject_type, faculty_id)
SELECT name, code, semester, year, sem_half,
  credits, subject_type, NULL
FROM (VALUES

-- ── 1-1 ──────────────────────────────────────
('Matrices and Calculus','MA101BS',1,1,'1',4,'core'),
('Engineering Chemistry','CH102BS',1,1,'1',4,'core'),
('Programming for Problem Solving','CS103ES',1,1,'1',3,'core'),
('Basic Electrical Engineering','EE104ES',1,1,'1',2,'core'),
('Computer Aided Engineering Graphics','ME105ES',1,1,'1',3,'core'),
('Elements of CSE','CS106ES',1,1,'1',1,'lab'),
('Engineering Chemistry Lab','CH107BS',1,1,'1',1,'lab'),
('Programming Lab','CS108ES',1,1,'1',1,'lab'),
('BEE Lab','EE109ES',1,1,'1',1,'lab'),

-- ── 1-2 ──────────────────────────────────────
('ODE and Vector Calculus','MA201BS',2,1,'2',4,'core'),
('Applied Physics','PH202BS',2,1,'2',4,'core'),
('Engineering Workshop','ME203ES',2,1,'2',2,'core'),
('English for Skill Enhancement','EN204HS',2,1,'2',2,'core'),
('Electronic Devices and Circuits','EC205ES',2,1,'2',2,'core'),
('Python Programming Lab','CS206ES',2,1,'2',2,'lab'),
('Applied Physics Lab','PH207BS',2,1,'2',2,'lab'),
('English Communication Skills Lab','EN208HS',2,1,'2',1,'lab'),
('IT Workshop','CS209ES',2,1,'2',1,'lab'),
('Environmental Science','MC210',2,1,'2',0,'mc'),

-- ── 2-1 ──────────────────────────────────────
('Digital Electronics','CS301PC',3,2,'1',3,'core'),
('Data Structures','CS302PC',3,2,'1',3,'core'),
('Computer Oriented Statistical Methods','CS303PC',3,2,'1',4,'core'),
('Computer Organization and Architecture','CS304PC',3,2,'1',3,'core'),
('OOP through Java','CS305PC',3,2,'1',3,'core'),
('Data Structures Lab','CS306PC',3,2,'1',2,'lab'),
('OOP Java Lab','CS307PC',3,2,'1',2,'lab'),
('Data Visualization R/Power BI','CS308PC',3,2,'1',1,'lab'),

-- ── 2-2 ──────────────────────────────────────
('Discrete Mathematics','CS401PC',4,2,'2',3,'core'),
('Business Economics & Financial Analysis','SM402MS',4,2,'2',3,'core'),
('Operating Systems','CS403PC',4,2,'2',3,'core'),
('Database Management Systems','CS404PC',4,2,'2',3,'core'),
('Software Engineering','CS405PC',4,2,'2',3,'core'),
('Operating Systems Lab','CS406PC',4,2,'2',1,'lab'),
('DBMS Lab','CS407PC',4,2,'2',1,'lab'),
('Real-time Research Project','CS408PC',4,2,'2',2,'lab'),
('Node JS/React JS/Django','CS409PC',4,2,'2',1,'lab'),
('Constitution of India','MC410',4,2,'2',0,'mc'),

-- ── 3-1 ──────────────────────────────────────
('Design and Analysis of Algorithms','CS501PC',5,3,'1',4,'core'),
('Computer Networks','CS502PC',5,3,'1',3,'core'),
('DevOps','CS503PC',5,3,'1',3,'core'),
('Computer Networks Lab','CS504PC',5,3,'1',1,'lab'),
('DevOps Lab','CS505PC',5,3,'1',1,'lab'),
('UI Design Flutter','CS506PC',5,3,'1',1,'lab'),
('Advanced English Communication Lab','EN508HS',5,3,'1',1,'lab'),
('Intellectual Property Rights','MC510',5,3,'1',0,'mc'),

-- ── 3-2 ──────────────────────────────────────
('Machine Learning','CS601PC',6,3,'2',3,'core'),
('Formal Languages and Automata Theory','CS602PC',6,3,'2',3,'core'),
('Artificial Intelligence','CS603PC',6,3,'2',3,'core'),
('Machine Learning Lab','CS604PC',6,3,'2',1,'lab'),
('Artificial Intelligence Lab','CS605PC',6,3,'2',1,'lab'),
('Mini Project/Internship','CS606PC',6,3,'2',2,'lab'),
('Environmental Science','MC609',6,3,'2',0,'mc'),

-- ── 4-1 ──────────────────────────────────────
('Cryptography and Network Security','CS701PC',7,4,'1',3,'core'),
('Compiler Design','CS702PC',7,4,'1',3,'core'),
('Cryptography Lab','CS703PC',7,4,'1',1,'lab'),
('Compiler Design Lab','CS704PC',7,4,'1',1,'lab'),
('Project Stage-I','CS705PC',7,4,'1',3,'lab'),

-- ── 4-2 ──────────────────────────────────────
('Organizational Behavior','CS801PC',8,4,'2',3,'core'),
('Project Stage-II including Seminar','CS802PC',8,4,'2',11,'lab')

) AS t(name, code, semester, year, sem_half,
       credits, subject_type);

-- Enable realtime on marks
ALTER PUBLICATION supabase_realtime ADD TABLE marks;

-- =====================================================================
-- TEMPLATE: RUN MANUALLY WITH ACTUAL UUID
-- =====================================================================
-- DO $$
-- DECLARE
--   s1_id uuid := 'REPLACE_STUDENT1_UUID';
--   sub_cs401 uuid;
--   sub_sm402 uuid;
--   sub_cs403 uuid;
--   sub_cs404 uuid;
--   sub_cs405 uuid;
-- BEGIN
--   SELECT id INTO sub_cs401 FROM subjects WHERE code = 'CS401PC';
--   SELECT id INTO sub_sm402 FROM subjects WHERE code = 'SM402MS';
--   SELECT id INTO sub_cs403 FROM subjects WHERE code = 'CS403PC';
--   SELECT id INTO sub_cs404 FROM subjects WHERE code = 'CS404PC';
--   SELECT id INTO sub_cs405 FROM subjects WHERE code = 'CS405PC';
--
--   INSERT INTO marks (student_id, subject_id,
--     mid1_exam, mid1_assign,
--     mid2_exam, mid2_assign, external)
--   VALUES
--     (s1_id, sub_cs401, 24, 8, 26, 9, 45),
--     (s1_id, sub_sm402, 22, 7, 25, 8, 42),
--     (s1_id, sub_cs403, 26, 9, 27, 9, 50),
--     (s1_id, sub_cs404, 20, 6, 22, 7, 38),
--     (s1_id, sub_cs405, 25, 8, 24, 8, 46)
--   ON CONFLICT (student_id, subject_id)
--   DO UPDATE SET
--     mid1_exam = EXCLUDED.mid1_exam,
--     mid1_assign = EXCLUDED.mid1_assign,
--     mid2_exam = EXCLUDED.mid2_exam,
--     mid2_assign = EXCLUDED.mid2_assign,
--     external = EXCLUDED.external;
--
--   DELETE FROM enrollments WHERE student_id = s1_id;
--
--   INSERT INTO enrollments (student_id, subject_id)
--   VALUES
--     (s1_id, sub_cs401),
--     (s1_id, sub_sm402),
--     (s1_id, sub_cs403),
--     (s1_id, sub_cs404),
--     (s1_id, sub_cs405);
-- END $$;
