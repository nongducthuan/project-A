import { useState, useContext } from "react";
import API from "../api.jsx";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/auth/login", form);
      const { user, token } = res.data;

      if (!user || !token) {
        setError("Phản hồi từ server không hợp lệ!");
        return;
      }

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      setUser(user);

      if (user.role === "admin") navigate("/admin");
      else navigate("/");
    } catch (err) {
      setError("Sai email/SĐT hoặc mật khẩu!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 sm:p-10 border border-gray-100">
        {/* Tiêu đề */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Đăng nhập
          </h1>
          <p className="mt-2 text-base text-gray-500">
            Chào mừng bạn quay lại!
          </p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email hoặc Số điện thoại
            </label>
            <input
              type="text"
              name="identifier"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm
              focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              placeholder="Nhập email hoặc SĐT"
              value={form.identifier}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm
              focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Login button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent
    rounded-lg shadow-sm text-lg font-semibold text-white
    bg-violet-600 hover:bg-violet-700
    focus:outline-none focus:ring-2 focus:ring-offset-2
    focus:ring-gray-500 transition duration-150 ease-in-out"
            >
              Đăng nhập
            </button>
          </div>
        </form>

        {/* Lỗi */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3
            rounded relative mt-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Link đăng ký */}
        <div className="text-center mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?
            <Link
              to="/register"
              className="ml-1 font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
