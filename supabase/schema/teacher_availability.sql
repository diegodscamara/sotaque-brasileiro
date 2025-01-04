create table
  public.teacher_availability (
    id serial,
    teacher_id uuid null,
    date date not null,
    start_time time without time zone not null,
    end_time time without time zone not null,
    is_available boolean null default true,
    created_at timestamp with time zone null default current_timestamp,
    updated_at timestamp with time zone null default current_timestamp,
    constraint teacher_availability_pkey primary key (id),
    constraint teacher_availability_teacher_id_fkey foreign key (teacher_id) references profiles (id) on delete cascade
  ) tablespace pg_default;

create index if not exists idx_teacher_availability_teacher_id on public.teacher_availability using btree (teacher_id) tablespace pg_default;

create index if not exists idx_teacher_availability_date on public.teacher_availability using btree (date) tablespace pg_default;

create trigger update_teacher_availability_updated_at before
update on teacher_availability for each row
execute function update_updated_at_column ();