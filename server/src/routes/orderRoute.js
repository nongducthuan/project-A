const express = require('express');
const router = express.Router();
const { createOrderController, getOrders, sendOtpController, verifyOtpAndGetOrders } = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post("/", createOrderController);
router.get('/', authenticateToken, getOrders);
router.post("/send-otp", sendOtpController);
router.post("/verify-otp", verifyOtpAndGetOrders);

module.exports = router;
