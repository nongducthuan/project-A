import { createContext, useState, useEffect } from "react";
import API from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

  // Tính toán tier và discount từ user state
  const tier = user?.tier_name || "Bronze";
  const discount = user?.discount_percent || 0;

  // 1. Tự động refresh dữ liệu mỗi khi load lại web (F5)
  useEffect(() => {
    refreshUser();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
    window.location.href = "/login";
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await API.get("/auth/me"); // Header đã được xử lý trong file api.js (nếu bạn dùng axios interceptor)
      
      if (res.data) {
        // 2. QUAN TRỌNG: Dùng spread operator (...) để gộp dữ liệu
        // Giữ lại các field cũ (như role) và cập nhật các field mới (tier, discount)
        setUser(prev => {
          const updatedUser = { ...prev, ...res.data };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          return updatedUser;
        });
      }
    } catch (err) {
      console.error("Refresh user error", err);
      // Nếu token hết hạn hoặc lỗi, có thể cân nhắc logout ở đây
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, refreshUser, tier, discount }}>
      {children}
    </AuthContext.Provider>
  );
};