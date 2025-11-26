import { useState } from "react";
import API from "../api.jsx";
import { useNavigate, Link } from "react-router-dom"; // Import Link

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // Thêm state cho thông báo thành công
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    // Thêm kiểm tra mật khẩu tối thiểu (ví dụ: 6 ký tự)
    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    try {
      const { name, email, phone, password } = form;
      // Giả sử API trả về thành công 200/201
      await API.post("/auth/register", { name, email, phone, password });

      setSuccess("Đăng ký thành công! Bạn sẽ được chuyển hướng đến trang đăng nhập.");
      // Chuyển hướng sau 2 giây
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      console.error("❌ Registration error:", err.response ? err.response.data : err);
      // Giả sử lỗi trả về do email/SĐT đã tồn tại
      setError("Đăng ký thất bại! Email hoặc Số điện thoại có thể đã được sử dụng.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 sm:p-10 border border-gray-100">

        {/* Tiêu đề Đăng ký chuyên nghiệp */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Tạo tài khoản mới
          </h1>
          <p className="mt-2 text-base text-gray-500">
            Hãy tham gia cộng đồng mua sắm của chúng tôi!
          </p>
        </div>

        {/* Form Đăng ký */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Tên */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Họ và Tên
            </label>
            <input
              id="name"
              type="text"
              name="name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              placeholder="Nhập họ và tên"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              placeholder="Nhập địa chỉ email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <input
              id="phone"
              type="text"
              name="phone"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              placeholder="Nhập số điện thoại"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>

          {/* Mật khẩu */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              name="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              placeholder="Tối thiểu 6 ký tự"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Nhập lại mật khẩu */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Nhập lại mật khẩu
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              placeholder="Xác nhận mật khẩu"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* Nút Đăng ký */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
            >
              Đăng ký (Sign Up)
            </button>
          </div>
        </form>

        {/* Thông báo lỗi/thành công */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        {/* Liên kết Đăng nhập */}
        <div className="text-center mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?
            <Link to="/login" className="ml-1 font-semibold text-indigo-600 hover:text-indigo-500">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
