const express = require("express");
const router = express.Router();
const {
  getRepresentative,
  getProducts,
  getProductOptions,
  getProduct, 
  searchProducts,
} = require("../controllers/productController");

// ==================================================

// ✅ Lấy sản phẩm đại diện của danh mục
router.get("/representative", getRepresentative);

// ✅ Route để tìm kiếm sản phẩm (có phân trang)
router.get("/search", searchProducts);

// ✅ Lấy danh sách sản phẩm (đã phân trang)
router.get("/", getProducts);

// ✅ Lấy danh sách màu và size thật (QUAN TRỌNG CHO TRANG DETAIL)
router.get("/:id/options", getProductOptions);

// ✅ Lấy chi tiết sản phẩm (Sửa lại dùng getProduct thay vì getProductDetail)
router.get("/:id", getProduct);

module.exports = router;
