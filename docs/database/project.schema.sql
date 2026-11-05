-- Actual table structure from a read-only catalog snapshot.
-- Captured at 2026-11-04T08:27:12.085Z
-- No table data or connection credentials included.
-- Structural export, not a full database backup. See metadata JSON for scope.
-- Intended for review; not executed against any database.

CREATE SCHEMA IF NOT EXISTS "public";
CREATE SEQUENCE "public"."class_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;
CREATE SEQUENCE "public"."class_student_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;
CREATE SEQUENCE "public"."game_configs_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;
CREATE SEQUENCE "public"."games_lessons_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;
CREATE SEQUENCE "public"."letter_lessons_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;
CREATE SEQUENCE "public"."letters_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;
CREATE SEQUENCE "public"."permission_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;
CREATE SEQUENCE "public"."questions_lessons_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;
CREATE SEQUENCE "public"."role_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;
CREATE SEQUENCE "public"."role_permissions_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;
CREATE SEQUENCE "public"."student_answers_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;
CREATE SEQUENCE "public"."student_game_results_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;
CREATE SEQUENCE "public"."student_lesson_result_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;
CREATE SEQUENCE "public"."user_progress_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;
CREATE SEQUENCE "public"."users_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;
CREATE SEQUENCE "public"."video_lessons_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;

