const pool = require("../models/db");
const crypto = require("crypto");

const generateSecureCode = (length = 6) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.randomBytes(length);
  let code = "";

  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }

  return code;
};

//===================create new class ======================//
const createNewClass = async (req, res) => {
  const { name } = req.body;
  const teacher_id = req.token.userId;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Class name is required",
    });
  }

  const classCode = generateSecureCode();
  console.log(classCode);

  const query = `
    INSERT INTO "class" (name, code, teacher_id)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const values = [name, classCode, teacher_id];

  try {
    const response = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: "Class created successfully",
      data: response.rows[0],
    });
  } catch (error) {
    // في حال خليتي code UNIQUE
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Class code already exists, try again",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
//===================get All Classes for admin ======================//
const getAllClasses = async (req, res) => {
  const query = `SELECT * FROM  "class" WHERE is_deleted=0`;
  try {
    const response = await pool.query(query);
    if (response.rowCount) {
      res.status(200).json({
        status: true,
        data: response.rows,
      });
    } else {
      res.status(404).json({
        status: false,
        message: "Class not found",
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

//===================get All Classes by admin and teacher for admin ======================//
const getClassById = async (req, res) => {
  const id = req.params.id;
  const query = `SELECT * FROM  "class"  Where id=$1 and is_deleted=0`;
  try {
    const response = await pool.query(query, [id]);
    if (response.rowCount) {
      res.status(200).json({
        status: true,
        data: response.rows[0],
      });
    } else {
      res.status(404).json({
        status: false,
        message: "Class not found",
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

//===================update class name ======================//
const updateClassName = async (req, res) => {
  const id = req.params.id;
  const teacher_id = req.token.userId;
  const { name } = req.body;

  const query = `
    UPDATE "class"
    SET name = $1
    WHERE id = $2 AND teacher_id=$3 AND is_deleted = 0
    RETURNING *;
  `;

  try {
    const response = await pool.query(query, [name, id, teacher_id]);

    if (response.rowCount) {
      res.status(200).json({
        status: true,
        data: response.rows[0],
      });
    } else {
      res.status(404).json({
        status: false,
        message: "Class not found",
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

//===================delete class teacher and admin ======================//
const deleteClass = async (req, res) => {
  const id = req.params.id;
  const teacher_id = req.token.userId;

  const query = `
    UPDATE "class"
    SET is_deleted=1
    WHERE id = $1 AND teacher_id=$2 
    RETURNING *;
  `;

  try {
    const response = await pool.query(query, [id, teacher_id]);

    if (response.rowCount) {
      res.status(200).json({
        status: true,
        data: response.rows[0],
      });
    } else {
      res.status(404).json({
        status: false,
        message: "Class not found",
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

//===================get All Classes by teacher_id  ======================//
const getClassByTeacherId = async (req, res) => {
  const teacher_id = req.token.userId;
  const query = `  SELECT 
      c.id,
      c.name,
      c.code,
      c.status,
      c.created_at,
      COUNT(cs.student_id) AS students_count
    FROM class c
    LEFT JOIN class_student cs 
      ON cs.class_id = c.id
    WHERE c.teacher_id = $1
      AND c.is_deleted = 0
    GROUP BY c.id
    ORDER BY c.created_at DESC;`;
  try {
    const response = await pool.query(query, [teacher_id]);
    if (response.rowCount) {
      res.status(200).json({
        status: true,
        data: response.rows,
      });
    } else {
      res.status(404).json({
        status: false,
        message: "Theres is no class",
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

//=================== getMyClass   ======================//
const getMyClass = async (req, res) => {
  const student_id = req.token.userId;

  const query = `
    SELECT c.*
    FROM class_student cs
    INNER JOIN "class" c ON cs.class_id = c.id
    WHERE cs.student_id = $1
      AND cs.is_deleted = 0
      AND c.is_deleted = 0
    LIMIT 1;
  `;

  try {
    const result = await pool.query(query, [student_id]);

    if (result.rowCount) {
      res.status(200).json({
        success: true,
        data: result.rows[0],
      });
    } else {
      res.status(200).json({
        success: true,
        data: null,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

//=================== addStudentToClass   ======================//
const addStudentToClass = async (req, res) => {
  const { code } = req.body;
  const student_id = req.token.userId;
  const query = `
   INSERT INTO class_student (student_id, class_id)
SELECT $1, id
FROM "class"
WHERE code = $2
  AND is_deleted = 0
RETURNING *;

  `;

  try {
    const response = await pool.query(query, [student_id, code]);

    if (response.rowCount) {
      res.status(201).json({
        status: true,
        message: "Student added to class successfully",
        data: response.rows[0],
      });
    } else {
      res.status(404).json({
        status: false,
        message: "Invalid class code",
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

//=================== removeStudentFromClass for teacher ======================//
const removeStudentFromClass = async (req, res) => {
  const class_id = req.params.id;
  const { student_id } = req.body;
  const query = `
   UPDATE class_student
SET is_deleted = 1
WHERE class_id = $1
  AND student_id = $2
  AND is_deleted = 0
RETURNING *;


  `;
  try {
    const response = await pool.query(query, [class_id, student_id]);

    if (response.rowCount) {
      res.status(200).json({
        status: true,
        message: "Student removed from class successfully",
        data: response.rows[0],
      });
    } else {
      res.status(404).json({
        status: false,
        message: "Student not found in this class",
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

//===================getStudentClasses ======================//
const getStudentClasses = async (req, res) => {
  const class_id = req.params.id;

  const query = `
SELECT 
  s.id,
  s.username,
  s.email,cs.jouind_at
FROM class_student cs
INNER JOIN users s
  ON cs.student_id = s.id
WHERE cs.class_id = $1
  AND cs.is_deleted = 0;
`;
  try {
    const response = await pool.query(query, [class_id]);

    if (response.rowCount) {
      res.status(200).json({
        status: true,
        message: "All student class successfully",
        data: response.rows,
      });
    } else {
      res.status(404).json({
        status: false,
        message: "No Student in this class",
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
module.exports = {
  createNewClass,
  getAllClasses,
  getClassById,
  updateClassName,
  deleteClass,
  getClassByTeacherId,
  addStudentToClass,
  removeStudentFromClass,
  getStudentClasses,
  getMyClass,
};
