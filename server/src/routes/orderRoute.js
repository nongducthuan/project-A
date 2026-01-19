const express = require('express');
const router = express.Router();
const { createOrderController, getOrders, sendOtpController, verifyOtpAndGetOrders, changeOrderStatus } = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post("/", createOrderController);
router.get('/', authenticateToken, getOrders);
router.post("/send-otp", sendOtpController);
router.post("/verify-otp", verifyOtpAndGetOrders);
router.post("/change-status", authenticateToken, changeOrderStatus);

module.exports = router;
