-- Create function to handle credits
CREATE OR REPLACE FUNCTION handle_class_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new class is scheduled
  IF TG_OP = 'INSERT' AND NEW.status = 'scheduled' THEN
    UPDATE profiles 
    SET credits = credits - 1
    WHERE id = NEW.student_id;
  
  -- When a class is cancelled
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'scheduled' AND NEW.status = 'cancelled' THEN
    UPDATE profiles 
    SET credits = credits + 1
    WHERE id = NEW.student_id;
  
  -- When a class is deleted while scheduled
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'scheduled' THEN
    UPDATE profiles 
    SET credits = credits + 1
    WHERE id = OLD.student_id;
  END IF;

  -- For INSERT and UPDATE operations, return NEW; for DELETE operations, return OLD
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS handle_class_credits_trigger ON classes;

-- Create trigger for classes
CREATE TRIGGER handle_class_credits_trigger
  AFTER INSERT OR UPDATE OR DELETE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION handle_class_credits(); 