-- Add SCHEDULED status to ClassStatus enum if it doesn't already exist
DO $$
BEGIN
    -- Check if SCHEDULED is already a value in the enum
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'classstatus')
        AND enumlabel = 'SCHEDULED'
    ) THEN
        -- Add the new value to the enum
        ALTER TYPE "public"."ClassStatus" ADD VALUE 'SCHEDULED';
    END IF;
END
$$; 