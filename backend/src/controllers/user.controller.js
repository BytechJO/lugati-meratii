const pool = require("../models/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const activationDB = require("../models/activationDB");
//===================register ======================//
// const register = async (req, res) => {
//   const { username, email, password, role_id } = req.body;
//   const encryptedPassword = await bcrypt.hash(password, 10);

//   const query = `INSERT INTO users  (username,email,password,avatar_url,role_id) VALUES ($1,$2,$3,$4,$5) RETURNING *`;
//   const value = [
//     username,
//     email.toLowerCase(),
//     encryptedPassword,
//     "https://media.istockphoto.com/id/2151669184/vector/vector-flat-illustration-in-grayscale-avatar-user-profile-person-icon-gender-neutral.jpg?s=612x612&w=0&k=20&c=UEa7oHoOL30ynvmJzSCIPrwwopJdfqzBs0q69ezQoM8=",
//     role_id,
//   ];

//   try {
//     const response = await pool.query(query, value);
//     if (response.rowCount) {
//       res.status(201).json({
//         success: true,
//         message: "User account created successfully",
//         response: response.rows,
//       });
//     }
//   } catch (error) {
//     if (error.constraint === "users_email_key") {
//       res.status(409).json({
//         success: false,
//         message: "The email already exists",
//       });
//     }
//     if (error.constraint === "chk_email") {
//       res.status(409).json({
//         success: false,
//         message: "The email you entered is not correct",
//       });
//     } else {
//       res.status(500).json({
//         message: "Server Error",
//         error: error.message,
//       });
//     }
//   }
// };

/**
 * POST /auth/register-with-activation
 */
const register = async (req, res) => {
  const {
    username,
    email,
    password,
    activation_code,
    requested_role, // 'student' | 'teacher'
  } = req.body;

  if (!username || !email || !password || !activation_code || !requested_role) {
    return res.status(400).json({
      success: false,
      message: "جميع الحقول مطلوبة",
    });
  }
  const normalizedEmail = email.toLowerCase().trim();

  const strictGmailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|outlook)\.com$/;

  if (!strictGmailRegex.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: "يجب استخدام بريد إلكتروني من نوع @gmail.com او outlook فقط",
    });
  }
  const veryStrongPasswordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

  if (!veryStrongPasswordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message:
        "كلمة المرور يجب أن تحتوي على 8 أحرف على الاقل، حروف، ارقام، ورمز خاص",
    });
  }

  try {
    /* ----------------------------------------------------
       1️⃣ Check activation code (activationDB)
    ---------------------------------------------------- */
    const codeResult = await activationDB.query(
      `
      SELECT id, role, is_used
      FROM activation_codes
      WHERE code = $1 AND book_id = 7
      `,
      [activation_code],
    );

    if (!codeResult.rowCount) {
      return res.status(400).json({
        success: false,
        message: "كود تفعيل غير صالح",
      });
    }

    const code = codeResult.rows[0];

    if (code.is_used) {
      return res.status(400).json({
        success: false,
        message: "كود التفعيل مستخدم مسبقاً",
      });
    }

    /* ----------------------------------------------------
       2️⃣ Check email uniqueness (Project DB)
    ---------------------------------------------------- */
    const emailCheck = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [normalizedEmail],
    );

    if (emailCheck.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: "هذا البريد الإلكتروني مستخدم مسبقاً",
      });
    }

    /* ----------------------------------------------------
       3️⃣ Check role match
    ---------------------------------------------------- */
    if (code.role !== requested_role) {
      return res.status(403).json({
        success: false,
        message:
          requested_role === "teacher"
            ? "هذا كود تفعيل خاص بالطلاب"
            : "هذا كود تفعيل خاص بالمعلمين",
      });
    }

    /* ----------------------------------------------------
       4️⃣ Create user (Project DB)
    ---------------------------------------------------- */
    const encryptedPassword = await bcrypt.hash(password, 10);
    const role_id = requested_role === "teacher" ? 3 : 2;

    const insertUserQuery = `
      INSERT INTO users
        (username, email, password, avatar_url, role_id, activation_code, created_at)
      VALUES
        ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id
    `;

    const insertValues = [
      username,
      normalizedEmail,
      encryptedPassword,
      "https://media.istockphoto.com/id/2151669184/vector/vector-flat-illustration-in-grayscale-avatar-user-profile-person-icon-gender-neutral.jpg",
      role_id,
      activation_code,
    ];

    const userResult = await pool.query(insertUserQuery, insertValues);
    const userId = userResult.rows[0].id;

    /* ----------------------------------------------------
       5️⃣ Mark activation code as used (activationDB)
    ---------------------------------------------------- */
    await activationDB.query(
      `
      UPDATE activation_codes
      SET
        is_used = TRUE,
        used_at = NOW()
      WHERE id = $1
      `,
      [code.id],
    );

    /* ----------------------------------------------------
       6️⃣ Success
    ---------------------------------------------------- */
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user_id: userId,
    });
  } catch (error) {
    console.log("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "خطأ في الشبكة",
      err: error,
    });
  }
};

