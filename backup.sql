
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

ALTER SCHEMA "public" OWNER TO "postgres";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "wrappers" WITH SCHEMA "extensions";

CREATE TYPE "public"."Role" AS ENUM (
    'STUDENT',
    'TEACHER',
    'ADMIN'
);

ALTER TYPE "public"."Role" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."classes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "teacher_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "start_time" timestamp(6) with time zone NOT NULL,
    "end_time" timestamp(6) with time zone NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "public"."classes" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."error_logs" (
    "id" integer NOT NULL,
    "occurred_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "user_id" "uuid",
    "table_name" "text" NOT NULL,
    "operation" "text" NOT NULL,
    "error_message" "text" NOT NULL
);

ALTER TABLE "public"."error_logs" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."error_logs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."error_logs_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."error_logs_id_seq" OWNED BY "public"."error_logs"."id";

CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "message" "text" NOT NULL,
    "metadata" "jsonb",
    "is_read" boolean DEFAULT false,
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "public"."notifications" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."notifications_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."notifications_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."notifications_id_seq" OWNED BY "public"."notifications"."id";

CREATE TABLE IF NOT EXISTS "public"."recurring_groups" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "schedule" "jsonb" NOT NULL,
    "occurrences" integer NOT NULL,
    "end_type" "text",
    "end_date" timestamp(6) with time zone,
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "public"."recurring_groups" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."teacher_availability" (
    "id" integer NOT NULL,
    "teacher_id" "uuid" NOT NULL,
    "start_time" timestamp(6) with time zone NOT NULL,
    "end_time" timestamp(6) with time zone NOT NULL,
    "is_available" boolean DEFAULT true,
    "recurring_rules" "jsonb",
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "public"."teacher_availability" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."teacher_availability_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."teacher_availability_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."teacher_availability_id_seq" OWNED BY "public"."teacher_availability"."id";

CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "avatar_url" "text",
    "role" "public"."Role" NOT NULL,
    "country" "text",
    "gender" "text",
    "created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    "credits" integer DEFAULT 0,
    "customer_id" "text",
    "price_id" "text",
    "has_access" boolean DEFAULT false,
    "package_name" "text",
    "package_expiration" timestamp(6) with time zone,
    "portuguese_level" "text",
    "learning_goals" "text"[],
    "preferred_schedule" "text"[],
    "native_language" "text",
    "other_languages" "text"[],
    "time_zone" "text",
    "professional_background" "text",
    "motivation_for_learning" "text",
    "has_completed_onboarding" boolean DEFAULT false,
    "scheduled_lessons" integer DEFAULT 0,
    "biography" "text",
    "specialties" "text"[],
    "languages" "text"[]
);

ALTER TABLE "public"."users" OWNER TO "postgres";

ALTER TABLE ONLY "public"."error_logs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."error_logs_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."notifications" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."notifications_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."teacher_availability" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."teacher_availability_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."error_logs"
    ADD CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."recurring_groups"
    ADD CONSTRAINT "recurring_groups_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."teacher_availability"
    ADD CONSTRAINT "teacher_availability_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

CREATE INDEX "idx_classes_student_start_time" ON "public"."classes" USING "btree" ("student_id", "start_time");

CREATE INDEX "idx_classes_teacher_date" ON "public"."classes" USING "btree" ("teacher_id", "start_time");

CREATE INDEX "idx_error_logs_occurred_at" ON "public"."error_logs" USING "btree" ("occurred_at");

CREATE INDEX "idx_teacher_availability_teacher_start_time" ON "public"."teacher_availability" USING "btree" ("teacher_id", "start_time");

CREATE UNIQUE INDEX "users_email_key" ON "public"."users" USING "btree" ("email");

ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."error_logs"
    ADD CONSTRAINT "error_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."recurring_groups"
    ADD CONSTRAINT "recurring_groups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."teacher_availability"
    ADD CONSTRAINT "teacher_availability_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

CREATE PUBLICATION "supabase_realtime_messages_publication" WITH (publish = 'insert, update, delete, truncate');

ALTER PUBLICATION "supabase_realtime_messages_publication" OWNER TO "supabase_admin";

REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;

RESET ALL;
