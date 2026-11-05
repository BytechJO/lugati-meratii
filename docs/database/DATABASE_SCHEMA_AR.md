# السكيما الفعلية والعلاقات بين جداول المشروع

المصدر: قراءة مباشرة من كتالوج PostgreSQL باستخدام اتصال `DB_URL` الخاص بالمشروع، ضمن معاملة للقراءة فقط. لم تُقرأ سجلات الجداول ولم تُنفذ تغييرات على قاعدة البيانات.

وقت الالتقاط: 04/11/2026, 11:27:12 بتوقيت عمّان.

النتيجة: **16 جدولاً، 100 عمود، 24 علاقة Foreign Key**.

## ملفات الاستخراج

- [السكيما بصيغة SQL](project.schema.sql): تعريف الجداول والأعمدة والقيم الافتراضية والتسلسلات والقيود والفهارس المستخرجة فعلياً.
- [البيانات الوصفية بصيغة JSON](project.metadata.json): مرجع آلي للخصائص والعلاقات.
- هذا تصدير لبنية الجداول، وليس نسخة احتياطية كاملة من نوع `pg_dump`. لا يتضمن البيانات أو كلمات الاتصال أو ملكية الكائنات أو الصلاحيات أو الدوال أو تعريفات السياسات. لا توجد Views أو Triggers غير داخلية ضمن نتائج الاستعلامات لهذه القاعدة.
- اتصال `Activation_DB` غير مضبوط في ملف البيئة المحلي وقت المراجعة، ولذلك لم تُستخرج قاعدة التفعيل ولا جدول `activation_codes`. أي ربط معه في كود التطبيق ليس Foreign Key مثبتاً في هذا التصدير.

## كيف ترتبط أجزاء النظام؟

- المستخدم يرتبط بدور عبر `users.role_id`، والدور يرتبط بالصلاحيات عبر جدول الربط `role_permissions`.
- الصف يرتبط بمستخدم عبر `teacher_id`، ويربط `class_student` الطلاب بالصفوف. تسميات teacher وstudent تعبر عن دور التطبيق؛ المفتاح الأجنبي وحده لا يفرض نوع دور المستخدم.
- حسب تصميم المشروع الذي أكده صاحب المشروع، يحتوي `letter_lessons` خمسة دروس ثابتة مشتركة لكل الحروف. عدم وجود `letter_id` فيه مقصود؛ المحتوى والتقدم الخاصان بكل حرف يرتبطان بالحرف والدرس عبر جداول الفيديوهات والألعاب والأسئلة وإعدادات الألعاب والتقدم.
- إجابات الطالب ترتبط بالمستخدم والسؤال والدرس، ونتائج الألعاب ترتبط بالمستخدم واللعبة، ونتائج الدروس ترتبط بالمستخدم والدرس.
- الحذف المنطقي موجود في عدة جداول من خلال `is_deleted`؛ المفتاح الأجنبي لا يتحقق من هذه العلامة.

## رسم العلاقات الفعلية ERD

كل خط في الرسم يقابله Foreign Key موجود فعلياً. الدائرة عند جهة الأب تعني أن عمود الربط يقبل NULL، والخط يعني أن الارتباط إلزامي. جهة الأب يمكن أن ترتبط بصفر أو عدة سجلات تابعة.

