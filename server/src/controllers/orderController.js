const db = require("../db");
const orderModel = require("../models/orderModel");
const { sendEmail } = require("../utils/emailService");

// 1. Gửi OTP
async function sendOtpController(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  // Tạo mã 6 số ngẫu nhiên
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Hết hạn sau 5 phút (Timezone VN +7)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 

  const connection = await db.getConnection();
  try {
    // Xóa OTP cũ của email này (để tránh rác DB)
    await connection.execute("DELETE FROM otps WHERE email = ?", [email]);

    // Lưu OTP mới
    await connection.execute(
      "INSERT INTO otps (email, code, expires_at) VALUES (?, ?, ?)",
      [email, code, expiresAt]
    );

    // Gửi email (Không await để trả về nhanh, hoặc await nếu muốn chắc chắn)
    // Nội dung mail: "Mã xác thực của bạn là: 123456. Mã hết hạn sau 5 phút."
    sendEmail(email, "Your OTP Code", `Your verification code is: ${code}`);

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    connection.release();
  }
}

// 2. Xác thực OTP và Lấy đơn hàng
async function verifyOtpAndGetOrders(req, res) {
  const { email, code } = req.body;
  const connection = await db.getConnection();

  try {
    // 1. Kiểm tra mã OTP 
    const [otpRows] = await connection.execute(
      "SELECT * FROM otps WHERE email = ? AND code = ?",
      [email, code]
    );

    if (otpRows.length === 0) {
      return res.status(400).json({ message: "Mã OTP không chính xác!" });
    }

    // 2. Kiểm tra thời gian hết hạn 
    const otpData = otpRows[0];
    const now = new Date();
    const expiry = new Date(otpData.expires_at);

    if (now > expiry) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn!" });
    }

    // 3. Lấy danh sách Đơn hàng 
    const [orders] = await connection.execute(
      "SELECT * FROM orders WHERE email = ? ORDER BY created_at DESC",
      [email]
    );

    // 4. Nếu có đơn hàng, lấy thêm chi tiết sản phẩm cho từng đơn
    for (let order of orders) {
      const [items] = await connection.execute(
        `SELECT oi.quantity, oi.price, p.name as product_name, p.image_url as image
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items; 
    }

    // 5. Xóa OTP để bảo mật (chỉ dùng 1 lần)
    await connection.execute("DELETE FROM otps WHERE email = ?", [email]);

    // 6. Trả kết quả về cho Frontend (Biến orders lúc này đã được định nghĩa ở bước 3)
    res.json({ 
      message: "Success", 
      orders: orders 
    });

  } catch (err) {
    console.error("Lỗi xác thực đơn hàng:", err);
    res.status(500).json({ message: "Lỗi hệ thống khi tải đơn hàng" });
  } finally {
    connection.release(); 
  }
}

// Create new order
async function createOrderController(req, res) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Thêm 'email' vào danh sách lấy từ body
    const { user_id, address, total_price, items, phone, name, email } = req.body;

    // VALIDATION cơ bản
    if (!address || !items || items.length === 0) {
      return res.status(400).json({ message: "Invalid data" });
    }

    // 2. Cập nhật Validation cho khách (Guest)
    if (!user_id) {
      // Bắt buộc khách phải cung cấp cả email để tra cứu OTP sau này
      if (!name || !phone || !email) { 
        return res
          .status(400)
          .json({ message: "Guest must provide name, phone and email" });
      }
    }

    // 3. Truyền email vào Model (nhớ cập nhật hàm này ở file orderModel.js)
    const orderId = await orderModel.createOrder(
      connection,
      user_id || null,
      total_price,
      address,
      phone,
      name,
      email 
    );

    await orderModel.addOrderItems(connection, orderId, items);

    await connection.commit();

    // 4. (Tùy chọn) Gửi email xác nhận ngay lập tức sau khi đặt hàng thành công
    // Việc này giúp khách có bằng chứng đã đặt hàng ngay trong inbox
    try {
        sendEmail(
            email || req.user?.email, 
            "Order Confirmation", 
            `Thank you! Your order #${orderId} has been placed successfully. Total: ${total_price.toLocaleString()}đ`
        );
    } catch (mailErr) {
        console.error("Mail confirmation failed:", mailErr);
        // Không return lỗi ở đây vì đơn hàng đã tạo thành công trong DB rồi
    }

    res.status(201).json({ message: "Order created successfully", orderId });

  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      message: "Error creating order",
      error: error.message,
    });
  } finally {
    connection.release();
  }
}

// Get order list (For the currently logged-in user)
async function getOrders(req, res) {
  try {
    const userId = req.user.id; // Get from token (authMiddleware)
    const orders = await orderModel.getOrdersByUserId(userId);
    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Error fetching order list" }); // Changed
  }
}

async function changeOrderStatus(req, res) {
  try {
    const { order_id, new_status } = req.body;

    await orderModel.changeOrderStatus(order_id, new_status);

    res.json({ message: "Status updated successfully" }); // Changed
  } catch (err) {
    res.status(500).json({ message: "Error updating status", error: err.message }); // Changed
  }
}

module.exports = { sendOtpController, verifyOtpAndGetOrders, createOrderController, getOrders, changeOrderStatus };