// =================== login ======================//

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    /* ----------------------------------------------------
       1️⃣ Get user (Project DB)
    ---------------------------------------------------- */
    const userResult = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email.toLowerCase()],
    );

    if (userResult.rowCount === 0) {
      return res.status(403).json({
        success: false,
        message: "البريد الاكتروني او كلمة السر غير صحيحة ",
      });
    }

    const user = userResult.rows[0];

    /* ----------------------------------------------------
       2️⃣ Compare password
    ---------------------------------------------------- */
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(403).json({
        success: false,
        message: "البريد الاكتروني او كلمة السر غير صحيحة ",
      });
    }

    if (!user.activation_code) {
      return res.status(403).json({
        success: false,
        message: "لا يوجد كود تفعيل مرتبط بهذا الحساب",
      });
    }

    /* ----------------------------------------------------
       3️⃣ Check activation via code (External DB)
    ---------------------------------------------------- */
    const activationResult = await activationDB.query(
      `
      SELECT 1
      FROM activation_codes
      WHERE code = $1
        AND is_used = true
        AND used_at IS NOT NULL
        AND used_at + (validity_months || ' months')::INTERVAL > NOW()
      LIMIT 1
      `,
      [user.activation_code],
    );

    if (activationResult.rowCount === 0) {
      return res.status(403).json({
        success: false,
        message: "انتهت صلاحية كود التفعيل، لا يمكنك تسجيل الدخول إلى الموقع",
      });
    }

    /* ----------------------------------------------------
       4️⃣ Generate token
    ---------------------------------------------------- */
    const payload = {
      userId: user.id,
      role: user.role_id,
    };

    const token = jwt.sign(payload, process.env.SECRET, {
      expiresIn: "10d",
    });

    return res.status(200).json({
      success: true,
      token,
      userId: user.id,
      role: user.role_id,
      username: user.username,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// const login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     /* ----------------------------------------------------
//        1️⃣ Get user (Project API)
//     ---------------------------------------------------- */
//     const userResult = await pool.query(
//       `SELECT * FROM users WHERE email = $1`,
//       [email.toLowerCase()]
//     );

//     if (userResult.rowCount === 0) {
//       return res.status(403).json({
//         success: false,
//         message: "Invalid email or password",
//       });
//     }

//     const user = userResult.rows[0];

//     /* ----------------------------------------------------
//        2️⃣ Compare password
//     ---------------------------------------------------- */
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(403).json({
//         success: false,
//         message: "Invalid email or password",
//       });
//     }

//     /* ----------------------------------------------------
//        3️⃣ Check activation (External API)
//     ---------------------------------------------------- */
//     const activationResult = await activationDB.query(
//       `
//       SELECT 1
//       FROM users u
//       JOIN user_books ub ON ub.user_id = u.id
//       WHERE u.email = $1
//         AND ub.is_active = true
//         AND ub.expires_at > NOW()
//       LIMIT 1
//       `,
//       [email.toLowerCase()]
//     );

//     if (activationResult.rowCount === 0) {
//       return res.status(403).json({
//         success: false,
//         message:
//           "انتهت صلاحية التفعيل. لا يمكنك الدخول إلى الموقع، يرجى إعادة التفعيل.",
//       });
//     }

//     /* ----------------------------------------------------
//        4️⃣ Generate token
//     ---------------------------------------------------- */
//     const payload = {
//       userId: user.id,
//       role: user.role_id,
//     };

//     const token = jwt.sign(payload, process.env.SECRET, {
//       expiresIn: "10d",
//     });

//     return res.status(200).json({
//       success: true,
//       token,
//       userId: user.id,
//       role: user.role_id,
//       username: user.username,
//     });
//   } catch (err) {
//     console.error("LOGIN ERROR:", err);

//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

//===================get user by id ======================//

const getUserById = async (req, res) => {
  const id = req.token.userId;
  const values = [id];
  console.log(id);

  const query = `SELECT * FROM  users WHERE id=$1 AND is_deleted=0`;
  try {
    const response = await pool.query(query, values);
    if (response.rowCount) {
      res.status(200).json({
        status: true,
        data: response.rows,
      });
    } else {
      res.status(404).json({
        status: false,
        message: "User not found",
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

//===================get all users ======================//
const getAllUsers = async (req, res) => {
  const query = `SELECT * FROM  users`;
  try {
    const response = await pool.query(query, values);
    if (response.rowCount) {
      res.status(200).json({
        status: true,
        data: response.rows,
      });
    } else {
      res.status(404).json({
        status: false,
        message: "User not found",
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

// ================== update user ==================//
const updateUser = async (req, res) => {
  const { email, password } = req.body;
  const userId = req.params.id; // /users/:id

  // تحقق بسيط
  if (!email || !password) {
    return res.status(400).json({
      status: false,
      message: "Nothing to update",
    });
  }

  try {
    const query = `
      UPDATE users
      SET
        email = COALESCE($1, email),
        password = COALESCE($2, password)
      WHERE id = $3
      RETURNING id, username, email;
    `;

    const values = [email || null, password || null, userId];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "User updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ================== delete user ==================
const deleteUser = async (req, res) => {
  const userId = req.params.id; // /users/:id

  try {
    const query = `
     UPDATE users
      SET
      is_deleted=1
      WHERE id = $1
      RETURNING *;
    `;

    const values = [userId];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "User deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    // FK error (مثلاً user مرتبط بكلاس)
    if (error.code === "23503") {
      return res.status(409).json({
        status: false,
        message: "Cannot delete user because it has related data",
      });
    }

    res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
};
