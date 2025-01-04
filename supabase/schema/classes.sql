create table
  public.classes (
    id uuid not null default uuid_generate_v4 (),
    student_id uuid null,
    teacher_id uuid null,
    title text not null,
    start_time timestamp with time zone not null,
    end_time timestamp with time zone not null,
    notes text null,
    status text not null default 'scheduled'::text,
    type text not null default 'private'::text,
    credits_cost integer not null default 1,
    recurring_group_id uuid null,
    created_at timestamp with time zone null default current_timestamp,
    updated_at timestamp with time zone null default current_timestamp,
    time_zone text null,
    constraint classes_pkey primary key (id),
    constraint classes_student_id_fkey foreign key (student_id) references profiles (id) on delete cascade,
    constraint classes_teacher_id_fkey foreign key (teacher_id) references profiles (id) on delete cascade,
    constraint classes_status_check check (
      (
        status = any (
          array[
            'scheduled'::text,
            'confirmed'::text,
            'cancelled'::text,
            'completed'::text
          ]
        )
      )
    ),
    constraint classes_type_check check (
      (
        type = 'private'::text
      )
    )
  ) tablespace pg_default;

create index if not exists idx_classes_recurring_group_id on public.classes using btree (recurring_group_id) tablespace pg_default;

create index if not exists idx_classes_student_id on public.classes using btree (student_id) tablespace pg_default;

create index if not exists idx_classes_teacher_id on public.classes using btree (teacher_id) tablespace pg_default;

create index if not exists idx_classes_start_time on public.classes using btree (start_time) tablespace pg_default;

create trigger update_classes_updated_at before
update on classes for each row
execute function update_updated_at_column ();

create trigger update_scheduled_lessons_trigger
after insert
or delete
or
update on classes for each row
execute function update_scheduled_lessons ();

create trigger handle_class_credits_trigger
after insert
or delete
or
update on classes for each row
execute function handle_class_credits ();