-- Create the recurring_groups table
create table if not exists public.recurring_groups (
  id uuid not null default uuid_generate_v4(),
  student_id uuid not null references public.profiles(id),
  pattern text not null,
  days_of_week integer[] not null,
  occurrences integer not null,
  end_type text not null,
  end_date timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  constraint recurring_groups_pkey primary key (id)
);

-- Enable row level security
alter table public.recurring_groups enable row level security;

-- Create policies for read, insert, update, and delete operations
create policy "Enable read access for all users" on public.recurring_groups
  for select using (true);

create policy "Enable insert for authenticated users only" on public.recurring_groups
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for users based on student_id" on public.recurring_groups
  for update using (auth.uid() = student_id);

create policy "Enable delete for users based on student_id" on public.recurring_groups
  for delete using (auth.uid() = student_id);