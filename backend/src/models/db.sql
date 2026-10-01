CREATE TABLE role (
  id SERIAL PRIMARY KEY,
  role VARCHAR,
  created_at TIMESTAMP
);

CREATE TABLE permission (
  id SERIAL PRIMARY KEY,
  permission VARCHAR,
  created_at TIMESTAMP
);

CREATE TABLE role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER,
  permission_id INTEGER,
  CONSTRAINT fk_role_permissions_role
    FOREIGN KEY (role_id) REFERENCES role(id),
  CONSTRAINT fk_role_permissions_permission
    FOREIGN KEY (permission_id) REFERENCES permission(id)
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR,
  email UNIQUE VARCHAR NOT NULL, 
  password VARCHAR,
  avatar_url VARCHAR,
  activation_code UNIQUE VARCHAR, 
  role_id INTEGER NOT NULL,
  created_at TIMESTAMP,
  CONSTRAINT fk_users_role
FOREIGN KEY (role_id) REFERENCES role(id)
);

CREATE TABLE class (
  id SERIAL PRIMARY KEY,
  name VARCHAR,
  code VARCHAR,
  teacher_id INTEGER NOT NULL,
  status VARCHAR,
  created_at TIMESTAMP,
  CONSTRAINT fk_class_teacher
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

CREATE TABLE class_student (
  id SERIAL PRIMARY KEY,
  class_id INTEGER,
  student_id INTEGER ,
  jouind_at TIMESTAMP,
  CONSTRAINT fk_class_student_class
    FOREIGN KEY (class_id) REFERENCES class(id),
  CONSTRAINT fk_class_student_user
    FOREIGN KEY (student_id) REFERENCES users(id)
);

CREATE TABLE letters (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR,
  name VARCHAR,
  emoji VARCHAR,
  example VARCHAR
  order_index INTEGER
);

CREATE TABLE letter_lessons (
  id SERIAL PRIMARY KEY,
  letter_id INTEGER,
  type VARCHAR,
  title VARCHAR,
  order_index INTEGER,
  is_lastLesson BOOLEAN,
  CONSTRAINT fk_letter_lessons_letter
    FOREIGN KEY (letter_id) REFERENCES letters(id)
);

CREATE TABLE video_lessons (
  id SERIAL PRIMARY KEY,
  letter_id INTEGER,
  lesson_id INTEGER,
  title VARCHAR,
  youtube_url VARCHAR,
  description VARCHAR ,
  duration TIME,
  CONSTRAINT fk_video_lessons_letter
    FOREIGN KEY (letter_id) REFERENCES letters(id),
  CONSTRAINT fk_video_lessons_lesson
    FOREIGN KEY (lesson_id) REFERENCES letter_lessons(id)
);

CREATE TABLE games_lessons (
    id SERIAL PRIMARY KEY,

    letter_id INTEGER,
    lesson_id INTEGER,
    game_type VARCHAR,
    order_index INTEGER,

    CONSTRAINT fk_games_lessons_letter
        FOREIGN KEY (letter_id)
        REFERENCES letters(id),

    CONSTRAINT fk_games_lessons_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES letter_lessons(id),

    CONSTRAINT unique_letter_game
        UNIQUE (letter_id, game_type)
);


CREATE TABLE game_configs (
  id SERIAL PRIMARY KEY,
  letter_id INTEGER,
  lesson_id INTEGER,
  game_type VARCHAR,
  data JSONB NOT NULL,
  CONSTRAINT fk_game_configs_letter
    FOREIGN KEY (letter_id) REFERENCES letters(id),
  CONSTRAINT fk_games_lessons_lesson
    FOREIGN KEY (lesson_id) REFERENCES letter_lessons(id)
);
CREATE TABLE student_game_results (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL,
  games_lessons_id INTEGER NOT NULL,
  score INTEGER DEFAULT 0,
  duration INTEGER, -- بالثواني (أفضل من TIME)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_student_game_results_student
    FOREIGN KEY (student_id) REFERENCES users(id),
  CONSTRAINT fk_student_game_results_lesson_game
    FOREIGN KEY (games_lessons_id) REFERENCES games_lessons(id),
  CONSTRAINT unique_student_game
    UNIQUE (student_id, games_lessons_id)
);

CREATE TABLE questions_lessons (
  id SERIAL PRIMARY KEY,
  letter_id INTEGER,
  lesson_id INTEGER,
  question_text VARCHAR,
  correct_answer VARCHAR,
  question_type VARCHAR,
  CONSTRAINT fk_questions_lessons_letter
    FOREIGN KEY (letter_id) REFERENCES letters(id),
  CONSTRAINT fk_questions_lessons_lesson
    FOREIGN KEY (lesson_id) REFERENCES letter_lessons(id)
);

CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,

    letter_id INTEGER,
    user_id INTEGER,
    lesson_type VARCHAR,
    lesson_id INTEGER,
    score INTEGER,
    completed BOOLEAN,
    updated_at TIMESTAMP,

    CONSTRAINT fk_user_progress_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_user_progress_lessons
        FOREIGN KEY (lesson_id)
        REFERENCES letter_lessons(id),

    CONSTRAINT fk_user_progress_letter
        FOREIGN KEY (letter_id)
        REFERENCES letters(id),

    CONSTRAINT user_progress_user_letter_lesson_unique
        UNIQUE (user_id, letter_id, lesson_id)
);

CREATE TABLE student_answers (
  id SERIAL PRIMARY KEY,
  lessons_id INTEGER,
  user_id INTEGER,
  question_id INTEGER,
  answer VARCHAR,
  is_correct BOOLEAN,
  score INTEGER,
  answerd_at TIMESTAMP,
  CONSTRAINT fk_student_answers_user
    FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_student_answers_lesson
    FOREIGN KEY (lessons_id) REFERENCES letter_lessons(id),
  CONSTRAINT fk_student_answers_question
    FOREIGN KEY (question_id) REFERENCES questions_lessons(id)
);

CREATE TABLE student_lesson_result (
  id SERIAL PRIMARY KEY,
  lessons_id INTEGER,
  user_id INTEGER,
  total_score INTEGER,
  is_completed BOOLEAN,
  updated_at TIMESTAMP,
  CONSTRAINT fk_student_lesson_result_user
    FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_student_lesson_result_lesson
    FOREIGN KEY (lessons_id) REFERENCES letter_lessons(id)
);




