import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import AuthProvider from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import Order from "./pages/Order";
import Search from "./pages/Search";
import ProductDetail from "./pages/ProductDetail";
import AdminProductDetail from "./pages/AdminProductDetail";
import Category from "./pages/Category";
// === Manager === //
import BannerManager from "./pages/BannerManager";
import ProductManager from "./pages/ProductManager";
import OrderManager from "./pages/OrderManager";

import AdminReport from "./pages/AdminReport";
import Profile from "./pages/Profile";

import "./assets/style/style.css";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            {/* --- TRANG PUBLIC --- */}
            <Route path="/" element={<Home />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/category/:id" element={<Category />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<Search />} />

            {/* --- TRANG CẦN ĐĂNG NHẬP --- */}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Order />} />

            {/* ✅ Thêm Route Profile tại đây */}
            <Route path="/profile" element={<Profile />} />

            {/* --- TRANG ADMIN --- */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roleRequired="admin">
                  <Admin />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/banners"
              element={
                <ProtectedRoute roleRequired="admin">
                  <BannerManager />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/products"
              element={
                <ProtectedRoute roleRequired="admin">
                  <ProductManager />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute roleRequired="admin">
                  <OrderManager />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/products/:id"
              element={
                <ProtectedRoute roleRequired="admin">
                  <AdminProductDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/report"
              element={
                <ProtectedRoute roleRequired="admin">
                  <AdminReport />
                </ProtectedRoute>
              }
            />

          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