```mermaid
erDiagram
  class {
    integer id PK
    character_varying name
    character_varying code
    integer teacher_id FK
    character_varying status
    integer is_deleted
    timestamp_with_time_zone created_at
  }
  class_student {
    integer id PK
    integer class_id FK
    integer student_id FK
    timestamp_without_time_zone jouind_at
    integer is_deleted
  }
  game_configs {
    integer id PK
    integer letter_id FK
    integer lesson_id FK
    character_varying game_type
    jsonb data
  }
  games_lessons {
    integer id PK
    integer letter_id FK
    integer lesson_id FK
    character_varying game_type
    integer is_deleted
    integer order_index
  }
  letter_lessons {
    integer id PK
    character_varying type
    character_varying title
    integer order_index
    boolean is_lastlesson
    integer is_deleted
  }
  letters {
    integer id PK
    character_varying symbol
    character_varying name
    character_varying emoji
    integer order_index
    integer is_deleted
    character_varying example
  }
  permission {
    integer id PK
    character_varying permission
    integer is_deleted
  }
  questions_lessons {
    integer id PK
    integer letter_id FK
    integer lesson_id FK
    character_varying question_text
    character_varying correct_answer
    character_varying question_type
    integer is_deleted
  }
  role {
    integer id PK
    character_varying role
    integer is_deleted
  }
  role_permissions {
    integer id PK
    integer role_id FK
    integer permission_id FK
    integer is_deleted
  }
  student_answers {
    integer id PK
    integer lessons_id FK
    integer user_id FK
    integer question_id FK
    character_varying answer
    boolean is_correct
    integer score
    timestamp_without_time_zone answerd_at
    integer is_deleted
  }
  student_game_results {
    integer id PK
    integer student_id FK
    integer games_lessons_id FK
    integer score
    integer duration
    timestamp_without_time_zone created_at
  }
  student_lesson_result {
    integer id PK
    integer lessons_id FK
    integer user_id FK
    integer total_score
    boolean is_completed
    timestamp_without_time_zone updated_at
    integer is_deleted
  }
  user_progress {
    integer id PK
    integer letter_id FK
    integer user_id FK
    character_varying lesson_type
    integer lesson_id FK
    integer score
    boolean completed
    timestamp_without_time_zone updated_at
  }
  users {
    integer id PK
    character_varying username
    character_varying email
    character_varying password
    character_varying avatar_url
    integer role_id FK
    timestamp_with_time_zone created_at
    integer is_deleted
    character_varying50 activation_code
  }
  video_lessons {
    integer id PK
    integer letter_id FK
    integer lesson_id FK
    character_varying title
    character_varying youtube_url
    time_without_time_zone duration
    integer is_deleted
    character_varying description
  }
  users ||--o{ class : "teacher_id"
  class |o--o{ class_student : "class_id"
  users |o--o{ class_student : "student_id"
  letters |o--o{ game_configs : "letter_id"
  letter_lessons |o--o{ game_configs : "lesson_id"
  letter_lessons |o--o{ games_lessons : "lesson_id"
  letters |o--o{ games_lessons : "letter_id"
  letter_lessons |o--o{ questions_lessons : "lesson_id"
  letters |o--o{ questions_lessons : "letter_id"
  permission |o--o{ role_permissions : "permission_id"
  role |o--o{ role_permissions : "role_id"
  letter_lessons |o--o{ student_answers : "lessons_id"
  questions_lessons |o--o{ student_answers : "question_id"
  users |o--o{ student_answers : "user_id"
  games_lessons ||--o{ student_game_results : "games_lessons_id"
  users ||--o{ student_game_results : "student_id"
  letter_lessons |o--o{ student_lesson_result : "lessons_id"
  users |o--o{ student_lesson_result : "user_id"
  letter_lessons |o--o{ user_progress : "lesson_id"
  letters |o--o{ user_progress : "letter_id"
  users |o--o{ user_progress : "user_id"
  role ||--o{ users : "role_id"
  letter_lessons |o--o{ video_lessons : "lesson_id"
  letters |o--o{ video_lessons : "letter_id"
```

## قائمة المفاتيح الأجنبية

