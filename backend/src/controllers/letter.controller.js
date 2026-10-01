const pool = require("../models/db");

//===================createLetter ======================//
const createLetter = async (req, res) => {
  const { letters } = req.body;

  if (!letters || !letters.length) {
    return res.status(400).json({
      success: false,
      message: "No letters provided",
    });
  }

  const values = [];
  const placeholders = letters
    .map((l, index) => {
      const baseIndex = index * 5;
      values.push(l.symbol, l.name, l.example, l.emoji, l.order_index);
      return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${
        baseIndex + 4
      },$${baseIndex + 5})`;
    })
    .join(",");

  const query = `
    INSERT INTO letters (symbol, name, example, emoji ,order_index)
    VALUES ${placeholders}
    RETURNING *;
  `;

  try {
    const response = await pool.query(query, values);

    res.status(201).json({
      status: true,
      message: "Letters inserted successfully",
      count: response.rowCount,
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

//===================getAllLetter======================//
const getAllLetter = async (req, res) => {
  const query = `
   SELECT * FROM letters WHERE is_deleted =0 
  `;

  try {
    const response = await pool.query(query);

    res.status(201).json({
      status: true,
      message: "Letters get successfully",
      count: response.rowCount,
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

//===================getLetterById======================//
const getLetterById = async (req, res) => {
  const { id } = req.params;
  const query = `
   SELECT * FROM letters WHERE id=$1 AND is_deleted =0 
  `;

  try {
    const response = await pool.query(query, [id]);

    res.status(201).json({
      status: true,
      message: `Letter with ${id} get successfully`,
      count: response.rowCount,
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
module.exports = {
  createLetter,
  getAllLetter,
  getLetterById,
};
