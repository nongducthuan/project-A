const adminModel = require("../models/adminModel");
const orderModel = require('../models/orderModel');

// --- PRODUCTS ---
async function getProducts(req, res) {
  try {
    const products = await adminModel.getAllProducts();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server lấy sản phẩm" });
  }
}

async function addProduct(req, res) {
  try {
    const id = await adminModel.createProduct(req.body);
    res.status(201).json({ id, message: "Thêm sản phẩm thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server thêm sản phẩm" });
  }
}

async function editProduct(req, res) {
  try {
    const affected = await adminModel.updateProduct(req.params.id, req.body);
    res.json({ affected });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server sửa sản phẩm" });
  }
}

async function removeProduct(req, res) {
  try {
    const affected = await adminModel.deleteProduct(req.params.id);
    res.json({ affected });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server xóa sản phẩm" });
  }
}

async function getProductDetail(req, res) {
    try {
        const product = await adminModel.getProductById(req.params.id);
        if(!product) return res.status(404).json({message: "Không tìm thấy"});
        res.json(product);
    } catch (err) {
        res.status(500).json({message: "Lỗi server"});
    }
}

// --- COLORS & SIZES ---
async function addColor(req, res) {
    try {
        const id = await adminModel.createColor(req.params.productId, req.body);
        res.json({id});
    } catch(err) { res.status(500).json({message: "Lỗi server"}); }
}

async function removeColor(req, res) {
    try {
        await adminModel.deleteColor(req.params.id);
        res.json({message: "Đã xóa màu"});
    } catch(err) { res.status(500).json({message: "Lỗi server"}); }
}

async function addSize(req, res) {
  try {
    const id = await adminModel.addOrUpdateSize(req.params.colorId, req.body);
    res.json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Lỗi server" });
  }
}

async function removeSize(req, res) {
    try {
        await adminModel.deleteSize(req.params.id);
        res.json({message: "Đã xóa size"});
    } catch(err) { res.status(500).json({message: "Lỗi server"}); }
}

// --- ORDERS ---
async function getOrders(req, res) {
    try {
        const orders = await adminModel.getAllOrders();
        res.json(orders);
    } catch(err) { res.status(500).json({message: "Lỗi server"}); }
}

/* async function updateOrder(req, res) {
    try {
        await adminModel.updateOrderStatus(req.params.id, req.body.status);
        res.json({message: "Cập nhật đơn hàng thành công"});
    } catch(err) { res.status(500).json({message: "Lỗi server"}); }
} */

async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await orderModel.changeOrderStatus(id, status);
    res.json({ message: 'Cập nhật trạng thái thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

// --- BANNERS (ĐÃ BỔ SUNG) ---
async function getBanners(req, res) {
    try {
        const banners = await adminModel.getAllBanners();
        res.json(banners);
    } catch(err) {
        console.error(err);
        res.status(500).json({message: "Lỗi server"});
    }
}

async function addBanner(req, res) {
    try {
        const id = await adminModel.createBanner(req.body);
        res.status(201).json({id, message: "Thêm banner thành công"});
    } catch(err) {
        console.error(err);
        res.status(500).json({message: "Lỗi server"});
    }
}

async function editBanner(req, res) {
    try {
        await adminModel.updateBanner(req.params.id, req.body);
        res.json({message: "Cập nhật banner thành công"});
    } catch(err) {
        console.error(err);
        res.status(500).json({message: "Lỗi server"});
    }
}

async function removeBanner(req, res) {
    try {
        await adminModel.deleteBanner(req.params.id);
        res.json({message: "Đã xóa banner"});
    } catch(err) {
        console.error(err);
        res.status(500).json({message: "Lỗi server"});
    }
}

module.exports = {
    getProducts, addProduct, editProduct, removeProduct, getProductDetail,
    addColor, removeColor, addSize, removeSize,
    getOrders, updateOrderStatus,
    getBanners, addBanner, editBanner, removeBanner // Export thêm các hàm banner
};