| الجدول والعمود | الجدول والعمود المرجعي | تعريف القيد |
| --- | --- | --- |
| `class.teacher_id` | `users.id` | FOREIGN KEY (teacher_id) REFERENCES users(id) |
| `class_student.class_id` | `class.id` | FOREIGN KEY (class_id) REFERENCES class(id) |
| `class_student.student_id` | `users.id` | FOREIGN KEY (student_id) REFERENCES users(id) |
| `game_configs.letter_id` | `letters.id` | FOREIGN KEY (letter_id) REFERENCES letters(id) |
| `game_configs.lesson_id` | `letter_lessons.id` | FOREIGN KEY (lesson_id) REFERENCES letter_lessons(id) |
| `games_lessons.lesson_id` | `letter_lessons.id` | FOREIGN KEY (lesson_id) REFERENCES letter_lessons(id) |
| `games_lessons.letter_id` | `letters.id` | FOREIGN KEY (letter_id) REFERENCES letters(id) |
| `questions_lessons.lesson_id` | `letter_lessons.id` | FOREIGN KEY (lesson_id) REFERENCES letter_lessons(id) |
| `questions_lessons.letter_id` | `letters.id` | FOREIGN KEY (letter_id) REFERENCES letters(id) |
| `role_permissions.permission_id` | `permission.id` | FOREIGN KEY (permission_id) REFERENCES permission(id) |
| `role_permissions.role_id` | `role.id` | FOREIGN KEY (role_id) REFERENCES role(id) |
| `student_answers.lessons_id` | `letter_lessons.id` | FOREIGN KEY (lessons_id) REFERENCES letter_lessons(id) |
| `student_answers.question_id` | `questions_lessons.id` | FOREIGN KEY (question_id) REFERENCES questions_lessons(id) |
| `student_answers.user_id` | `users.id` | FOREIGN KEY (user_id) REFERENCES users(id) |
| `student_game_results.games_lessons_id` | `games_lessons.id` | FOREIGN KEY (games_lessons_id) REFERENCES games_lessons(id) |
| `student_game_results.student_id` | `users.id` | FOREIGN KEY (student_id) REFERENCES users(id) |
| `student_lesson_result.lessons_id` | `letter_lessons.id` | FOREIGN KEY (lessons_id) REFERENCES letter_lessons(id) |
| `student_lesson_result.user_id` | `users.id` | FOREIGN KEY (user_id) REFERENCES users(id) |
| `user_progress.lesson_id` | `letter_lessons.id` | FOREIGN KEY (lesson_id) REFERENCES letter_lessons(id) |
| `user_progress.letter_id` | `letters.id` | FOREIGN KEY (letter_id) REFERENCES letters(id) |
| `user_progress.user_id` | `users.id` | FOREIGN KEY (user_id) REFERENCES users(id) |
| `users.role_id` | `role.id` | FOREIGN KEY (role_id) REFERENCES role(id) |
| `video_lessons.lesson_id` | `letter_lessons.id` | FOREIGN KEY (lesson_id) REFERENCES letter_lessons(id) |
| `video_lessons.letter_id` | `letters.id` | FOREIGN KEY (letter_id) REFERENCES letters(id) |

## الأعمدة والقيود لكل جدول

تعرض خانة «يقبل NULL» السماح بالقيمة الفارغة حسب كتالوج القاعدة. القيم الافتراضية تعريفات بنيوية وليست سجلات مستخدمين.

### public.class

| العمود | النوع | يقبل NULL | القيمة الافتراضية |
| --- | --- | --- | --- |
| `id` | integer | لا | nextval('class_id_seq'::regclass) |
| `name` | character varying | نعم | — |
| `code` | character varying | نعم | — |
| `teacher_id` | integer | لا | — |
| `status` | character varying | نعم | — |
| `is_deleted` | integer | نعم | 0 |
| `created_at` | timestamp with time zone | نعم | now() |

القيود:

- `class_pkey`: `PRIMARY KEY (id)`.
- `fk_class_teacher`: `FOREIGN KEY (teacher_id) REFERENCES users(id)`.

### public.class_student

| العمود | النوع | يقبل NULL | القيمة الافتراضية |
| --- | --- | --- | --- |
| `id` | integer | لا | nextval('class_student_id_seq'::regclass) |
| `class_id` | integer | نعم | — |
| `student_id` | integer | نعم | — |
| `jouind_at` | timestamp without time zone | نعم | now() |
| `is_deleted` | integer | نعم | 0 |

القيود:

- `class_student_pkey`: `PRIMARY KEY (id)`.
- `fk_class_student_class`: `FOREIGN KEY (class_id) REFERENCES class(id)`.
- `fk_class_student_user`: `FOREIGN KEY (student_id) REFERENCES users(id)`.

### public.game_configs

