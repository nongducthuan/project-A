const pool = require('../db');

// Tạo đơn hàng chính
async function createOrder(conn, userId, totalPrice, address, phone, name) {
  const [result] = await conn.query(
    `INSERT INTO orders 
     (user_id, total_price, address, phone, name, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'Pending', NOW())`,
    [userId, totalPrice, address, phone, name]
  );
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

    // Lấy đơn hàng và items
    const [orderRows] = await connection.query("SELECT * FROM orders WHERE id=?", [orderId]);
    const order = orderRows[0];
    const [items] = await connection.query("SELECT * FROM order_items WHERE order_id=?", [orderId]);

    // Nhóm trạng thái
    const group = ["Pending", "Cancelled"];

    const oldGroup = group.includes(order.status) ? 1 : 2;
    const newGroup = group.includes(newStatus) ? 1 : 2;

    // Nếu chuyển nhóm 1 → nhóm 2 → trừ kho
    if (oldGroup === 1 && newGroup === 2) {
      for (const item of items) {
        if (item.size_id) {
          await connection.query(
            "UPDATE product_sizes SET stock = stock - ? WHERE id = ? AND stock >= ?",
            [item.quantity, item.size_id, item.quantity]
          );
        }
      }
    }

    // Nếu chuyển nhóm 2 → nhóm 1 → cộng kho
    if (oldGroup === 2 && newGroup === 1) {
      for (const item of items) {
        if (item.size_id) {
          await connection.query(
            "UPDATE product_sizes SET stock = stock + ? WHERE id = ?",
            [item.quantity, item.size_id]
          );
        }
      }
    }

    // Cập nhật trạng thái đơn
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
