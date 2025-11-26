const productModel = require("../models/productModel");

// ✅ Lấy sản phẩm đại diện
async function getRepresentative(req, res) {
  const { category_id } = req.query;
  if (!category_id) return res.status(400).json({ message: "Thiếu category_id" });

  try {
    const product = await productModel.getRepresentativeProduct(category_id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(product);
  } catch (err) {
    console.error("❌ Lỗi getRepresentative:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
}

// ✅ Lấy danh sách sản phẩm (Dùng cho trang CategoryPage)
async function getProducts(req, res) {
  try {
    // 👉 CẬP NHẬT: Lấy thêm 'gender' từ query
    const { category_id, gender, page = 1, limit = 8 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // 👉 CẬP NHẬT: Truyền 'gender' xuống Model
    const products = await productModel.getAllProducts(category_id, gender, parseInt(limit), offset);
    const totalProducts = await productModel.countProducts(category_id, gender);

    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    res.json({
      data: products,
      products: products,
      totalPages,
      currentPage: parseInt(page),
      totalProducts
    });
  } catch (err) {
    console.error("❌ Lỗi getProducts:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách sản phẩm" });
  }
}

// ... (Các hàm searchProducts, getProduct, getProductOptions giữ nguyên) ...
// (Copy lại code cũ hoặc dùng file cũ nếu không đổi gì)

async function searchProducts(req, res) {
  try {
    const { q, gender, category, page = 1, limit = 8 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const products = await productModel.searchProductsInModel(
      q, gender, category, parseInt(limit), offset
    );

    const totalProducts = await productModel.countSearchedProducts(q, gender, category);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    res.json({
      data: products,
      products: products,
      totalPages,
      currentPage: parseInt(page),
      totalProducts
    });
  } catch (err) {
    console.error("❌ Lỗi searchProducts:", err);
    res.status(500).json({ message: "Lỗi server khi tìm kiếm" });
  }
}

async function getProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await productModel.getProductById(id);

    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    res.json(product);
  } catch (err) {
    console.error("❌ Lỗi getProduct:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
}

async function getProductOptions(req, res) {
  try {
    const { id } = req.params;
    const options = await productModel.getProductOptionsById(id);
    res.json(options);
  } catch (err) {
    console.error("❌ Lỗi getProductOptions:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
}

module.exports = {
  getRepresentative,
  getProducts,
  searchProducts,
  getProduct,
  getProductOptions
};
