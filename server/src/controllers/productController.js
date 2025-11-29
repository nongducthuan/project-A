const productModel = require("../models/productModel");

/* ============================================================
    GET REPRESENTATIVE PRODUCT FOR CATEGORY
    ============================================================ */
async function getRepresentative(req, res) {
  const { category_id } = req.query;
  if (!category_id) return res.status(400).json({ message: "Missing category_id" }); // Changed

  try {
    const product = await productModel.getRepresentativeProduct(category_id);
    if (!product)
      return res.status(404).json({ message: "Product not found" }); // Changed

    res.json(product);
  } catch (err) {
    console.error("❌ Error getRepresentative:", err);
    res.status(500).json({ message: "Server error" }); // Changed
  }
}

/* ============================================================
    GET PRODUCT LIST (CategoryPage)
    Supports filter: category_id + gender + pagination
    ============================================================ */
async function getProducts(req, res) {
  try {
    const { category_id, gender, page = 1, limit = 8 } = req.query;

    const p = parseInt(page);
    const l = parseInt(limit);
    const offset = (p - 1) * l;

    const products = await productModel.getAllProducts(
      category_id,
      gender,
      l,
      offset
    );

    const totalProducts = await productModel.countProducts(
      category_id,
      gender
    );

    const totalPages = Math.ceil(totalProducts / l);

    res.json({
      data: products,
      products,
      totalPages,
      currentPage: p,
      totalProducts,
    });
  } catch (err) {
    console.error("❌ Error getProducts:", err);
    res.status(500).json({ message: "Server error when fetching product list" }); // Changed
  }
}

/* ============================================================
    SEARCH PRODUCTS
    ============================================================ */
async function searchProducts(req, res) {
  try {
    const { q, gender, category, page = 1, limit = 8 } = req.query;

    const p = parseInt(page);
    const l = parseInt(limit);
    const offset = (p - 1) * l;

    const products = await productModel.searchProductsInModel(
      q,
      gender,
      category,
      l,
      offset
    );

    const totalProducts = await productModel.countSearchedProducts(
      q,
      gender,
      category
    );

    const totalPages = Math.ceil(totalProducts / l);

    res.json({
      data: products,
      products,
      totalPages,
      currentPage: p,
      totalProducts,
    });
  } catch (err) {
    console.error("❌ Error searchProducts:", err);
    res.status(500).json({ message: "Server error during search" }); // Changed
  }
}

/* ============================================================
    GET SINGLE PRODUCT DETAIL
    ============================================================ */
async function getProduct(req, res) {
  try {
    const { id } = req.params;

    const product = await productModel.getProductById(id);
    if (!product)
      return res.status(404).json({ message: "Product not found" }); // Changed

    res.json(product);
  } catch (err) {
    console.error("❌ Error getProduct:", err);
    res.status(500).json({ message: "Server error" }); // Changed
  }
}

/* ============================================================
    GET PRODUCT OPTIONS (SIZE/STOCK) LIST
    ============================================================ */
async function getProductOptions(req, res) {
  try {
    const { id } = req.params;

    const options = await productModel.getProductOptionsById(id);
    res.json(options);
  } catch (err) {
    console.error("❌ Error getProductOptions:", err);
    res.status(500).json({ message: "Server error" }); // Changed
  }
}

/* ============================================================
    EXPORT CONTROLLER
    ============================================================ */
module.exports = {
  getRepresentative,
  getProducts,
  searchProducts,
  getProduct,
  getProductOptions,
};