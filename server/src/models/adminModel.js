const pool = require("../db");

// =================== PRODUCTS ===================
async function getAllProducts() {
  const sql = `
    SELECT
      p.*,
      c.name AS category_name,
      COALESCE(SUM(ps.stock), 0) AS total_stock
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN product_colors pc ON pc.product_id = p.id
    LEFT JOIN product_sizes ps ON ps.color_id = pc.id
    GROUP BY p.id, c.name
    ORDER BY p.id DESC
  `;
  const [rows] = await pool.query(sql);
  return rows;
}

async function createProduct(product) {
  const { name, description, price, image_url, gender, category_id } = product;
  const sql = `
    INSERT INTO products (name, description, price, image_url, gender, category_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(sql, [name, description || null, price, image_url || null, gender || 'unisex', category_id]);
  return result.insertId;
}

async function updateProduct(id, product) {
  const { name, description, price, image_url, gender, category_id } = product;
  const sql = `
    UPDATE products
    SET name=?, description=?, price=?, image_url=?, gender=?, category_id=?
    WHERE id=?
  `;
  const [result] = await pool.query(sql, [name, description || null, price, image_url || null, gender, category_id, id]);
  return result.affectedRows;
}

async function deleteProduct(id) {
  const [colors] = await pool.query("SELECT id FROM product_colors WHERE product_id=?", [id]);
  const colorIds = colors.map(c => c.id);
  if (colorIds.length > 0) {
    await pool.query(`DELETE FROM product_sizes WHERE color_id IN (?)`, [colorIds]);
    await pool.query(`DELETE FROM product_colors WHERE id IN (?)`, [colorIds]);
  }
  const [result] = await pool.query("DELETE FROM products WHERE id=?", [id]);
  return result.affectedRows;
}

async function getProductById(id) {
  const [products] = await pool.query(`SELECT * FROM products WHERE id = ?`, [id]);
  if (!products.length) return null;
  const product = products[0];
  const [colors] = await pool.query(`SELECT * FROM product_colors WHERE product_id = ?`, [id]);
  for (const color of colors) {
    const [sizes] = await pool.query(`SELECT * FROM product_sizes WHERE color_id = ?`, [color.id]);
    color.sizes = sizes;
  }
  product.colors = colors;
  return product;
}

async function getColorsByProduct(productId) {
  const [colors] = await pool.query("SELECT * FROM product_colors WHERE product_id = ?", [productId]);
  return colors;
}

async function createColor(productId, color) {
  const { color_name, color_code, image_url } = color;
  const [result] = await pool.query(
    "INSERT INTO product_colors (product_id, color_name, color_code, image_url) VALUES (?, ?, ?, ?)",
    [productId, color_name, color_code, image_url]
  );
  return result.insertId;
}

async function deleteColor(colorId) {
  await pool.query("DELETE FROM product_sizes WHERE color_id=?", [colorId]);
  const [result] = await pool.query("DELETE FROM product_colors WHERE id=?", [colorId]);
  return result.affectedRows;
}

async function addOrUpdateSize(colorId, sizeData) {
  const { size, stock, increment } = sizeData;

  // Kiểm tra size đã tồn tại
  const [existing] = await pool.query(
    "SELECT * FROM product_sizes WHERE color_id = ? AND size = ?",
    [colorId, size]
  );

  if (existing.length) {
    if (increment) {
      const [res] = await pool.query(
        "UPDATE product_sizes SET stock = stock + ? WHERE id = ?",
        [stock, existing[0].id]
      );
      return existing[0].id;
    } else {
      throw new Error("Size đã tồn tại");
    }
  } else {
    const [res] = await pool.query(
      "INSERT INTO product_sizes (color_id, size, stock) VALUES (?, ?, ?)",
      [colorId, size, stock]
    );
    return res.insertId;
  }
}

async function deleteSize(sizeId) {
  const [result] = await pool.query("DELETE FROM product_sizes WHERE id=?", [sizeId]);
  return result.affectedRows;
}

// =================== ORDERS & BANNERS (ĐÃ CẬP NHẬT) ===================
async function getAllOrders() {
  const sql = `
    SELECT 
      o.*,
      COALESCE(u.name, o.name) AS user_name,
      u.email AS user_email,
      COALESCE(SUM(oi.price * oi.quantity), 0) AS total_price
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;
  const [orders] = await pool.query(sql);

  for (const order of orders) {
    const itemSql = `
      SELECT
        oi.*,
        p.name AS product_name,
        p.image_url,
        pc.color_name,
        ps.size
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_colors pc ON oi.color_id = pc.id
      LEFT JOIN product_sizes ps ON oi.size_id = ps.id
      WHERE oi.order_id = ?
    `;
    const [items] = await pool.query(itemSql, [order.id]);
    order.items = items;
  }

  return orders;
}

/* async function updateOrderStatus(orderId, status) {
  const [result] = await pool.query("UPDATE orders SET status=? WHERE id=?", [status, orderId]);
  return result.affectedRows;
} */

async function getAllBanners() {
  const [rows] = await pool.query("SELECT * FROM banners ORDER BY id DESC");
  return rows;
}

module.exports = {
  getAllProducts, createProduct, updateProduct, deleteProduct, getProductById,
  getColorsByProduct, createColor, deleteColor,
  addOrUpdateSize, deleteSize,
  getAllOrders,
  getAllBanners
};
