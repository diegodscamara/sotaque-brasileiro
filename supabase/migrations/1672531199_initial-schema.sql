-- ===========================
-- USERS TABLE
-- ===========================
create table public.users (
    id uuid not null default uuid_generate_v4() primary key,
    first_name text not null,
    last_name text not null,
    email text not null unique,
    avatar_url text,
    role text not null check (role in ('student', 'teacher', 'admin')),
    -- Common fields for all users
    country text,
    gender text,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    -- Student-specific fields (nullable)
    credits integer default 0,
    customer_id text,
    price_id text,
    has_access boolean default false,
    package_name text,
    package_expiration timestamp with time zone,
    portuguese_level text check (portuguese_level in ('beginner', 'intermediate', 'advanced', 'native', 'unknown')),
    learning_goals text[],
    preferred_schedule text[] check (preferred_schedule <@ array['morning', 'afternoon', 'evening', 'night']),
    native_language text,
    other_languages text[],
    time_zone text,
    professional_background text,
    motivation_for_learning text,
    has_completed_onboarding boolean default false,
    scheduled_lessons integer default 0,
    -- Teacher-specific fields (nullable)
    biography text,
    specialties text[],
    languages text[]
);

-- Trigger to assign default role
create or replace function assign_default_role()
returns trigger as $$
begin
    new.role := coalesce(new.role, 'student'); -- Default role
    return new;
end;
$$ language plpgsql;

create trigger trg_assign_default_role
before insert on public.users
for each row execute function assign_default_role();

-- ===========================
-- RECURRING GROUPS TABLE
-- ===========================
create table public.recurring_groups (
    id uuid not null default uuid_generate_v4() primary key,
    user_id uuid not null references public.users (id) on delete cascade,
    schedule jsonb not null, -- e.g., {"pattern": "weekly", "days_of_week": [1, 3, 5]}
    occurrences integer not null check (occurrences > 0),
    end_type text check (end_type in ('after', 'on')),
    end_date timestamp with time zone,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp
);

-- ===========================
-- TEACHER AVAILABILITY TABLE
-- ===========================
create table public.teacher_availability (
    id serial primary key,
    teacher_id uuid not null references public.users (id) on delete cascade,
    start_time timestamp with time zone not null,
    end_time timestamp with time zone not null check (end_time > start_time),
    is_available boolean default true,
    recurring_rules jsonb, -- e.g., {"pattern": "weekly", "days_of_week": [1]}
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp
);

-- Enable realtime for teacher_availability
alter table public.teacher_availability replica identity full;

-- ===========================
-- CLASSES TABLE
-- ===========================
create table public.classes (
    id uuid not null default uuid_generate_v4() primary key,
    student_id uuid not null references public.users (id) on delete cascade,
    teacher_id uuid not null references public.users (id) on delete cascade,
    title text not null,
    start_time timestamp with time zone not null,
    end_time timestamp with time zone not null check (end_time > start_time),
    status text not null default 'pending' check (status in ('pending', 'scheduled', 'cancelled', 'completed')),
    metadata jsonb, -- e.g., {"notes": "Student needs help with pronunciation", "recurring_group_id": "..."}
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp
);

-- Enable realtime for classes table
alter table public.classes replica identity full;

-- ===========================
-- TRIGGERS
-- ===========================

-- Refund credits on cancellation
create or replace function refund_credits_on_cancellation()
returns trigger as $$
begin
    if new.status = 'cancelled' and (old.start_time - current_timestamp >= interval '24 hours') then
        update public.users
        set credits = credits + 1
        where id = new.student_id and role = 'student';
    end if;
    return new;
end;
$$ language plpgsql;

create trigger trg_refund_credits_on_cancellation
after update on public.classes
for each row execute function refund_credits_on_cancellation();

-- Validate class duration
create or replace function validate_class_duration()
returns trigger as $$
begin
    if (new.end_time - new.start_time) < interval '30 minutes' then
        raise exception 'Class duration must be at least 30 minutes.';
    end if;
    if (new.end_time - new.start_time) > interval '3 hours' then
        raise exception 'Class duration cannot exceed 3 hours.';
    end if;
    return new;
end;
$$ language plpgsql;

