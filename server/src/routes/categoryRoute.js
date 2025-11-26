const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Public: Lấy danh sách
router.get('/', categoryController.getCategories);

// Admin only: Thêm, Sửa, Xóa
router.post('/', authenticateToken, requireAdmin, categoryController.createCategory);
router.put('/:id', authenticateToken, requireAdmin, categoryController.updateCategory);
router.delete('/:id', authenticateToken, requireAdmin, categoryController.deleteCategory);

module.exports = router;
