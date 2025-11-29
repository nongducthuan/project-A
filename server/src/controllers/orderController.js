const db = require("../db");
const orderModel = require("../models/orderModel");

// Create new order
async function createOrderController(req, res) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { user_id, address, total_price, items, phone, name } = req.body;

    // VALIDATION
    if (!address || !items || items.length === 0) {
      return res.status(400).json({ message: "Invalid data" }); // Changed
    }

    // If it's a guest (user_id=null) → name + phone are required
    if (!user_id) {
      if (!name || !phone) {
        return res
          .status(400)
          .json({ message: "Guest must provide name and phone" }); // Changed
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
    res.status(201).json({ message: "Order created successfully", orderId }); // Changed

  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      message: "Error creating order", // Changed
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

module.exports = { createOrderController, getOrders, changeOrderStatus };