create trigger trg_validate_class_duration
before insert or update on public.classes
for each row execute function validate_class_duration();

-- Prevent scheduling without sufficient credits
create or replace function prevent_insufficient_credits()
returns trigger as $$
begin
    if (select credits from public.users where id = new.student_id and role = 'student') < 1 then
        raise exception 'Insufficient credits to schedule the class.';
    end if;
    return new;
end;
$$ language plpgsql;

create trigger trg_prevent_insufficient_credits
before insert on public.classes
for each row execute function prevent_insufficient_credits();

-- Prevent overlapping classes
create or replace function prevent_class_overlap()
returns trigger as $$
begin
    if exists (
        select 1
        from public.classes
        where (teacher_id = new.teacher_id or student_id = new.student_id)
        and (new.start_time, new.end_time) overlaps (start_time, end_time)
        and status in ('pending', 'scheduled')
        and id != new.id
    ) then
        raise exception 'Overlapping classes are not allowed.';
    end if;
    return new;
end;
$$ language plpgsql;

create trigger trg_prevent_class_overlap
before insert or update on public.classes
for each row execute function prevent_class_overlap();

-- ===========================
-- NOTIFICATIONS TABLE
-- ===========================
create table public.notifications (
    id serial primary key,
    user_id uuid not null references public.users (id) on delete cascade,
    type text not null,
    message text not null,
    metadata jsonb,
    is_read boolean default false,
    created_at timestamp with time zone default current_timestamp
);

alter table public.notifications replica identity full;

-- ===========================
-- ERROR LOGS TABLE
-- ===========================
create table public.error_logs (
    id serial primary key,
    occurred_at timestamp with time zone default current_timestamp,
    user_id uuid references public.users (id) on delete cascade,
    table_name text not null,
    operation text not null,
    error_message text not null
);

alter table public.error_logs replica identity full;

-- ===========================
-- POLICIES
-- ===========================
alter table public.users enable row level security;
alter table public.classes enable row level security;
alter table public.notifications enable row level security;
alter table public.error_logs enable row level security;

-- Students can only access their own data
create policy student_access_policy on public.users
using (id = auth.uid() and role = 'student');

-- Teachers can only access their own data
create policy teacher_access_policy on public.users
using (id = auth.uid() and role = 'teacher');

-- Classes can be accessed by the student or teacher involved
create policy class_access_policy on public.classes
using (student_id = auth.uid() or teacher_id = auth.uid());

-- Notifications are user-specific
create policy notification_access_policy on public.notifications
using (user_id = auth.uid());

-- Error logs are user-specific
create policy error_log_access_policy on public.error_logs
using (user_id = auth.uid());

-- Admin access to all tables
create policy admin_users_policy on public.users
using (current_setting('jwt.claims.role') = 'admin')
with check (true);

create policy admin_classes_policy on public.classes
using (current_setting('jwt.claims.role') = 'admin')
with check (true);

create policy admin_notifications_policy on public.notifications
using (current_setting('jwt.claims.role') = 'admin')
with check (true);

create policy admin_error_logs_policy on public.error_logs
using (current_setting('jwt.claims.role') = 'admin')
with check (true);

-- ===========================
-- INDEXES
-- ===========================
create index idx_teacher_availability_teacher_start_time on public.teacher_availability (teacher_id, start_time);
create index idx_classes_teacher_date on public.classes (teacher_id, start_time);
create index idx_classes_student_start_time on public.classes (student_id, start_time);
create index idx_error_logs_occurred_at on public.error_logs (occurred_at);

-- ===========================
-- AUTH TRIGGER FUNCTIONS
-- ===========================
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.users (
        id, email, first_name, last_name, avatar_url, role,
        credits, has_access, has_completed_onboarding
    )
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
        coalesce(new.raw_user_meta_data->>'last_name', ''),
        coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
        coalesce(new.raw_user_meta_data->>'role', 'student'),
        0, false, false
    );
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Enable realtime for relevant tables
alter publication supabase_realtime add table public.users;
alter publication supabase_realtime add table public.classes;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.error_logs;
alter publication supabase_realtime add table public.teacher_availability;
alter publication supabase_realtime add table public.recurring_groups;