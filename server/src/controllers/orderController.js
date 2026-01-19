const db = require("../db");
const orderModel = require("../models/orderModel");
const user = require("../models/userModel"); // THÊM DÒNG NÀY
const membership = require("../models/membershipModel"); // THÊM DÒNG NÀY
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

    const { user_id, address, items, phone, name, email } = req.body;

    // 1. Validation cơ bản
    if (!address || !items || items.length === 0) {
      return res.status(400).json({ message: "Dữ liệu đơn hàng không hợp lệ" });
    }

    if (!user_id && (!name || !phone || !email)) {
      return res.status(400).json({ message: "Khách vãng lai phải cung cấp đầy đủ thông tin" });
    }

    // 2. TÍNH TOÁN LẠI TỔNG TIỀN TẠI SERVER (Bảo mật)
    let serverCalculatedTotal = 0;

    for (const item of items) {
      // Lấy giá gốc từ DB dựa trên product_id (Không tin giá từ Frontend)
      const [productRows] = await connection.execute(
        "SELECT price FROM products WHERE id = ?",
        [item.product_id]
      );
      
      if (productRows.length === 0) {
        throw new Error(`Sản phẩm ID ${item.product_id} không tồn tại`);
      }

      const price = parseFloat(productRows[0].price);
      serverCalculatedTotal += price * item.quantity;
    }

    // 3. ÁP DỤNG GIẢM GIÁ MEMBERSHIP (Nếu có user_id)
    let discountAmount = 0;
    if (user_id) {
      const [memberRows] = await connection.execute(
        `SELECT m.discount_percent 
         FROM users u 
         JOIN memberships m ON u.membership_id = m.id 
         WHERE u.id = ?`,
        [user_id]
      );

      if (memberRows.length > 0) {
        const discountPercent = memberRows[0].discount_percent;
        discountAmount = (serverCalculatedTotal * discountPercent) / 100;
        serverCalculatedTotal -= discountAmount;
      }
    }

    // 4. (Tùy chọn) Áp dụng Voucher nếu bạn có gửi voucher_id lên
    // logic tương tự: check voucher trong DB -> trừ tiền

    // 5. LƯU ĐƠN HÀNG VỚI GIÁ ĐÃ CHỐT BỞI SERVER
    const orderId = await orderModel.createOrder(
      connection,
      user_id || null,
      serverCalculatedTotal, // GIÁ AN TOÀN
      address,
      phone,
      name,
      email
    );

    await orderModel.addOrderItems(connection, orderId, items);

    await connection.commit();

    // 6. Gửi email xác nhận
    try {
      sendEmail(
        email || (user_id ? req.user?.email : null),
        "Xác nhận đơn hàng",
        `Cảm ơn bạn! Đơn hàng #${orderId} đã được đặt thành công. Tổng tiền: ${serverCalculatedTotal.toLocaleString()}đ`
      );
    } catch (mailErr) {
      console.error("Gửi mail thất bại:", mailErr);
    }

    res.status(201).json({ 
      message: "Đặt hàng thành công", 
      orderId, 
      total: serverCalculatedTotal 
    });

  } catch (error) {
    await connection.rollback();
    console.error("Lỗi đặt hàng:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi tạo đơn hàng", error: error.message });
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
    // Chỉ cần gọi model, model sẽ lo hết từ kho đến tiền
    await orderModel.changeOrderStatus(order_id, new_status); 
    res.json({ message: "Cập nhật thành công!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi", error: err.message });
  }
}

module.exports = { sendOtpController, verifyOtpAndGetOrders, createOrderController, getOrders, changeOrderStatus };