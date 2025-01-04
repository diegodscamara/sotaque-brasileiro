create table
  public.recurring_groups (
    id uuid not null default uuid_generate_v4 (),
    student_id uuid not null,
    pattern text not null,
    days_of_week integer[] not null,
    occurrences integer not null,
    end_type text not null,
    end_date timestamp with time zone null,
    created_at timestamp with time zone null default now(),
    updated_at timestamp with time zone null default now(),
    constraint recurring_groups_pkey primary key (id),
    constraint recurring_groups_student_id_fkey foreign key (student_id) references profiles (id)
  ) tablespace pg_default;