CREATE TABLE "public"."class" (
  "id" integer DEFAULT nextval('class_id_seq'::regclass) NOT NULL,
  "name" character varying,
  "code" character varying,
  "teacher_id" integer NOT NULL,
  "status" character varying,
  "is_deleted" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE "public"."class_student" (
  "id" integer DEFAULT nextval('class_student_id_seq'::regclass) NOT NULL,
  "class_id" integer,
  "student_id" integer,
  "jouind_at" timestamp without time zone DEFAULT now(),
  "is_deleted" integer DEFAULT 0
);

CREATE TABLE "public"."game_configs" (
  "id" integer DEFAULT nextval('game_configs_id_seq'::regclass) NOT NULL,
  "letter_id" integer,
  "lesson_id" integer,
  "game_type" character varying,
  "data" jsonb NOT NULL
);

CREATE TABLE "public"."games_lessons" (
  "id" integer DEFAULT nextval('games_lessons_id_seq'::regclass) NOT NULL,
  "letter_id" integer,
  "lesson_id" integer,
  "game_type" character varying,
  "is_deleted" integer DEFAULT 0,
  "order_index" integer
);

CREATE TABLE "public"."letter_lessons" (
  "id" integer DEFAULT nextval('letter_lessons_id_seq'::regclass) NOT NULL,
  "type" character varying,
  "title" character varying,
  "order_index" integer,
  "is_lastlesson" boolean DEFAULT false,
  "is_deleted" integer DEFAULT 0
);

CREATE TABLE "public"."letters" (
  "id" integer DEFAULT nextval('letters_id_seq'::regclass) NOT NULL,
  "symbol" character varying,
  "name" character varying,
  "emoji" character varying,
  "order_index" integer,
  "is_deleted" integer DEFAULT 0,
  "example" character varying
);

CREATE TABLE "public"."permission" (
  "id" integer DEFAULT nextval('permission_id_seq'::regclass) NOT NULL,
  "permission" character varying,
  "is_deleted" integer DEFAULT 0
);

CREATE TABLE "public"."questions_lessons" (
  "id" integer DEFAULT nextval('questions_lessons_id_seq'::regclass) NOT NULL,
  "letter_id" integer,
  "lesson_id" integer,
  "question_text" character varying,
  "correct_answer" character varying,
  "question_type" character varying,
  "is_deleted" integer DEFAULT 0
);

CREATE TABLE "public"."role" (
  "id" integer DEFAULT nextval('role_id_seq'::regclass) NOT NULL,
  "role" character varying,
  "is_deleted" integer DEFAULT 0
);

CREATE TABLE "public"."role_permissions" (
  "id" integer DEFAULT nextval('role_permissions_id_seq'::regclass) NOT NULL,
  "role_id" integer,
  "permission_id" integer,
  "is_deleted" integer DEFAULT 0
);

CREATE TABLE "public"."student_answers" (
  "id" integer DEFAULT nextval('student_answers_id_seq'::regclass) NOT NULL,
  "lessons_id" integer,
  "user_id" integer,
  "question_id" integer,
  "answer" character varying,
  "is_correct" boolean,
  "score" integer,
  "answerd_at" timestamp without time zone,
  "is_deleted" integer DEFAULT 0
);

CREATE TABLE "public"."student_game_results" (
  "id" integer DEFAULT nextval('student_game_results_id_seq'::regclass) NOT NULL,
  "student_id" integer NOT NULL,
  "games_lessons_id" integer NOT NULL,
  "score" integer DEFAULT 0,
  "duration" integer,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "public"."student_lesson_result" (
  "id" integer DEFAULT nextval('student_lesson_result_id_seq'::regclass) NOT NULL,
  "lessons_id" integer,
  "user_id" integer,
  "total_score" integer,
  "is_completed" boolean,
  "updated_at" timestamp without time zone,
  "is_deleted" integer DEFAULT 0
);

CREATE TABLE "public"."user_progress" (
  "id" integer DEFAULT nextval('user_progress_id_seq'::regclass) NOT NULL,
  "letter_id" integer,
  "user_id" integer,
  "lesson_type" character varying,
  "lesson_id" integer,
  "score" integer,
  "completed" boolean,
  "updated_at" timestamp without time zone
);

CREATE TABLE "public"."users" (
  "id" integer DEFAULT nextval('users_id_seq'::regclass) NOT NULL,
  "username" character varying,
  "email" character varying,
  "password" character varying,
  "avatar_url" character varying,
  "role_id" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "is_deleted" integer DEFAULT 0,
  "activation_code" character varying(50)
);

CREATE TABLE "public"."video_lessons" (
  "id" integer DEFAULT nextval('video_lessons_id_seq'::regclass) NOT NULL,
  "letter_id" integer,
  "lesson_id" integer,
  "title" character varying,
  "youtube_url" character varying DEFAULT 'https://www.youtube.com/iframe_api'::character varying,
  "duration" time without time zone,
  "is_deleted" integer DEFAULT 0,
  "description" character varying
);
ALTER SEQUENCE "public"."class_id_seq" OWNED BY "public"."class"."id";
ALTER SEQUENCE "public"."class_student_id_seq" OWNED BY "public"."class_student"."id";
ALTER SEQUENCE "public"."game_configs_id_seq" OWNED BY "public"."game_configs"."id";
ALTER SEQUENCE "public"."games_lessons_id_seq" OWNED BY "public"."games_lessons"."id";
ALTER SEQUENCE "public"."letter_lessons_id_seq" OWNED BY "public"."letter_lessons"."id";
ALTER SEQUENCE "public"."letters_id_seq" OWNED BY "public"."letters"."id";
ALTER SEQUENCE "public"."permission_id_seq" OWNED BY "public"."permission"."id";
ALTER SEQUENCE "public"."questions_lessons_id_seq" OWNED BY "public"."questions_lessons"."id";
ALTER SEQUENCE "public"."role_id_seq" OWNED BY "public"."role"."id";
ALTER SEQUENCE "public"."role_permissions_id_seq" OWNED BY "public"."role_permissions"."id";
ALTER SEQUENCE "public"."student_answers_id_seq" OWNED BY "public"."student_answers"."id";
ALTER SEQUENCE "public"."student_game_results_id_seq" OWNED BY "public"."student_game_results"."id";
ALTER SEQUENCE "public"."student_lesson_result_id_seq" OWNED BY "public"."student_lesson_result"."id";
ALTER SEQUENCE "public"."user_progress_id_seq" OWNED BY "public"."user_progress"."id";
ALTER SEQUENCE "public"."users_id_seq" OWNED BY "public"."users"."id";
ALTER SEQUENCE "public"."video_lessons_id_seq" OWNED BY "public"."video_lessons"."id";
ALTER TABLE "public"."class" ADD CONSTRAINT "class_pkey" PRIMARY KEY (id);
ALTER TABLE "public"."class_student" ADD CONSTRAINT "class_student_pkey" PRIMARY KEY (id);
ALTER TABLE "public"."game_configs" ADD CONSTRAINT "game_configs_pkey" PRIMARY KEY (id);
ALTER TABLE "public"."games_lessons" ADD CONSTRAINT "games_lessons_pkey" PRIMARY KEY (id);
ALTER TABLE "public"."games_lessons" ADD CONSTRAINT "unique_letter_game" UNIQUE (letter_id, game_type);
ALTER TABLE "public"."letter_lessons" ADD CONSTRAINT "letter_lessons_pkey" PRIMARY KEY (id);
ALTER TABLE "public"."letters" ADD CONSTRAINT "letters_pkey" PRIMARY KEY (id);
ALTER TABLE "public"."permission" ADD CONSTRAINT "permission_pkey" PRIMARY KEY (id);
ALTER TABLE "public"."questions_lessons" ADD CONSTRAINT "questions_lessons_pkey" PRIMARY KEY (id);
ALTER TABLE "public"."role" ADD CONSTRAINT "role_pkey" PRIMARY KEY (id);
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY (id);
ALTER TABLE "public"."student_answers" ADD CONSTRAINT "student_answers_pkey" PRIMARY KEY (id);
ALTER TABLE "public"."student_answers" ADD CONSTRAINT "unique_student_question" UNIQUE (lessons_id, user_id, question_id);
ALTER TABLE "public"."student_game_results" ADD CONSTRAINT "student_game_results_pkey" PRIMARY KEY (id);
ALTER TABLE "public"."student_game_results" ADD CONSTRAINT "unique_student_game" UNIQUE (student_id, games_lessons_id);
ALTER TABLE "public"."student_lesson_result" ADD CONSTRAINT "student_lesson_result_pkey" PRIMARY KEY (id);
ALTER TABLE "public"."student_lesson_result" ADD CONSTRAINT "unique_student_lesson" UNIQUE (lessons_id, user_id);
ALTER TABLE "public"."user_progress" ADD CONSTRAINT "user_progress_pkey" PRIMARY KEY (id);
ALTER TABLE "public"."user_progress" ADD CONSTRAINT "user_progress_user_letter_lesson_unique" UNIQUE (user_id, letter_id, lesson_id);
ALTER TABLE "public"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY (id);
ALTER TABLE "public"."video_lessons" ADD CONSTRAINT "video_lessons_pkey" PRIMARY KEY (id);
ALTER TABLE "public"."class" ADD CONSTRAINT "fk_class_teacher" FOREIGN KEY (teacher_id) REFERENCES users(id);
ALTER TABLE "public"."class_student" ADD CONSTRAINT "fk_class_student_class" FOREIGN KEY (class_id) REFERENCES class(id);
ALTER TABLE "public"."class_student" ADD CONSTRAINT "fk_class_student_user" FOREIGN KEY (student_id) REFERENCES users(id);
ALTER TABLE "public"."game_configs" ADD CONSTRAINT "fk_game_configs_letter" FOREIGN KEY (letter_id) REFERENCES letters(id);
ALTER TABLE "public"."game_configs" ADD CONSTRAINT "fk_games_lessons_lesson" FOREIGN KEY (lesson_id) REFERENCES letter_lessons(id);
ALTER TABLE "public"."games_lessons" ADD CONSTRAINT "fk_games_lessons_lesson" FOREIGN KEY (lesson_id) REFERENCES letter_lessons(id);
ALTER TABLE "public"."games_lessons" ADD CONSTRAINT "fk_games_lessons_letter" FOREIGN KEY (letter_id) REFERENCES letters(id);
ALTER TABLE "public"."questions_lessons" ADD CONSTRAINT "fk_questions_lessons_lesson" FOREIGN KEY (lesson_id) REFERENCES letter_lessons(id);
ALTER TABLE "public"."questions_lessons" ADD CONSTRAINT "fk_questions_lessons_letter" FOREIGN KEY (letter_id) REFERENCES letters(id);
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "fk_role_permissions_permission" FOREIGN KEY (permission_id) REFERENCES permission(id);
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "fk_role_permissions_role" FOREIGN KEY (role_id) REFERENCES role(id);
ALTER TABLE "public"."student_answers" ADD CONSTRAINT "fk_student_answers_lesson" FOREIGN KEY (lessons_id) REFERENCES letter_lessons(id);
ALTER TABLE "public"."student_answers" ADD CONSTRAINT "fk_student_answers_question" FOREIGN KEY (question_id) REFERENCES questions_lessons(id);
ALTER TABLE "public"."student_answers" ADD CONSTRAINT "fk_student_answers_user" FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE "public"."student_game_results" ADD CONSTRAINT "fk_student_game_results_lesson_game" FOREIGN KEY (games_lessons_id) REFERENCES games_lessons(id);
ALTER TABLE "public"."student_game_results" ADD CONSTRAINT "fk_student_game_results_student" FOREIGN KEY (student_id) REFERENCES users(id);
ALTER TABLE "public"."student_lesson_result" ADD CONSTRAINT "fk_student_lesson_result_lesson" FOREIGN KEY (lessons_id) REFERENCES letter_lessons(id);
ALTER TABLE "public"."student_lesson_result" ADD CONSTRAINT "fk_student_lesson_result_user" FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE "public"."user_progress" ADD CONSTRAINT "fk_user_progress_lessons" FOREIGN KEY (lesson_id) REFERENCES letter_lessons(id);
ALTER TABLE "public"."user_progress" ADD CONSTRAINT "fk_user_progress_letter" FOREIGN KEY (letter_id) REFERENCES letters(id);
ALTER TABLE "public"."user_progress" ADD CONSTRAINT "fk_user_progress_user" FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE "public"."users" ADD CONSTRAINT "fk_users_role" FOREIGN KEY (role_id) REFERENCES role(id);
ALTER TABLE "public"."video_lessons" ADD CONSTRAINT "fk_video_lessons_lesson" FOREIGN KEY (lesson_id) REFERENCES letter_lessons(id);
ALTER TABLE "public"."video_lessons" ADD CONSTRAINT "fk_video_lessons_letter" FOREIGN KEY (letter_id) REFERENCES letters(id);
