CREATE SCHEMA "public";

CREATE TABLE
  "class" (
    "id" serial PRIMARY KEY,
    "name" varchar,
    "code" varchar,
    "teacher_id" integer NOT NULL,
    "status" varchar,
    "is_deleted" integer DEFAULT 0,
    "created_at" timestamp
    with
      time zone DEFAULT now ()
  );

CREATE TABLE
  "class_student" (
    "id" serial PRIMARY KEY,
    "class_id" integer,
    "student_id" integer,
    "jouind_at" timestamp DEFAULT now (),
    "is_deleted" integer DEFAULT 0
  );

CREATE TABLE
  "game_configs" (
    "id" serial PRIMARY KEY,
    "letter_id" integer,
    "lesson_id" integer,
    "game_type" varchar,
    "data" jsonb NOT NULL
  );

CREATE TABLE
  "games_lessons" (
    "id" serial PRIMARY KEY,
    "letter_id" integer,
    "lesson_id" integer,
    "game_type" varchar,
    "is_deleted" integer DEFAULT 0,
    "order_index" integer,
    CONSTRAINT "unique_letter_game" UNIQUE ("letter_id", "game_type")
  );

CREATE TABLE
  "letter_lessons" (
    "id" serial PRIMARY KEY,
    "type" varchar,
    "title" varchar,
    "order_index" integer,
    "is_lastlesson" boolean DEFAULT false,
    "is_deleted" integer DEFAULT 0
  );

CREATE TABLE
  "letters" (
    "id" serial PRIMARY KEY,
    "symbol" varchar,
    "name" varchar,
    "emoji" varchar,
    "order_index" integer,
    "is_deleted" integer DEFAULT 0,
    "example" varchar
  );

CREATE TABLE
  "permission" (
    "id" serial PRIMARY KEY,
    "permission" varchar,
    "is_deleted" integer DEFAULT 0
  );

CREATE TABLE
  "questions_lessons" (
    "id" serial PRIMARY KEY,
    "letter_id" integer,
    "lesson_id" integer,
    "question_text" varchar,
    "correct_answer" varchar,
    "question_type" varchar,
    "is_deleted" integer DEFAULT 0
  );

CREATE TABLE
  "role" (
    "id" serial PRIMARY KEY,
    "role" varchar,
    "is_deleted" integer DEFAULT 0
  );

CREATE TABLE
  "role_permissions" (
    "id" serial PRIMARY KEY,
    "role_id" integer,
    "permission_id" integer,
    "is_deleted" integer DEFAULT 0
  );

CREATE TABLE
  "student_answers" (
    "id" serial PRIMARY KEY,
    "lessons_id" integer,
    "user_id" integer,
    "question_id" integer,
    "answer" varchar,
    "is_correct" boolean,
    "score" integer,
    "answerd_at" timestamp,
    "is_deleted" integer DEFAULT 0,
    CONSTRAINT "unique_student_question" UNIQUE ("lessons_id", "user_id", "question_id")
  );

CREATE TABLE
  "student_game_results" (
    "id" serial PRIMARY KEY,
    "student_id" integer NOT NULL,
    "games_lessons_id" integer NOT NULL,
    "score" integer DEFAULT 0,
    "duration" integer,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "unique_student_game" UNIQUE ("student_id", "games_lessons_id")
  );

CREATE TABLE
  "student_lesson_result" (
    "id" serial PRIMARY KEY,
    "lessons_id" integer,
    "user_id" integer,
    "total_score" integer,
    "is_completed" boolean,
    "updated_at" timestamp,
    "is_deleted" integer DEFAULT 0,
    CONSTRAINT "unique_student_lesson" UNIQUE ("lessons_id", "user_id")
  );

CREATE TABLE
  "user_progress" (
    "id" serial PRIMARY KEY,
    "letter_id" integer,
    "user_id" integer,
    "lesson_type" varchar,
    "lesson_id" integer,
    "score" integer,
    "completed" boolean,
    "updated_at" timestamp,
    CONSTRAINT "user_progress_user_letter_lesson_unique" UNIQUE ("user_id", "letter_id", "lesson_id")
  );

CREATE TABLE
  "users" (
    "id" serial PRIMARY KEY,
    "username" varchar,
    "email" varchar,
    "password" varchar,
    "avatar_url" varchar,
    "role_id" integer NOT NULL,
    "created_at" timestamp
    with
      time zone DEFAULT now (),
      "is_deleted" integer DEFAULT 0,
      "activation_code" varchar(50)
  );

CREATE TABLE
  "video_lessons" (
    "id" serial PRIMARY KEY,
    "letter_id" integer,
    "lesson_id" integer,
    "title" varchar,
    "youtube_url" varchar DEFAULT 'https://www.youtube.com/iframe_api',
    "duration" time,
    "is_deleted" integer DEFAULT 0,
    "description" varchar
  );

CREATE UNIQUE INDEX "class_pkey" ON "class" ("id");

CREATE UNIQUE INDEX "class_student_pkey" ON "class_student" ("id");

CREATE UNIQUE INDEX "game_configs_pkey" ON "game_configs" ("id");

CREATE UNIQUE INDEX "games_lessons_pkey" ON "games_lessons" ("id");

CREATE UNIQUE INDEX "unique_letter_game" ON "games_lessons" ("letter_id", "game_type");

CREATE UNIQUE INDEX "letter_lessons_pkey" ON "letter_lessons" ("id");

