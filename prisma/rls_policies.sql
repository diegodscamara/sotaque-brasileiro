-- Enable RLS on tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Student" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Teacher" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Class" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeacherAvailability" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ErrorLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecurringGroup" ENABLE ROW LEVEL SECURITY;

-- Create policies for User table
CREATE POLICY "Enable insert for authenticated users" ON "User"
FOR INSERT WITH CHECK (id = auth.uid()::uuid);

CREATE POLICY "Enable select for authenticated users" ON "User"
FOR SELECT USING (id = auth.uid()::uuid);

CREATE POLICY "Enable update for users based on id" ON "User"
FOR UPDATE USING (id = auth.uid()::uuid);

-- Create policies for Student table
CREATE POLICY "Enable insert for authenticated users" ON "Student"
FOR INSERT WITH CHECK ("userId" = auth.uid()::uuid);

CREATE POLICY "Enable select for authenticated users" ON "Student"
FOR SELECT USING ("userId" = auth.uid()::uuid);

CREATE POLICY "Enable update for users based on userId" ON "Student"
FOR UPDATE USING ("userId" = auth.uid()::uuid);

-- Create policies for Teacher table
CREATE POLICY "Enable insert for authenticated users" ON "Teacher"
FOR INSERT WITH CHECK ("userId" = auth.uid()::uuid);

CREATE POLICY "Enable select for authenticated users" ON "Teacher"
FOR SELECT USING ("userId" = auth.uid()::uuid);

CREATE POLICY "Enable update for users based on userId" ON "Teacher"
FOR UPDATE USING ("userId" = auth.uid()::uuid);

-- Create policies for Class table
CREATE POLICY "Enable insert for students and teachers" ON "Class"
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM "Student" WHERE id = "studentId" AND "userId" = auth.uid()::uuid) OR
  EXISTS (SELECT 1 FROM "Teacher" WHERE id = "teacherId" AND "userId" = auth.uid()::uuid)
);

CREATE POLICY "Enable select for participants" ON "Class"
FOR SELECT USING (
  EXISTS (SELECT 1 FROM "Student" WHERE id = "studentId" AND "userId" = auth.uid()::uuid) OR
  EXISTS (SELECT 1 FROM "Teacher" WHERE id = "teacherId" AND "userId" = auth.uid()::uuid)
);

CREATE POLICY "Enable update for participants" ON "Class"
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM "Student" WHERE id = "studentId" AND "userId" = auth.uid()::uuid) OR
  EXISTS (SELECT 1 FROM "Teacher" WHERE id = "teacherId" AND "userId" = auth.uid()::uuid)
);

-- Create policies for TeacherAvailability table
CREATE POLICY "Enable insert for teachers" ON "TeacherAvailability"
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM "Teacher" WHERE id = "teacherId" AND "userId" = auth.uid()::uuid)
);

CREATE POLICY "Enable select for all authenticated users" ON "TeacherAvailability"
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable update for teachers" ON "TeacherAvailability"
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM "Teacher" WHERE id = "teacherId" AND "userId" = auth.uid()::uuid)
);

-- Create policies for Notification table
CREATE POLICY "Enable insert for system" ON "Notification"
FOR INSERT WITH CHECK ("userId" = auth.uid()::uuid);

CREATE POLICY "Enable select for users" ON "Notification"
FOR SELECT USING ("userId" = auth.uid()::uuid);

CREATE POLICY "Enable update for users" ON "Notification"
FOR UPDATE USING ("userId" = auth.uid()::uuid);

-- Create policies for ErrorLog table
CREATE POLICY "Enable insert for authenticated users" ON "ErrorLog"
FOR INSERT WITH CHECK ("userId" = auth.uid()::uuid);

CREATE POLICY "Enable select for own errors" ON "ErrorLog"
FOR SELECT USING ("userId" = auth.uid()::uuid);

-- Create policies for RecurringGroup table
CREATE POLICY "Enable insert for participants" ON "RecurringGroup"
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM "Class" WHERE "recurringGroupId" = "RecurringGroup".id AND (
    EXISTS (SELECT 1 FROM "Student" WHERE id = "studentId" AND "userId" = auth.uid()::uuid) OR
    EXISTS (SELECT 1 FROM "Teacher" WHERE id = "teacherId" AND "userId" = auth.uid()::uuid)
  ))
);

CREATE POLICY "Enable select for participants" ON "RecurringGroup"
FOR SELECT USING (
  EXISTS (SELECT 1 FROM "Class" WHERE "recurringGroupId" = "RecurringGroup".id AND (
    EXISTS (SELECT 1 FROM "Student" WHERE id = "studentId" AND "userId" = auth.uid()::uuid) OR
    EXISTS (SELECT 1 FROM "Teacher" WHERE id = "teacherId" AND "userId" = auth.uid()::uuid)
  ))
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon; 