create table
  public.profiles (
    id uuid not null,
    name text not null,
    email text not null,
    full_name text null,
    avatar_url text null,
    image text null,
    credits integer not null default 5,
    customer_id text null,
    price_id text null,
    has_access boolean null default false,
    country text null,
    role text null default 'student'::text,
    gender character varying(20) null,
    portuguese_level character varying(20) null,
    learning_goals text[] null,
    availability_hours integer null,
    preferred_schedule character varying(20) [] null,
    native_language character varying(100) null,
    other_languages text[] null,
    learning_style character varying(20) [] null,
    interests text[] null,
    professional_background text null,
    motivation_for_learning text null,
    has_completed_onboarding boolean null default false,
    preferred_class_type character varying(20) [] null,
    time_zone character varying(100) null,
    created_at timestamp with time zone null default current_timestamp,
    updated_at timestamp with time zone null default current_timestamp,
    scheduled_lessons integer not null default 0,
    package_expiration timestamp with time zone null,
    constraint profiles_pkey primary key (id),
    constraint profiles_email_key unique (email),
    constraint profiles_id_fkey foreign key (id) references auth.users (id) on delete cascade,
    constraint profiles_gender_check check (
      (
        (gender)::text = any (
          (
            array[
              'male'::character varying,
              'female'::character varying,
              'other'::character varying,
              'prefer_not_to_say'::character varying
            ]
          )::text[]
        )
      )
    ),
    constraint profiles_portuguese_level_check check (
      (
        (portuguese_level)::text = any (
          (
            array[
              'beginner'::character varying,
              'intermediate'::character varying,
              'advanced'::character varying,
              'native'::character varying,
              'unknown'::character varying
            ]
          )::text[]
        )
      )
    ),
    constraint profiles_role_check check (
      (
        role = any (
          array['admin'::text, 'teacher'::text, 'student'::text]
        )
      )
    ),
    constraint profiles_learning_style_check check (
      (
        (learning_style)::text[] <@ array[
          'visual'::text,
          'auditory'::text,
          'reading'::text,
          'kinesthetic'::text
        ]
      )
    ),
    constraint profiles_preferred_class_type_check check (
      (
        (preferred_class_type)::text[] <@ array[
          'one-on-one'::text,
          'group'::text,
          'self-paced'::text,
          'intensive'::text
        ]
      )
    ),
    constraint profiles_preferred_schedule_check check (
      (
        (preferred_schedule)::text[] <@ array[
          'morning'::text,
          'afternoon'::text,
          'evening'::text,
          'night'::text
        ]
      )
    )
  ) tablespace pg_default;

create index if not exists idx_profiles_id on public.profiles using btree (id) tablespace pg_default;

create trigger update_profiles_updated_at before
update on profiles for each row
execute function update_updated_at_column ();