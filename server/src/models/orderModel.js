const pool = require('../db');

// Tạo đơn hàng chính
async function createOrder(connection, user_id, total_price, address, phone, name, email) {
  const query = `
    INSERT INTO orders (user_id, total_price, address, phone, name, email, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'Pending', NOW())
  `;
  const [result] = await connection.execute(query, [
    user_id,
    total_price,
    address,
    phone,
    name,
    email 
  ]);
  return result.insertId;
}

// Thêm chi tiết đơn hàng (items)
async function addOrderItems(conn, orderId, items) {
  for (const i of items) {
    const [product] = await conn.query("SELECT price FROM products WHERE id=?", [i.product_id]);
    const price = Number(product[0].price || 0);
    const qty = Number(i.quantity || 1);
    await conn.query(
      "INSERT INTO order_items (order_id, product_id, color_id, size_id, quantity, price) VALUES (?, ?, ?, ?, ?, ?)",
      [orderId, i.product_id, i.color_id || null, i.size_id || null, qty, price]
    );
  }
}

// Trừ tồn kho (Update bảng product_sizes)
async function updateStock(conn, items) {
  for (const item of items) {
    // Chỉ trừ kho nếu có size_id (vì stock nằm ở size)
    if (item.size_id) {
      const qty = Number(item.quantity || 1);
      await conn.query(
        "UPDATE product_sizes SET stock = stock - ? WHERE id = ? AND stock >= ?",
        [qty, item.size_id, qty]
      );
    }
  }
}

// Lấy danh sách đơn hàng của 1 user
async function getOrdersByUserId(userId) {
  const sql = `
    SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
  `;
  const [orders] = await pool.query(sql, [userId]);

  // Lấy thêm items cho từng đơn hàng
  for (const order of orders) {
    const itemSql = `
      SELECT oi.*, p.name as product_name, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `;
    const [items] = await pool.query(itemSql, [order.id]);
    order.items = items;
  }
  return orders;
}

async function changeOrderStatus(orderId, newStatus) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Lấy thông tin đơn hàng hiện tại (TRƯỚC KHI UPDATE)
    const [orderRows] = await connection.query("SELECT * FROM orders WHERE id=?", [orderId]);
    const order = orderRows[0];
    if (!order) throw new Error("Order not found");
    
    const oldStatus = order.status; // Trạng thái hiện tại trong DB
    const totalPrice = Number(order.total_price);
    const userId = order.user_id;

    // 2. LOGIC KHO HÀNG (Giữ nguyên của bạn)
    const group = ["Pending", "Cancelled"];
    const oldGroup = group.includes(oldStatus) ? 1 : 2;
    const newGroup = group.includes(newStatus) ? 1 : 2;

    const [items] = await connection.query("SELECT * FROM order_items WHERE order_id=?", [orderId]);
    if (oldGroup === 1 && newGroup === 2) {
      for (const item of items) {
        if (item.size_id) {
          await connection.query("UPDATE product_sizes SET stock = stock - ? WHERE id = ? AND stock >= ?", [item.quantity, item.size_id, item.quantity]);
        }
      }
    } else if (oldGroup === 2 && newGroup === 1) {
      for (const item of items) {
        if (item.size_id) {
          await connection.query("UPDATE product_sizes SET stock = stock + ? WHERE id = ?", [item.quantity, item.size_id]);
        }
      }
    }

    // 3. LOGIC TIỀN TỆ & HẠNG THÀNH VIÊN (SỬA LẠI Ở ĐÂY)
    if (userId) {
      let moneyChange = 0;

      // TRƯỜNG HỢP 1: Chuyển từ trạng thái KHÁC sang Delivered -> CỘNG TIỀN
      if (oldStatus !== "Delivered" && newStatus === "Delivered") {
        moneyChange = totalPrice;
      } 
      // TRƯỜNG HỢP 2: Chuyển từ Delivered sang trạng thái KHÁC -> TRỪ TIỀN
      else if (oldStatus === "Delivered" && newStatus !== "Delivered") {
        moneyChange = -totalPrice;
      }

      if (moneyChange !== 0) {
        // Cập nhật tổng chi tiêu (có thể tăng hoặc giảm)
        await connection.query(
          "UPDATE users SET total_spent = total_spent + ? WHERE id = ?",
          [moneyChange, userId]
        );

        // Tính toán lại hạng thành viên sau khi thay đổi tiền
        const [userRows] = await connection.query("SELECT total_spent FROM users WHERE id = ?", [userId]);
        const currentSpent = userRows[0].total_spent;

        const [tiers] = await connection.query(
          "SELECT id FROM memberships WHERE min_spending <= ? ORDER BY min_spending DESC LIMIT 1",
          [currentSpent]
        );

        if (tiers.length > 0) {
          await connection.query("UPDATE users SET membership_id = ? WHERE id = ?", [tiers[0].id, userId]);
        }
      }
    }

    // 4. Cuối cùng mới cập nhật trạng thái đơn hàng
    await connection.query("UPDATE orders SET status=? WHERE id=?", [newStatus, orderId]);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { createOrder, addOrderItems, updateStock, getOrdersByUserId, changeOrderStatus };