| العمود | النوع | يقبل NULL | القيمة الافتراضية |
| --- | --- | --- | --- |
| `id` | integer | لا | nextval('game_configs_id_seq'::regclass) |
| `letter_id` | integer | نعم | — |
| `lesson_id` | integer | نعم | — |
| `game_type` | character varying | نعم | — |
| `data` | jsonb | لا | — |

القيود:

- `fk_game_configs_letter`: `FOREIGN KEY (letter_id) REFERENCES letters(id)`.
- `fk_games_lessons_lesson`: `FOREIGN KEY (lesson_id) REFERENCES letter_lessons(id)`.
- `game_configs_pkey`: `PRIMARY KEY (id)`.

### public.games_lessons

| العمود | النوع | يقبل NULL | القيمة الافتراضية |
| --- | --- | --- | --- |
| `id` | integer | لا | nextval('games_lessons_id_seq'::regclass) |
| `letter_id` | integer | نعم | — |
| `lesson_id` | integer | نعم | — |
| `game_type` | character varying | نعم | — |
| `is_deleted` | integer | نعم | 0 |
| `order_index` | integer | نعم | — |

القيود:

- `fk_games_lessons_lesson`: `FOREIGN KEY (lesson_id) REFERENCES letter_lessons(id)`.
- `fk_games_lessons_letter`: `FOREIGN KEY (letter_id) REFERENCES letters(id)`.
- `games_lessons_pkey`: `PRIMARY KEY (id)`.
- `unique_letter_game`: `UNIQUE (letter_id, game_type)`.

### public.letter_lessons

| العمود | النوع | يقبل NULL | القيمة الافتراضية |
| --- | --- | --- | --- |
| `id` | integer | لا | nextval('letter_lessons_id_seq'::regclass) |
| `type` | character varying | نعم | — |
| `title` | character varying | نعم | — |
| `order_index` | integer | نعم | — |
| `is_lastlesson` | boolean | نعم | false |
| `is_deleted` | integer | نعم | 0 |

القيود:

- `letter_lessons_pkey`: `PRIMARY KEY (id)`.

### public.letters

| العمود | النوع | يقبل NULL | القيمة الافتراضية |
| --- | --- | --- | --- |
| `id` | integer | لا | nextval('letters_id_seq'::regclass) |
| `symbol` | character varying | نعم | — |
| `name` | character varying | نعم | — |
| `emoji` | character varying | نعم | — |
| `order_index` | integer | نعم | — |
| `is_deleted` | integer | نعم | 0 |
| `example` | character varying | نعم | — |

القيود:

- `letters_pkey`: `PRIMARY KEY (id)`.

### public.permission

| العمود | النوع | يقبل NULL | القيمة الافتراضية |
| --- | --- | --- | --- |
| `id` | integer | لا | nextval('permission_id_seq'::regclass) |
| `permission` | character varying | نعم | — |
| `is_deleted` | integer | نعم | 0 |

القيود:

- `permission_pkey`: `PRIMARY KEY (id)`.

### public.questions_lessons

| العمود | النوع | يقبل NULL | القيمة الافتراضية |
| --- | --- | --- | --- |
| `id` | integer | لا | nextval('questions_lessons_id_seq'::regclass) |
| `letter_id` | integer | نعم | — |
| `lesson_id` | integer | نعم | — |
| `question_text` | character varying | نعم | — |
| `correct_answer` | character varying | نعم | — |
| `question_type` | character varying | نعم | — |
| `is_deleted` | integer | نعم | 0 |

القيود:

- `fk_questions_lessons_lesson`: `FOREIGN KEY (lesson_id) REFERENCES letter_lessons(id)`.
- `fk_questions_lessons_letter`: `FOREIGN KEY (letter_id) REFERENCES letters(id)`.
- `questions_lessons_pkey`: `PRIMARY KEY (id)`.

### public.role

| العمود | النوع | يقبل NULL | القيمة الافتراضية |
| --- | --- | --- | --- |
| `id` | integer | لا | nextval('role_id_seq'::regclass) |
| `role` | character varying | نعم | — |
| `is_deleted` | integer | نعم | 0 |

القيود:

- `role_pkey`: `PRIMARY KEY (id)`.

