-- Add scheduled_lessons column if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS scheduled_lessons INTEGER NOT NULL DEFAULT 0;

-- Create function to update scheduled_lessons
CREATE OR REPLACE FUNCTION update_scheduled_lessons()
RETURNS TRIGGER AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Determine which user_id to update
  IF TG_OP = 'DELETE' THEN
    user_id := OLD.student_id;
  ELSE
    user_id := NEW.student_id;
  END IF;

  -- Update the scheduled_lessons count
  UPDATE profiles 
  SET scheduled_lessons = (
    SELECT COUNT(*) 
    FROM classes 
    WHERE student_id = user_id 
    AND status = 'scheduled'
  )
  WHERE id = user_id;

  -- For INSERT and UPDATE operations, return NEW; for DELETE operations, return OLD
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for classes
DROP TRIGGER IF EXISTS update_scheduled_lessons_trigger ON classes;
CREATE TRIGGER update_scheduled_lessons_trigger
  AFTER INSERT OR UPDATE OR DELETE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_scheduled_lessons();

-- Update all existing profiles with current counts
UPDATE profiles p
SET scheduled_lessons = (
  SELECT COUNT(*)
  FROM classes c
  WHERE c.student_id = p.id
  AND c.status = 'scheduled'
); 