const categoryModel = require('../models/categoryModel');

// Lấy danh sách danh mục
async function getCategories(req, res) {
  try {
    const categories = await categoryModel.getAllCategories();
    // Trả về cấu trúc { data: ... } để khớp với Frontend
    res.status(200).json({
      data: categories
    });
  } catch (err) {
    console.error("❌ Lỗi getCategories:", err);
    res.status(500).json({ message: 'Lỗi khi lấy danh mục' });
  }
}

// Tạo danh mục mới
async function createCategory(req, res) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Tên danh mục là bắt buộc" });

    const id = await categoryModel.createCategory(req.body);
    res.status(201).json({ message: "Tạo thành công", id });
  } catch (err) {
    console.error("❌ Lỗi createCategory:", err);
    res.status(500).json({ message: 'Lỗi khi thêm danh mục' });
  }
}

// Cập nhật
async function updateCategory(req, res) {
  try {
    const rows = await categoryModel.updateCategory(req.params.id, req.body);
    if (rows === 0) return res.status(404).json({ message: "Không tìm thấy danh mục" });

    res.json({ message: "Cập nhật thành công", affected: rows });
  } catch (err) {
    console.error("❌ Lỗi updateCategory:", err);
    res.status(500).json({ message: 'Lỗi khi cập nhật danh mục' });
  }
}

// Xóa
async function deleteCategory(req, res) {
  try {
    const rows = await categoryModel.deleteCategory(req.params.id);
    if (rows === 0) return res.status(404).json({ message: "Không tìm thấy danh mục" });

    res.json({ message: "Xóa thành công", affected: rows });
  } catch (err) {
    console.error("❌ Lỗi deleteCategory:", err);
    // Lỗi này thường do ràng buộc khóa ngoại (đang có sản phẩm thuộc danh mục này)
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'Không thể xóa danh mục đang chứa sản phẩm' });
    }
    res.status(500).json({ message: 'Lỗi khi xóa danh mục' });
  }
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
