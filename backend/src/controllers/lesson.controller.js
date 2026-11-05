const pool = require("../models/db");

// Lessons are a fixed catalog shared by all letters; content is letter-specific.

//================= get lessons by letters id ======================//

const getLessonsByLetterId = async (req, res) => {
  // Keep the existing route compatible; every letter uses the same catalog.
  const query = `
    SELECT *
    FROM letter_lessons
    WHERE is_deleted = 0
    ORDER BY order_index ASC;
  `;

  try {
    const response = await pool.query(query);

    if (response.rowCount) {
      res.status(200).json({
        success: true,
        data: response.rows,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No lessons found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

//================= get lessons by lesson id ======================//

const getLessonById = async (req, res) => {
  const lesson_id = req.params.id;

  const query = `
    SELECT *
    FROM letter_lessons
    WHERE id = $1 AND is_deleted=0;
  `;

  try {
    const response = await pool.query(query, [lesson_id]);

    if (response.rowCount) {
      res.status(200).json({
        success: true,
        data: response.rows[0],
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

//================= addVideoLesson  ======================//
const addVideoLesson = async (req, res) => {
  const { letter_id, lesson_id, title, youtube_url, duration } = req.body;

  try {
    // Lessons are shared; validate the lesson and letter independently.
    const lessonCheck = await pool.query(
      `
      SELECT id
      FROM letter_lessons
      WHERE id = $1 AND is_deleted = 0
        AND EXISTS (SELECT 1 FROM letters WHERE id = $2 AND is_deleted = 0);
      `,
      [lesson_id, letter_id]
    );

    if (!lessonCheck.rowCount) {
      return res.status(400).json({
        success: false,
        message: "Lesson or letter not found",
      });
    }

    // 2️⃣ إدخال الفيديو
    const insertQuery = `
      INSERT INTO video_lessons
      (letter_id, lesson_id, title, youtube_url, duration)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const response = await pool.query(insertQuery, [
      letter_id,
      lesson_id,
      title,
      youtube_url,
      duration,
    ]);

    res.status(201).json({
      success: true,
      message: "Video lesson added successfully",
      data: response.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

//================= addVideoLesson  ======================//
const getVideoLessonsByLetterAndLesson = async (req, res) => {
  const { letter_id, lesson_id } = req.params;

  if (!letter_id || !lesson_id) {
    return res.status(400).json({
      success: false,
      message: "letter_id and lesson_id are required",
    });
  }

  const query = `
    SELECT 
      vl.id AS video_id,
      vl.title AS video_title,
      vl.youtube_url,
      vl.description,
      vl.duration,
     
      ll.id AS lesson_id, 
      ll.title AS lesson_title,
      ll.order_index,
      ll.is_lastLesson
    FROM video_lessons vl
    JOIN letter_lessons ll ON ll.id = vl.lesson_id
    WHERE vl.letter_id = $1 
      AND vl.lesson_id = $2
      AND ll.is_deleted = 0
    ORDER BY ll.order_index ASC;
  `;

  try {
    const response = await pool.query(query, [letter_id, lesson_id]);

    if (response.rowCount) {
      res.status(200).json({
        success: true,
        data: response.rows,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No video lessons found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

//================= addGameLesson ======================//
const addGameLesson = async (req, res) => {
  const { lesson_id, letter_id, game_type, order_index } = req.body;

  if (!lesson_id || !game_type || order_index == null) {
    return res.status(400).json({
      success: false,
      message: "lesson_id, game_type and order_index are required",
    });
  }

  const query = `
    INSERT INTO games_lessons (lesson_id,letter_id, game_type, order_index)
    VALUES ($1, $2, $3,$4)
    RETURNING *;
  `;

  try {
    const response = await pool.query(query, [
      lesson_id,
      letter_id,
      game_type,
      order_index,
    ]);

    res.status(201).json({
      success: true,
      message: "Game added to lesson successfully",
      data: response.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

//================= addVideoLesson  ======================//

const getGamesByLetter = async (req, res) => {
  const letter_id = req.params.id;
  const game_type = req.query.type; // 👈 نوع اللعبة

  let query = `
    SELECT 
      gc.id AS game_config_id,
      gl.id AS game_lesson_id,   -- 👈 هذا اللي بدك إياه
      gc.game_type,
      gc.data
    FROM letter_lessons ll
    JOIN game_configs gc 
      ON gc.lesson_id = ll.id
    JOIN games_lessons gl
      ON gl.lesson_id = ll.id
      AND gl.game_type = gc.game_type
      AND gl.letter_id = gc.letter_id
    WHERE gc.letter_id = $1
      AND ll.is_lastLesson = true
  `;

  const values = [letter_id];

  // إذا تم إرسال type
  if (game_type) {
    query += ` AND gc.game_type = $2`;
    values.push(game_type);
  }

  query += ` ORDER BY gc.id ASC;`;

  try {
    const response = await pool.query(query, values);

    if (response.rowCount > 0) {
      res.status(200).json({
        success: true,
        data: response.rows,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No games found for this letter and type",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

//================= createGameConfig  ======================//
const createGameConfig = async (req, res) => {
  const { letter_id, lesson_id, game_type, data } = req.body;

  // Validation
  if (!letter_id || !lesson_id || !game_type || !data) {
    return res.status(400).json({
      success: false,
      message: "letter_id, lesson_id, game_type and data are required",
    });
  }

  const query = `
    INSERT INTO game_configs
    (letter_id, lesson_id, game_type, data)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  try {
    const response = await pool.query(query, [
      letter_id,
      lesson_id,
      game_type,
      data,
    ]);

    res.status(201).json({
      success: true,
      message: "Game config created successfully",
      data: response.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

//==================== get game by id ===================
const getGameById = async (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      gc.id,
      gc.game_type,
      gc.data
    FROM game_configs gc
    WHERE gc.id = $1;
  `;

  try {
    const response = await pool.query(query, [id]);

    if (response.rowCount > 0) {
      res.status(200).json({
        success: true,
        data: response.rows[0],
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

//==================== saveGameResult ===================
const saveGameResult = async (req, res) => {
  if (Number(req.token?.role) !== 2) {
    return res.status(403).json({
      success: false,
      message: "Only students can save game results",
    });
  }
  const { games_lessons_id, score, duration } = req.body;
  const student_id = req.token.userId;
  if (!student_id || !games_lessons_id) {
    return res.status(400).json({
      success: false,
      message: "student_id and games_lessons_id are required",
    });
  }

  const query = `
    INSERT INTO student_game_results
    (student_id, games_lessons_id, score, duration)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (student_id, games_lessons_id)
    DO UPDATE SET
      score = EXCLUDED.score,
      duration = EXCLUDED.duration,
      created_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  try {
    const response = await pool.query(query, [
      student_id,
      games_lessons_id,
      score ?? 0,
      duration,
    ]);

    res.status(200).json({
      success: true,
      message: "Game result saved successfully",
      data: response.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

//==================== getStudentGameResults ===================

const getStudentGameResults = async (req, res) => {
  const { student_id } = req.params;

  const query = `
    SELECT 
      sgr.id,
      sgr.score,
      sgr.duration,
      gl.game_type,
      l.symbol AS letter
    FROM student_game_results sgr
    JOIN games_lessons gl ON gl.id = sgr.games_lessons_id
    JOIN letters l ON l.id = gl.letter_id
    WHERE sgr.student_id = $1
    ORDER BY sgr.created_at DESC;
  `;

  try {
    const response = await pool.query(query, [student_id]);

    res.status(200).json({
      success: true,
      data: response.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

//==================== getStudentResultsByLetter ===================

const getStudentResultsByLetter = async (req, res) => {
  const { student_id, letter_id } = req.params;

  const query = `
    SELECT 
      gl.game_type,
      sgr.score,
      sgr.duration
    FROM student_game_results sgr
    JOIN games_lessons gl ON gl.id = sgr.games_lessons_id
    WHERE sgr.student_id = $1
      AND gl.letter_id = $2;
  `;

  try {
    const response = await pool.query(query, [student_id, letter_id]);

    res.status(200).json({
      success: true,
      data: response.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

//==================== getStudentProgress ===================

const getStudentProgress = async (req, res) => {
  const { student_id } = req.params;

  const query = `
    SELECT 
      l.id AS letter_id,
      l.symbol,
      COUNT(sgr.id) AS games_played,
      SUM(sgr.score) AS total_score
    FROM letters l
    LEFT JOIN games_lessons gl ON gl.letter_id = l.id
    LEFT JOIN student_game_results sgr 
      ON sgr.games_lessons_id = gl.id
      AND sgr.student_id = $1
    GROUP BY l.id, l.symbol
    ORDER BY l.id;
  `;

  try {
    const response = await pool.query(query, [student_id]);

    res.status(200).json({
      success: true,
      data: response.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

//==================== addQuestion ===================
const addQuestion = async (req, res) => {
  const { letter_id, lesson_id, question_text, correct_answer, question_type } =
    req.body;

  try {
    // 1️⃣ تحقق من الداتا الأساسية
    if (
      !letter_id ||
      !lesson_id ||
      !question_text ||
      !correct_answer ||
      !question_type
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Lessons are shared; validate the lesson and letter independently.
    const lessonCheck = await pool.query(
      `
      SELECT id FROM letter_lessons
      WHERE id = $1 AND is_deleted = 0
        AND EXISTS (SELECT 1 FROM letters WHERE id = $2 AND is_deleted = 0)
      `,
      [lesson_id, letter_id]
    );

    if (!lessonCheck.rowCount) {
      return res.status(400).json({
        success: false,
        message: "Lesson or letter not found",
      });
    }

    // 3️⃣ إدخال السؤال
    const insertQuery = `
      INSERT INTO questions_lessons
      (letter_id, lesson_id, question_text, correct_answer, question_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const result = await pool.query(insertQuery, [
      letter_id,
      lesson_id,
      question_text,
      correct_answer,
      question_type,
    ]);

    res.status(201).json({
      success: true,
      message: "Question added successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

//==================== getQuestionsByLesson ===================
const getQuestionsByLesson = async (req, res) => {
  const { letter_id, lesson_id } = req.query;

  try {
    // 1️⃣ تحقق من المدخلات
    if (!letter_id || !lesson_id) {
      return res.status(400).json({
        success: false,
        message: "letter_id and lesson_id are required",
      });
    }

    // 2️⃣ جلب الأسئلة
    const query = `
      SELECT
        q.id,
        q.question_text,
        q.correct_answer,
        q.question_type
      FROM questions_lessons q
      WHERE q.letter_id = $1
        AND q.lesson_id = $2
      ORDER BY q.id ASC;
    `;

    const result = await pool.query(query, [letter_id, lesson_id]);

    res.status(200).json({
      success: true,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

//==================== updateQuestion ===================
const updateQuestion = async (req, res) => {
  const { id } = req.params;
  const { question_text, correct_answer, question_type } = req.body;

  try {
    // 1️⃣ تحقق من وجود بيانات للتحديث
    if (!question_text && !correct_answer && !question_type) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update",
      });
    }

    // 2️⃣ تحديث السؤال
    const query = `
      UPDATE questions_lessons
      SET
        question_text = COALESCE($1, question_text),
        correct_answer = COALESCE($2, correct_answer),
        question_type = COALESCE($3, question_type)
      WHERE id = $4
      RETURNING *;
    `;

    const result = await pool.query(query, [
      question_text,
      correct_answer,
      question_type,
      id,
    ]);

    // 3️⃣ في حال السؤال غير موجود
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

//==================== deleteQuestion ===================
const deleteQuestion = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      UPDATE questions_lessons SET is_deleted=1
      WHERE id = $1
      RETURNING *;
    `;

    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const getLetterGamesProgress = async (req, res) => {
  try {
    const { letterId } = req.params;
    const studentId = req.token.userId; // أو req.params / req.body حسب نظامك

    const query = `
      SELECT
        gl.id AS game_lesson_id,
        gl.game_type,
        gl.order_index,
        CASE
          WHEN sgr.id IS NOT NULL THEN true
          ELSE false
        END AS is_played,
        COALESCE(sgr.score, 0) AS score,
        sgr.duration
      FROM games_lessons gl
      LEFT JOIN student_game_results sgr
        ON gl.id = sgr.games_lessons_id
        AND sgr.student_id = $1
      WHERE gl.letter_id = $2
      ORDER BY gl.order_index;
    `;

    const { rows } = await pool.query(query, [
      studentId,
      Number(letterId),
    ]);

    // لو ما في ألعاب أصلاً
    if (rows.length === 0) {
      return res.status(200).json({
        letterId: Number(letterId),
        totalGames: 0,
        playedGamesCount: 0,
        isCompleted: true,
        playedGames: [],
        unplayedGames: [],
      });
    }

    const playedGames = rows.filter((g) => g.is_played);
    const unplayedGames = rows.filter((g) => !g.is_played);

    res.status(200).json({
      letterId: Number(letterId),
      totalGames: rows.length,
      playedGamesCount: playedGames.length,
      isCompleted: playedGames.length === rows.length,
      playedGames,
      unplayedGames,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to get letter games progress",
    });
  }
};


const getGameLessonByLetterAndType = async (req, res) => {
  const { letter, gameType } = req.query;

  if (!letter || !gameType) {
    return res.status(400).json({
      success: false,
      message: "letter and gameType are required",
    });
  }

  try {
    const query = `
      SELECT
        gl.id AS game_lesson_id,
        gl.game_type,
        gl.lesson_id,
        gc.data,
        l.id AS letter_id,
        l.symbol
      FROM games_lessons gl
      JOIN letters l 
        ON l.id = gl.letter_id
      JOIN game_configs gc
        ON gc.letter_id = gl.letter_id
       AND gc.lesson_id = gl.lesson_id
       AND gc.game_type = gl.game_type
      WHERE l.symbol = $1
        AND gl.game_type = $2
      LIMIT 1;
    `;

    const result = await pool.query(query, [letter, gameType]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Game lesson not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getLessonsByLetterId,
  getLessonById,
  addVideoLesson,
  getVideoLessonsByLetterAndLesson,
  addGameLesson,
  createGameConfig,
  getGamesByLetter,
  getGameById,
  saveGameResult,
  getStudentGameResults,
  getStudentResultsByLetter,
  getStudentProgress,
  addQuestion,
  getQuestionsByLesson,
  updateQuestion,
  deleteQuestion,
  getLetterGamesProgress,getGameLessonByLetterAndType
};
