-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    image TEXT, -- Profile picture URL
    customer_id TEXT, -- Stripe customer ID
    price_id TEXT, -- Stripe price ID (plan chosen)
    has_access BOOLEAN DEFAULT false, -- True if the user has active access (after payment)
    credits INTEGER DEFAULT 0, -- Number of credits the user has
    country TEXT, -- Student's country
    level TEXT, -- Language level: 'beginner', 'intermediate', 'advanced'
    role TEXT DEFAULT 'student', -- 'admin', 'teacher', 'student'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Trigger for profiles updated_at
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_profiles_updated_at();

-- Create classes table
CREATE TABLE public.classes (
    id SERIAL PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_date DATE NOT NULL, -- Date of the class
    start_time TIME NOT NULL, -- Start time of the class
    end_time TIME NOT NULL, -- End time of the class
    status TEXT DEFAULT 'planned', -- 'planned', 'completed', 'cancelled', 'rescheduled'
    student_message TEXT, -- Message or suggestion from the student
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Trigger for classes updated_at
CREATE TRIGGER update_classes_trigger
BEFORE UPDATE ON public.classes
FOR EACH ROW
EXECUTE FUNCTION public.update_profiles_updated_at();

-- Create teacher availability table
CREATE TABLE public.teacher_availability (
    id SERIAL PRIMARY KEY,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL, -- Date of the availability or unavailability
    start_time TIME NOT NULL, -- Start time of the slot
    end_time TIME NOT NULL, -- End time of the slot
    is_available BOOLEAN DEFAULT true, -- True for available slots, false for blocked slots
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Trigger for teacher availability updated_at
CREATE TRIGGER update_teacher_availability_trigger
BEFORE UPDATE ON public.teacher_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_profiles_updated_at();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, image, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name'
        ),
        NEW.raw_user_meta_data->>'avatar_url',
        (now() AT TIME ZONE 'UTC'),
        (now() AT TIME ZONE 'UTC')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the handle_new_user function on signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_availability ENABLE ROW LEVEL SECURITY;

-- Apply default RLS policies
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.classes FORCE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_availability FORCE ROW LEVEL SECURITY;

-- Policies for profiles table
CREATE POLICY "Students can view only their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policies for teacher availability table
CREATE POLICY "Admins can view all availability"
ON public.teacher_availability
FOR SELECT
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Helper: Ensure only valid roles are added to the profiles table
ALTER TABLE public.profiles
ADD CONSTRAINT valid_roles CHECK (role IN ('admin', 'teacher', 'student'));