### public.role_permissions

| العمود | النوع | يقبل NULL | القيمة الافتراضية |
| --- | --- | --- | --- |
| `id` | integer | لا | nextval('role_permissions_id_seq'::regclass) |
| `role_id` | integer | نعم | — |
| `permission_id` | integer | نعم | — |
| `is_deleted` | integer | نعم | 0 |

القيود:

- `fk_role_permissions_permission`: `FOREIGN KEY (permission_id) REFERENCES permission(id)`.
- `fk_role_permissions_role`: `FOREIGN KEY (role_id) REFERENCES role(id)`.
- `role_permissions_pkey`: `PRIMARY KEY (id)`.

### public.student_answers

| العمود | النوع | يقبل NULL | القيمة الافتراضية |
| --- | --- | --- | --- |
| `id` | integer | لا | nextval('student_answers_id_seq'::regclass) |
| `lessons_id` | integer | نعم | — |
| `user_id` | integer | نعم | — |
| `question_id` | integer | نعم | — |
| `answer` | character varying | نعم | — |
| `is_correct` | boolean | نعم | — |
| `score` | integer | نعم | — |
| `answerd_at` | timestamp without time zone | نعم | — |
| `is_deleted` | integer | نعم | 0 |

القيود:

- `fk_student_answers_lesson`: `FOREIGN KEY (lessons_id) REFERENCES letter_lessons(id)`.
- `fk_student_answers_question`: `FOREIGN KEY (question_id) REFERENCES questions_lessons(id)`.
- `fk_student_answers_user`: `FOREIGN KEY (user_id) REFERENCES users(id)`.
- `student_answers_pkey`: `PRIMARY KEY (id)`.
- `unique_student_question`: `UNIQUE (lessons_id, user_id, question_id)`.

### public.student_game_results

| العمود | النوع | يقبل NULL | القيمة الافتراضية |
| --- | --- | --- | --- |
| `id` | integer | لا | nextval('student_game_results_id_seq'::regclass) |
| `student_id` | integer | لا | — |
| `games_lessons_id` | integer | لا | — |
| `score` | integer | نعم | 0 |
| `duration` | integer | نعم | — |
| `created_at` | timestamp without time zone | نعم | CURRENT_TIMESTAMP |

القيود:

- `fk_student_game_results_lesson_game`: `FOREIGN KEY (games_lessons_id) REFERENCES games_lessons(id)`.
- `fk_student_game_results_student`: `FOREIGN KEY (student_id) REFERENCES users(id)`.
- `student_game_results_pkey`: `PRIMARY KEY (id)`.
- `unique_student_game`: `UNIQUE (student_id, games_lessons_id)`.

### public.student_lesson_result

| العمود | النوع | يقبل NULL | القيمة الافتراضية |
| --- | --- | --- | --- |
| `id` | integer | لا | nextval('student_lesson_result_id_seq'::regclass) |
| `lessons_id` | integer | نعم | — |
| `user_id` | integer | نعم | — |
| `total_score` | integer | نعم | — |
| `is_completed` | boolean | نعم | — |
| `updated_at` | timestamp without time zone | نعم | — |
| `is_deleted` | integer | نعم | 0 |

القيود:

- `fk_student_lesson_result_lesson`: `FOREIGN KEY (lessons_id) REFERENCES letter_lessons(id)`.
- `fk_student_lesson_result_user`: `FOREIGN KEY (user_id) REFERENCES users(id)`.
- `student_lesson_result_pkey`: `PRIMARY KEY (id)`.
- `unique_student_lesson`: `UNIQUE (lessons_id, user_id)`.

### public.user_progress

| العمود | النوع | يقبل NULL | القيمة الافتراضية |
| --- | --- | --- | --- |
| `id` | integer | لا | nextval('user_progress_id_seq'::regclass) |
| `letter_id` | integer | نعم | — |
| `user_id` | integer | نعم | — |
| `lesson_type` | character varying | نعم | — |
| `lesson_id` | integer | نعم | — |
| `score` | integer | نعم | — |
| `completed` | boolean | نعم | — |
| `updated_at` | timestamp without time zone | نعم | — |

