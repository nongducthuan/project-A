const db = require("../db");
const orderModel = require("../models/orderModel");

// Tạo đơn hàng mới
async function createOrderController(req, res) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { user_id, address, total_price, items, phone, name } = req.body;

    // VALIDATION
    if (!address || !items || items.length === 0) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    // Nếu là guest (user_id=null) → bắt buộc name + phone
    if (!user_id) {
      if (!name || !phone) {
        return res
          .status(400)
          .json({ message: "Guest phải cung cấp name và phone" });
      }
    }

    const orderId = await orderModel.createOrder(
      connection,
      user_id || null,
      total_price,
      address,
      phone,
      name
    );

    await orderModel.addOrderItems(connection, orderId, items);

    await connection.commit();
    res.status(201).json({ message: "Đã tạo đơn hàng thành công", orderId });

  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      message: "Lỗi khi tạo đơn hàng",
      error: error.message,
    });
  } finally {
    connection.release();
  }
}

// Lấy danh sách đơn hàng (Của người dùng đang đăng nhập)
async function getOrders(req, res) {
  try {
    const userId = req.user.id; // Lấy từ token (authMiddleware)
    const orders = await orderModel.getOrdersByUserId(userId);
    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Lỗi lấy danh sách đơn hàng" });
  }
}

async function changeOrderStatus(req, res) {
  try {
    const { order_id, new_status } = req.body;

    await orderModel.changeOrderStatus(order_id, new_status);

    res.json({ message: "Cập nhật trạng thái thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật trạng thái", error: err.message });
  }
}

module.exports = { createOrderController, getOrders, changeOrderStatus };
