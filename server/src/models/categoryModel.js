const db = require('../db');

// 1. Lấy tất cả danh mục
async function getAllCategories() {
  const sql = "SELECT * FROM categories";
  const [rows] = await db.query(sql);
  return rows;
}

// 2. Thêm danh mục mới (Có ảnh)
async function createCategory(data) {
  const { name, description, image_url } = data;
  const sql = "INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)";
  const [result] = await db.query(sql, [name, description, image_url || null]);
  return result.insertId;
}

// 3. Cập nhật danh mục (Có ảnh)
async function updateCategory(id, data) {
  const { name, description, image_url } = data;
  const sql = "UPDATE categories SET name = ?, description = ?, image_url = ? WHERE id = ?";
  const [result] = await db.query(sql, [name, description, image_url || null, id]);
  return result.affectedRows;
}

// 4. Xóa danh mục
async function deleteCategory(id) {
  const sql = "DELETE FROM categories WHERE id = ?";
  const [result] = await db.query(sql, [id]);
  return result.affectedRows;
}

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
