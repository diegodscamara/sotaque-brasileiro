-- First check if we're in a Supabase environment by looking for the auth extension
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto'
  ) THEN
    -- First drop existing policies if they exist
    DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "User";
    DROP POLICY IF EXISTS "Enable select for authenticated users" ON "User";
    DROP POLICY IF EXISTS "Enable update for users based on id" ON "User";
    DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "Student";
    DROP POLICY IF EXISTS "Enable select for authenticated users" ON "Student";
    DROP POLICY IF EXISTS "Enable update for users based on userId" ON "Student";
    DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "Teacher";
    DROP POLICY IF EXISTS "Enable select for authenticated users" ON "Teacher";
    DROP POLICY IF EXISTS "Enable update for users based on userId" ON "Teacher";

    -- Enable RLS
    ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "Student" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "Teacher" ENABLE ROW LEVEL SECURITY;

    -- Create policies for User table
    BEGIN
      EXECUTE 'CREATE POLICY "Enable insert for authenticated users" ON "User"
      FOR INSERT WITH CHECK (id = auth.uid()::uuid)';
      
      EXECUTE 'CREATE POLICY "Enable select for authenticated users" ON "User"
      FOR SELECT USING (id = auth.uid()::uuid)';
      
      EXECUTE 'CREATE POLICY "Enable update for users based on id" ON "User"
      FOR UPDATE USING (id = auth.uid()::uuid)';
      
      -- Create policies for Student table
      EXECUTE 'CREATE POLICY "Enable insert for authenticated users" ON "Student"
      FOR INSERT WITH CHECK ("userId" = auth.uid()::uuid)';
      
      EXECUTE 'CREATE POLICY "Enable select for authenticated users" ON "Student"
      FOR SELECT USING ("userId" = auth.uid()::uuid)';
      
      EXECUTE 'CREATE POLICY "Enable update for users based on userId" ON "Student"
      FOR UPDATE USING ("userId" = auth.uid()::uuid)';
      
      -- Create policies for Teacher table
      EXECUTE 'CREATE POLICY "Enable insert for authenticated users" ON "Teacher"
      FOR INSERT WITH CHECK ("userId" = auth.uid()::uuid)';
      
      EXECUTE 'CREATE POLICY "Enable select for authenticated users" ON "Teacher"
      FOR SELECT USING ("userId" = auth.uid()::uuid)';
      
      EXECUTE 'CREATE POLICY "Enable update for users based on userId" ON "Teacher"
      FOR UPDATE USING ("userId" = auth.uid()::uuid)';
      
      -- Grant necessary permissions
      EXECUTE 'GRANT USAGE ON SCHEMA public TO authenticated';
      EXECUTE 'GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated';
      EXECUTE 'GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated';
      EXECUTE 'GRANT USAGE ON SCHEMA public TO anon';
      EXECUTE 'GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon';
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Error applying Supabase RLS policies: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'Skipping Supabase RLS setup as this appears to be a standard PostgreSQL database';
  END IF;
END
$$;
