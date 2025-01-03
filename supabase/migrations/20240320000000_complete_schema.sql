-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.teacher_availability CASCADE;

-- Create profiles table with all fields
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    image TEXT,
    credits INTEGER NOT NULL DEFAULT 5,
    customer_id TEXT,
    price_id TEXT,
    has_access BOOLEAN DEFAULT false,
    country TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    portuguese_level VARCHAR(20) CHECK (portuguese_level IN ('beginner', 'intermediate', 'advanced', 'native', 'unknown')),
    learning_goals TEXT[],
    availability_hours INT,
    preferred_schedule VARCHAR(20)[] CHECK (preferred_schedule::text[] <@ ARRAY['morning', 'afternoon', 'evening', 'night']::text[]),
    native_language VARCHAR(100),
    other_languages TEXT[],
    learning_style VARCHAR(20)[] CHECK (learning_style::text[] <@ ARRAY['visual', 'auditory', 'reading', 'kinesthetic']::text[]),
    interests TEXT[],
    professional_background TEXT,
    motivation_for_learning TEXT,
    has_completed_onboarding BOOLEAN DEFAULT FALSE,
    preferred_class_type VARCHAR(20)[] CHECK (preferred_class_type::text[] <@ ARRAY['one-on-one', 'group', 'self-paced', 'intensive']::text[]),
    time_zone VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create classes table
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed')),
    type TEXT NOT NULL DEFAULT 'private' CHECK (type IN ('private')),
    credits_cost INTEGER NOT NULL DEFAULT 1,
    recurring_group_id UUID DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create teacher availability table
CREATE TABLE public.teacher_availability (
    id SERIAL PRIMARY KEY,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_classes_recurring_group_id ON classes (recurring_group_id);
CREATE INDEX idx_classes_student_id ON classes (student_id);
CREATE INDEX idx_classes_teacher_id ON classes (teacher_id);
CREATE INDEX idx_classes_start_time ON classes (start_time);
CREATE INDEX idx_profiles_id ON profiles (id);
CREATE INDEX idx_teacher_availability_teacher_id ON teacher_availability (teacher_id);
CREATE INDEX idx_teacher_availability_date ON teacher_availability (date);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_availability ENABLE ROW LEVEL SECURITY;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_availability_updated_at
    BEFORE UPDATE ON teacher_availability
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Create policies for classes
CREATE POLICY "Users can view their own classes"
    ON classes FOR SELECT
    USING (auth.uid() = student_id);

CREATE POLICY "Users can insert their own classes"
    ON classes FOR INSERT
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own classes"
    ON classes FOR UPDATE
    USING (auth.uid() = student_id);

CREATE POLICY "Users can delete their own classes"
    ON classes FOR DELETE
    USING (auth.uid() = student_id);

-- Create policies for teacher availability
CREATE POLICY "Teachers can manage their own availability"
    ON teacher_availability
    FOR ALL
    USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view teacher availability"
    ON teacher_availability
    FOR SELECT
    USING (true);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        name,
        full_name,
        avatar_url,
        image,
        credits,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'avatar_url',
        5,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated; 