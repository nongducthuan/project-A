const adminModel = require("../models/adminModel");
const orderModel = require('../models/orderModel');

// --- PRODUCTS ---
async function getProducts(req, res) {
  try {
    const products = await adminModel.getAllProducts();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching products" }); // Changed
  }
}

async function addProduct(req, res) {
  try {
    const id = await adminModel.createProduct(req.body);
    res.status(201).json({ id, message: "Product added successfully" }); // Changed
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error adding product" }); // Changed
  }
}

async function editProduct(req, res) {
  try {
    const affected = await adminModel.updateProduct(req.params.id, req.body);
    res.json({ affected });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error editing product" }); // Changed
  }
}

async function removeProduct(req, res) {
  try {
    const affected = await adminModel.deleteProduct(req.params.id);
    res.json({ affected });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error deleting product" }); // Changed
  }
}

async function getProductDetail(req, res) {
    try {
        const product = await adminModel.getProductById(req.params.id);
        if(!product) return res.status(404).json({message: "Not found"}); // Changed
        res.json(product);
    } catch (err) {
        res.status(500).json({message: "Server error"}); // Changed
    }
}

// --- COLORS & SIZES ---
async function addColor(req, res) {
    try {
        const id = await adminModel.createColor(req.params.productId, req.body);
        res.json({id});
    } catch(err) { res.status(500).json({message: "Server error"}); } // Changed
}

async function removeColor(req, res) {
    try {
        await adminModel.deleteColor(req.params.id);
        res.json({message: "Color deleted successfully"}); // Changed
    } catch(err) { res.status(500).json({message: "Server error"}); } // Changed
}

async function addSize(req, res) {
  try {
    const id = await adminModel.addOrUpdateSize(req.params.colorId, req.body);
    res.json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" }); // Changed
  }
}

async function removeSize(req, res) {
    try {
        await adminModel.deleteSize(req.params.id);
        res.json({message: "Size deleted successfully"}); // Changed
    } catch(err) { res.status(500).json({message: "Server error"}); } // Changed
}

// --- ORDERS ---
async function getOrders(req, res) {
    try {
        const orders = await adminModel.getAllOrders();
        res.json(orders);
    } catch(err) { res.status(500).json({message: "Server error"}); } // Changed
}

/* async function updateOrder(req, res) {
    try {
        await adminModel.updateOrderStatus(req.params.id, req.body.status);
        res.json({message: "Order updated successfully"});
    } catch(err) { res.status(500).json({message: "Server error"}); }
} */

async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await orderModel.changeOrderStatus(id, status);
    res.json({ message: 'Order status updated successfully' }); // Changed
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

// --- BANNERS (SUPPLEMENTED) ---
async function getBanners(req, res) {
    try {
        const banners = await adminModel.getAllBanners();
        res.json(banners);
    } catch(err) {
        console.error(err);
        res.status(500).json({message: "Server error"}); // Changed
    }
}

async function addBanner(req, res) {
    try {
        const id = await adminModel.createBanner(req.body);
        res.status(201).json({id, message: "Banner added successfully"}); // Changed
    } catch(err) {
        console.error(err);
        res.status(500).json({message: "Server error"}); // Changed
    }
}

async function editBanner(req, res) {
    try {
        await adminModel.updateBanner(req.params.id, req.body);
        res.json({message: "Banner updated successfully"}); // Changed
    } catch(err) {
        console.error(err);
        res.status(500).json({message: "Server error"}); // Changed
    }
}

async function removeBanner(req, res) {
    try {
        await adminModel.deleteBanner(req.params.id);
        res.json({message: "Banner deleted successfully"}); // Changed
    } catch(err) {
        console.error(err);
        res.status(500).json({message: "Server error"}); // Changed
    }
}

module.exports = {
    getProducts, addProduct, editProduct, removeProduct, getProductDetail,
    addColor, removeColor, addSize, removeSize,
    getOrders, updateOrderStatus,
    getBanners, addBanner, editBanner, removeBanner 
};