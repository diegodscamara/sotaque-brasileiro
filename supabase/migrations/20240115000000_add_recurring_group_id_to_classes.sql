-- Create classes table if it doesn't exist
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    title TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled',
    type TEXT NOT NULL DEFAULT 'private',
    credits_cost INTEGER NOT NULL DEFAULT 1,
    recurring_group_id UUID DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_classes_recurring_group_id ON classes (recurring_group_id);
CREATE INDEX IF NOT EXISTS idx_classes_student_id ON classes (student_id);
CREATE INDEX IF NOT EXISTS idx_classes_start_time ON classes (start_time);

-- Add foreign key constraint to profiles table
ALTER TABLE classes 
    ADD CONSTRAINT fk_classes_student_id 
    FOREIGN KEY (student_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE; 