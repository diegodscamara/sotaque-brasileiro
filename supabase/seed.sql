-- ===========================
-- STUDENTS TABLE
-- ===========================
create table public.students (
    id uuid not null default uuid_generate_v4(),
    name text not null,
    email text not null unique,
    avatar_url text,
    credits integer not null default 0,
    customer_id text,
    price_id text,
    has_access boolean default false,
    package_name text,
    package_expiration timestamp with time zone,
    role text not null default 'student',
    country text,
    gender text,
    portuguese_level character varying(20) check (portuguese_level = any (array['beginner', 'intermediate', 'advanced', 'native', 'unknown'])),
    learning_goals text[],
    availability_hours integer,
    preferred_schedule text[] check (preferred_schedule <@ array['morning', 'afternoon', 'evening', 'night']),
    native_language character varying(100),
    other_languages text[],
    time_zone text,
    professional_background text,
    motivation_for_learning text,
    has_completed_onboarding boolean default false,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    scheduled_lessons integer not null default 0,
    constraint students_pkey primary key (id)
);

-- Trigger to assign default role to students
create or replace function assign_default_role_students()
returns trigger as $$
begin
    if new.role is null then
        new.role := 'student'; -- Default role: 'student'
    end if;
    return new;
end;
$$ language plpgsql;

create trigger trg_assign_default_role_students
before insert on public.students
for each row execute function assign_default_role_students();

-- ===========================
-- RECURRING GROUPS TABLE
-- ===========================
create table public.recurring_groups (
    id uuid not null default uuid_generate_v4(),
    student_id uuid not null references public.students (id) on delete cascade,
    pattern text not null check (pattern = any (array['daily', 'weekly', 'monthly', 'custom'])),
    days_of_week integer[] not null check (array_length(days_of_week, 1) <= 7 and days_of_week <@ array[1, 2, 3, 4, 5, 6, 7]),
    occurrences integer not null check (occurrences > 0),
    end_type text check (end_type in ('after', 'on')),
    end_date timestamp with time zone,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    constraint recurring_groups_pkey primary key (id)
);

-- ===========================
-- TEACHERS TABLE
-- ===========================
create table public.teachers (
    id uuid not null default uuid_generate_v4(),
    name text not null,
    email text not null unique,
    full_name text,
    avatar_url text,
    biography text,
    specialties text[],
    languages text[],
    role text not null default 'teacher',
    country text,
    gender text,
    availability_hours integer not null,
    total_classes_given integer not null default 0,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    constraint teachers_pkey primary key (id)
);

-- Trigger to assign default role to teachers
create or replace function assign_default_role_teachers()
returns trigger as $$
begin
    if new.role is null then
        new.role := 'teacher'; -- Default role: 'teacher'
    end if;
    return new;
end;
$$ language plpgsql;

create trigger trg_assign_default_role_teachers
before insert on public.teachers
for each row execute function assign_default_role_teachers();

-- ===========================
-- TEACHER AVAILABILITY
-- ===========================
create table public.teacher_availability (
    id serial primary key,
    teacher_id uuid not null references public.teachers (id) on delete cascade,
    date date not null,
    start_time time without time zone not null,
    end_time time without time zone not null check (end_time > start_time),
    is_available boolean default true,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp
);

-- Prevent overlapping availability for the same teacher
create or replace function prevent_availability_overlap()
returns trigger as $$
begin
    if exists (
        select 1
        from public.teacher_availability
        where teacher_id = new.teacher_id
          and date = new.date
          and (new.start_time, new.end_time) overlaps (start_time, end_time)
    ) then
        raise exception 'Overlapping availability times for the same teacher.';
    end if;
    return new;
end;
$$ language plpgsql;

create trigger trg_prevent_availability_overlap
before insert or update on public.teacher_availability
for each row execute function prevent_availability_overlap();

-- Enable realtime for teacher_availability
alter table public.teacher_availability replica identity full;

