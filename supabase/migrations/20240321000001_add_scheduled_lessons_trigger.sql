-- Add scheduled_lessons column if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS scheduled_lessons INTEGER NOT NULL DEFAULT 0;

-- Create function to update scheduled_lessons
CREATE OR REPLACE FUNCTION update_scheduled_lessons()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles 
    SET scheduled_lessons = (
      SELECT COUNT(*) 
      FROM classes 
      WHERE student_id = NEW.student_id 
      AND status = 'scheduled'
    )
    WHERE id = NEW.student_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles 
    SET scheduled_lessons = (
      SELECT COUNT(*) 
      FROM classes 
      WHERE student_id = OLD.student_id 
      AND status = 'scheduled'
    )
    WHERE id = OLD.student_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    UPDATE profiles 
    SET scheduled_lessons = (
      SELECT COUNT(*) 
      FROM classes 
      WHERE student_id = NEW.student_id 
      AND status = 'scheduled'
    )
    WHERE id = NEW.student_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for classes
DROP TRIGGER IF EXISTS update_scheduled_lessons_trigger ON classes;
CREATE TRIGGER update_scheduled_lessons_trigger
  AFTER INSERT OR UPDATE OR DELETE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_scheduled_lessons(); 