القيود:

- `fk_user_progress_lessons`: `FOREIGN KEY (lesson_id) REFERENCES letter_lessons(id)`.
- `fk_user_progress_letter`: `FOREIGN KEY (letter_id) REFERENCES letters(id)`.
- `fk_user_progress_user`: `FOREIGN KEY (user_id) REFERENCES users(id)`.
- `user_progress_pkey`: `PRIMARY KEY (id)`.
- `user_progress_user_letter_lesson_unique`: `UNIQUE (user_id, letter_id, lesson_id)`.

### public.users

| العمود | النوع | يقبل NULL | القيمة الافتراضية |
| --- | --- | --- | --- |
| `id` | integer | لا | nextval('users_id_seq'::regclass) |
| `username` | character varying | نعم | — |
| `email` | character varying | نعم | — |
| `password` | character varying | نعم | — |
| `avatar_url` | character varying | نعم | — |
| `role_id` | integer | لا | — |
| `created_at` | timestamp with time zone | نعم | now() |
| `is_deleted` | integer | نعم | 0 |
| `activation_code` | character varying(50) | نعم | — |

القيود:

- `fk_users_role`: `FOREIGN KEY (role_id) REFERENCES role(id)`.
- `users_pkey`: `PRIMARY KEY (id)`.

### public.video_lessons

| العمود | النوع | يقبل NULL | القيمة الافتراضية |
| --- | --- | --- | --- |
| `id` | integer | لا | nextval('video_lessons_id_seq'::regclass) |
| `letter_id` | integer | نعم | — |
| `lesson_id` | integer | نعم | — |
| `title` | character varying | نعم | — |
| `youtube_url` | character varying | نعم | 'https://www.youtube.com/iframe_api'::character varying |
| `duration` | time without time zone | نعم | — |
| `is_deleted` | integer | نعم | 0 |
| `description` | character varying | نعم | — |

القيود:

- `fk_video_lessons_lesson`: `FOREIGN KEY (lesson_id) REFERENCES letter_lessons(id)`.
- `fk_video_lessons_letter`: `FOREIGN KEY (letter_id) REFERENCES letters(id)`.
- `video_lessons_pkey`: `PRIMARY KEY (id)`.

## ملاحظات مستندة إلى البنية الفعلية

- الدروس الخمسة كتالوج مشترك؛ لا يحتاج التطبيق إلى إنشاء أو حذف درس لكل حرف. أزيلت وظائف ومسارات إنشاء وحذف الدروس من الخادم، وصُححت الاستعلامات لتربط الحرف بالمحتوى والتقدم بدلاً من افتراض `letter_lessons.letter_id`. ملفات SQL الأصلية بقيت كما هي، وتعريف `db.sql` المحلي المختلف ليس مرجع البنية الفعلية.
- وجود `letter_id` و`lesson_id` معاً في عدة جداول لا يفرض تلقائياً أن الحرف والدرس يشكلان اقتراناً صحيحاً؛ القيود الحالية تتحقق من وجود كل مرجع على حدة.
- `users.activation_code` عمود نصي، ولا توجد له علاقة FK في قاعدة المشروع إلى قاعدة التفعيل المنفصلة.
- القيد الفريد في `student_game_results` يجمع الطالب واللعبة؛ وبالاشتراك مع منطق Upsert الحالي، يعكس السجل النتيجة المحدّثة وليس تاريخ المحاولات.
- نتائج الاستخراج تمثل وقت الالتقاط فقط. لا يختبر هذا العمل استعادة السكيما في قاعدة جديدة ولا يغير البيانات.

## إعادة الاستخراج

من مجلد `backend` بعد ضبط الاتصال في `.env`:

```powershell
node scripts/export-schema.cjs
node scripts/document-schema.cjs
```

الأمر الأول يستعلم عن الكتالوج فقط ويحفظ الملفات محلياً، والثاني يولد هذه الوثيقة من JSON. لا تستخدم `app.js` للاستخراج، لتجنب تشغيل التطبيق أو تسجيل سلسلة اتصال التفعيل.