-- ===========================
-- CLASSES TABLE
-- ===========================
create table public.classes (
    id uuid not null default uuid_generate_v4(),
    student_id uuid not null references public.students (id) on delete cascade,
    teacher_id uuid not null references public.teachers (id) on delete cascade,
    title text not null,
    start_time timestamp with time zone not null,
    end_time timestamp with time zone not null check (end_time > start_time),
    status text not null default 'pending' check (
        status = any (array['pending', 'scheduled', 'cancelled', 'completed'])
    ),
    notes text,
    credits_cost integer not null default 1,
    refund_credit boolean not null default true,
    recurring_group_id uuid default null references public.recurring_groups (id),
    is_rescheduled boolean default false,
    rescheduled_from_class_id uuid references public.classes (id),
    time_zone text not null,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    stripe_payment_id text,
    receipt_url text,
    constraint classes_pkey primary key (id)
);

-- Prevent scheduling without sufficient credits
create or replace function prevent_insufficient_credits()
returns trigger as $$
begin
    if (new.credits_cost > (select credits from public.students where id = new.student_id)) then
        raise exception 'Insufficient credits to schedule the class.';
    end if;
    return new;
end;
$$ language plpgsql;

create trigger trg_prevent_insufficient_credits
before insert on public.classes
for each row execute function prevent_insufficient_credits();

-- Prevent overlapping classes for the same teacher
create or replace function prevent_class_overlap()
returns trigger as $$
begin
    if exists (
        select 1
        from public.classes
        where teacher_id = new.teacher_id
        and (new.start_time, new.end_time) overlaps (start_time, end_time)
    ) then
        raise exception 'Overlapping classes for the same teacher are not allowed.';
    end if;
    return new;
end;
$$ language plpgsql;

create trigger trg_prevent_class_overlap
before insert or update on public.classes
for each row execute function prevent_class_overlap();

-- Enable realtime for classes table
alter table public.classes replica identity full;

-- ===========================
-- NOTIFICATIONS
-- ===========================
create table public.notifications (
    id serial primary key,
    user_id uuid not null,
    type text not null,
    message text not null,
    metadata jsonb,
    is_read boolean default false,
    created_at timestamp with time zone default current_timestamp
);

alter table public.notifications replica identity full;

-- ===========================
-- ERROR LOGS
-- ===========================
create table public.error_logs (
    id serial primary key,
    occurred_at timestamp with time zone default current_timestamp,
    user_id uuid references public.students (id) on delete cascade,
    table_name text not null,
    operation text not null,
    error_message text not null
);

alter table public.error_logs replica identity full;

-- ===========================
-- POLICIES
-- ===========================
-- Admin access to all tables
create policy admin_students_policy on public.students
using (current_setting('jwt.claims.role') = 'admin')
with check (true);

create policy admin_teachers_policy on public.teachers
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

-- Allow students and teachers to access their own data
create policy student_policy on public.students
using (id = current_setting('jwt.claims.user_id')::uuid);

create policy teacher_policy on public.teachers
using (id = current_setting('jwt.claims.user_id')::uuid);

create policy class_policy on public.classes
using (student_id = current_setting('jwt.claims.user_id')::uuid or teacher_id = current_setting('jwt.claims.user_id')::uuid);

-- Notifications RLS
create policy notifications_policy on public.notifications
using (user_id = current_setting('jwt.claims.user_id')::uuid);

-- ===========================
-- INDEXES
-- ===========================
create index if not exists idx_teacher_availability_teacher_date on public.teacher_availability (teacher_id, date);
create index if not exists idx_classes_teacher_date on public.classes (teacher_id, start_time);
create index if not exists idx_classes_student_start_time on public.classes (student_id, start_time);
create index if not exists idx_error_logs_occurred_at on public.error_logs (occurred_at);

-- ===========================
-- AUTH TRIGGER FUNCTIONS
-- ===========================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  selected_role text;
begin
  -- Get the selected role from metadata
  selected_role := new.raw_user_meta_data->>'role';
  
  if selected_role = 'teacher' then
    insert into public.teachers (
      id,
      email,
      name,
      avatar_url,
      role,
      availability_hours,
      total_classes_given
    ) values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
      'teacher',
      0,
      0
    );
  else
    insert into public.students (
      id,
      email,
      name,
      avatar_url,
      role,
      has_access,
      credits,
      has_completed_onboarding
    ) values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
      'student',
      false,
      0,
      false
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable realtime for students
alter publication supabase_realtime add table public.students;

-- Enable realtime for teachers
alter publication supabase_realtime add table public.teachers;
