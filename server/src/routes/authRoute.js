const express = require('express');
const router = express.Router();

// 1. Import đủ controller
const { register, login, updateProfile } = require('../controllers/authController');

// 2. Import middleware xác thực
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);

// 3. Dùng đúng tên hàm middleware là authenticateToken (hoặc verifyToken tùy cách bạn export)
// Theo file authMiddleware.js bạn gửi thì tên hàm là authenticateToken
router.put('/update-profile', authenticateToken, updateProfile);

module.exports = router;
