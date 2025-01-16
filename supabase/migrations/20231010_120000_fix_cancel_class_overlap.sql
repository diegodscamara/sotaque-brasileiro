-- 20231010_120000_fix_cancel_class_overlap.sql

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS trg_prevent_class_overlap ON public.classes;

-- Create a new trigger to prevent overlapping classes for the same teacher
CREATE OR REPLACE FUNCTION prevent_class_overlap()
RETURNS TRIGGER AS $$
BEGIN
    -- Only check for overlaps when inserting or updating a class
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        IF EXISTS (
            SELECT 1
            FROM public.classes
            WHERE teacher_id = NEW.teacher_id
            AND (NEW.start_time, NEW.end_time) OVERLAPS (start_time, end_time)
            AND id != NEW.id -- Exclude the current class being updated
        ) THEN
            RAISE EXCEPTION 'Overlapping classes for the same teacher are not allowed.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger again
CREATE TRIGGER trg_prevent_class_overlap
BEFORE INSERT OR UPDATE ON public.classes
FOR EACH ROW EXECUTE FUNCTION prevent_class_overlap();
