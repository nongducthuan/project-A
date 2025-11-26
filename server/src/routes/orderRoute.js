const express = require('express');
const router = express.Router();
const { createOrderController, getOrders } = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Tạo đơn hàng (Yêu cầu đăng nhập)
router.post("/", createOrderController);

// Lấy lịch sử đơn hàng của user
router.get('/', authenticateToken, getOrders);

module.exports = router;
