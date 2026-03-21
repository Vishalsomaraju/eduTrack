-- Extend profiles table with all fields
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone        text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS gender       text CHECK (gender IN ('male','female','other')),
  ADD COLUMN IF NOT EXISTS blood_group  text,
  ADD COLUMN IF NOT EXISTS aadhar       text,
  ADD COLUMN IF NOT EXISTS address      text,
  ADD COLUMN IF NOT EXISTS department   text DEFAULT 'CSE',
  ADD COLUMN IF NOT EXISTS avatar_url   text;

-- Student-specific extra info
CREATE TABLE IF NOT EXISTS student_profiles (
  id              uuid PRIMARY KEY REFERENCES profiles(id),
  roll_number     text UNIQUE,
  year            int CHECK (year BETWEEN 1 AND 4),
  semester        int CHECK (semester BETWEEN 1 AND 8),
  admission_type  text CHECK (admission_type IN
                    ('convenor','management','lateral_entry')),
  father_name     text,
  father_phone    text,
  father_email    text,
  mother_name     text,
  mother_phone    text,
  mother_email    text,
  guardian_name   text,
  guardian_phone  text,
  joined_date     date DEFAULT CURRENT_DATE,
  created_at      timestamptz DEFAULT now()
);

-- Faculty-specific extra info
CREATE TABLE IF NOT EXISTS faculty_profiles (
  id              uuid PRIMARY KEY REFERENCES profiles(id),
  employee_id     text UNIQUE,
  designation     text DEFAULT 'Assistant Professor',
  qualification   text,
  specialization  text,
  experience_years int DEFAULT 0,
  joined_date     date DEFAULT CURRENT_DATE,
  created_at      timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "student_profiles_read" ON student_profiles
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "student_profiles_write" ON student_profiles
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "faculty_profiles_read" ON faculty_profiles
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "faculty_profiles_write" ON faculty_profiles
  FOR ALL USING (auth.role() = 'authenticated');

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "avatar_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "avatar_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