CREATE UNIQUE INDEX "letters_pkey" ON "letters" ("id");

CREATE UNIQUE INDEX "permission_pkey" ON "permission" ("id");

CREATE UNIQUE INDEX "questions_lessons_pkey" ON "questions_lessons" ("id");

CREATE UNIQUE INDEX "role_pkey" ON "role" ("id");

CREATE UNIQUE INDEX "role_permissions_pkey" ON "role_permissions" ("id");

CREATE UNIQUE INDEX "student_answers_pkey" ON "student_answers" ("id");

CREATE UNIQUE INDEX "unique_student_question" ON "student_answers" ("lessons_id", "user_id", "question_id");

CREATE UNIQUE INDEX "student_game_results_pkey" ON "student_game_results" ("id");

CREATE UNIQUE INDEX "unique_student_game" ON "student_game_results" ("student_id", "games_lessons_id");

CREATE UNIQUE INDEX "student_lesson_result_pkey" ON "student_lesson_result" ("id");

CREATE UNIQUE INDEX "unique_student_lesson" ON "student_lesson_result" ("lessons_id", "user_id");

CREATE UNIQUE INDEX "user_progress_pkey" ON "user_progress" ("id");

CREATE UNIQUE INDEX "user_progress_user_letter_lesson_unique" ON "user_progress" ("user_id", "letter_id", "lesson_id");

CREATE UNIQUE INDEX "users_pkey" ON "users" ("id");

CREATE UNIQUE INDEX "video_lessons_pkey" ON "video_lessons" ("id");

ALTER TABLE "class" ADD CONSTRAINT "fk_class_teacher" FOREIGN KEY ("teacher_id") REFERENCES "users" ("id");

ALTER TABLE "class_student" ADD CONSTRAINT "fk_class_student_class" FOREIGN KEY ("class_id") REFERENCES "class" ("id");

ALTER TABLE "class_student" ADD CONSTRAINT "fk_class_student_user" FOREIGN KEY ("student_id") REFERENCES "users" ("id");

ALTER TABLE "game_configs" ADD CONSTRAINT "fk_game_configs_letter" FOREIGN KEY ("letter_id") REFERENCES "letters" ("id");

ALTER TABLE "game_configs" ADD CONSTRAINT "fk_games_lessons_lesson" FOREIGN KEY ("lesson_id") REFERENCES "letter_lessons" ("id");

ALTER TABLE "games_lessons" ADD CONSTRAINT "fk_games_lessons_lesson" FOREIGN KEY ("lesson_id") REFERENCES "letter_lessons" ("id");

ALTER TABLE "games_lessons" ADD CONSTRAINT "fk_games_lessons_letter" FOREIGN KEY ("letter_id") REFERENCES "letters" ("id");

ALTER TABLE "questions_lessons" ADD CONSTRAINT "fk_questions_lessons_lesson" FOREIGN KEY ("lesson_id") REFERENCES "letter_lessons" ("id");

ALTER TABLE "questions_lessons" ADD CONSTRAINT "fk_questions_lessons_letter" FOREIGN KEY ("letter_id") REFERENCES "letters" ("id");

ALTER TABLE "role_permissions" ADD CONSTRAINT "fk_role_permissions_permission" FOREIGN KEY ("permission_id") REFERENCES "permission" ("id");

ALTER TABLE "role_permissions" ADD CONSTRAINT "fk_role_permissions_role" FOREIGN KEY ("role_id") REFERENCES "role" ("id");

ALTER TABLE "student_answers" ADD CONSTRAINT "fk_student_answers_lesson" FOREIGN KEY ("lessons_id") REFERENCES "letter_lessons" ("id");

ALTER TABLE "student_answers" ADD CONSTRAINT "fk_student_answers_question" FOREIGN KEY ("question_id") REFERENCES "questions_lessons" ("id");

ALTER TABLE "student_answers" ADD CONSTRAINT "fk_student_answers_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "student_game_results" ADD CONSTRAINT "fk_student_game_results_lesson_game" FOREIGN KEY ("games_lessons_id") REFERENCES "games_lessons" ("id");

ALTER TABLE "student_game_results" ADD CONSTRAINT "fk_student_game_results_student" FOREIGN KEY ("student_id") REFERENCES "users" ("id");

ALTER TABLE "student_lesson_result" ADD CONSTRAINT "fk_student_lesson_result_lesson" FOREIGN KEY ("lessons_id") REFERENCES "letter_lessons" ("id");

ALTER TABLE "student_lesson_result" ADD CONSTRAINT "fk_student_lesson_result_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "user_progress" ADD CONSTRAINT "fk_user_progress_lessons" FOREIGN KEY ("lesson_id") REFERENCES "letter_lessons" ("id");

ALTER TABLE "user_progress" ADD CONSTRAINT "fk_user_progress_letter" FOREIGN KEY ("letter_id") REFERENCES "letters" ("id");

ALTER TABLE "user_progress" ADD CONSTRAINT "fk_user_progress_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "users" ADD CONSTRAINT "fk_users_role" FOREIGN KEY ("role_id") REFERENCES "role" ("id");

ALTER TABLE "video_lessons" ADD CONSTRAINT "fk_video_lessons_lesson" FOREIGN KEY ("lesson_id") REFERENCES "letter_lessons" ("id");

ALTER TABLE "video_lessons" ADD CONSTRAINT "fk_video_lessons_letter" FOREIGN KEY ("letter_id") REFERENCES "letters" ("id");


























