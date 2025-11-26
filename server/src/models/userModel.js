// models/userModel.js
const pool = require('../db');
const bcrypt = require('bcryptjs');

async function createUser(name, email, phone, password, role = 'customer') {
  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone, hashedPassword, role]
  );
  return result.insertId;
}

async function findUserByIdentifier(identifier) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ? OR phone = ?',
    [identifier, identifier]
  );
  return rows[0];
}

// Hàm sửa số điện thoại
const updateUserPhone = async (id, phone) => {
  const query = 'UPDATE users SET phone = ? WHERE id = ?';
  const [result] = await pool.query(query, [phone, id]);
  return result;
};

module.exports = {
  createUser,
  findUserByIdentifier,
  updateUserPhone
};
