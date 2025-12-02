import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard.jsx";
import AuthProvider from "./context/AuthContext";
import Order from "./pages/Order";
import Search from "./pages/Search";
import ProductDetail from "./pages/ProductDetail";
import ProductDetailManager from "./pages/ProductDetailManager.jsx";
import Category from "./pages/Category";
import BannerManager from "./pages/BannerManager";
import ProductManager from "./pages/ProductManager";
import OrderManager from "./pages/OrderManager";
import CategoryManager from "./pages/CategoryManager";  
import Report from "./pages/Report";
import Profile from "./pages/Profile";
import "./assets/style/style.css";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />

          <Routes>
            {/* --- PUBLIC --- */}
            <Route path="/" element={<Home />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/category/:id" element={<Category />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<Search />} />

            {/* --- AUTH REQUIRED --- */}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Order />} />
            <Route path="/profile" element={<Profile />} />

            {/* --- ADMIN --- */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roleRequired="admin">
                  <Dashboard />
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
                  <ProductDetailManager />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/report"
              element={
                <ProtectedRoute roleRequired="admin">
                  <Report />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute roleRequired="admin">
                  <CategoryManager />
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
