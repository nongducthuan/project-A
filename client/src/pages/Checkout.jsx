import { useContext, useState, useMemo } from "react";
import { CartContext } from "../context/CartContext.jsx";
import API from "../api.jsx";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const { cart, setCart } = useContext(CartContext);
  const [message, setMessage] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod"); // Mặc định là COD
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const navigate = useNavigate();

  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  const total = useMemo(() => {
    return cart.reduce(
      (sum, p) => sum + Number(p.price) * (p.quantity ?? 1),
      0
    );
  }, [cart]);

  // Hàm helper để xử lý ảnh (quan trọng để hiển thị ảnh đúng)
  const getImgUrl = (item) => {
    const url = item.color_image || item.image_url;
    if (!url) return "https://via.placeholder.com/150?text=No+Image";
    return url.startsWith("http")
      ? url
      : `http://localhost:5000/${url.replace(/^\/+/, "")}`;
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");

    // RÀNG BUỘC INPUT
    if (!address.trim()) {
      setMessage("Vui lòng nhập địa chỉ giao hàng!");
      return;
    }

    if (!user) {
      if (!guestName.trim() || !guestPhone.trim()) {
        setMessage("Vui lòng nhập tên và số điện thoại!");
        return;
      }
    }

    try {
      const itemsPayload = cart.map((p) => ({
        product_id: p.id,
        color_id: p.color_id,
        size_id: p.size_id,
        quantity: p.quantity || 1,
      }));

      const orderData = {
        user_id: user ? user.id : null,
        total_price: total,
        address,
        phone: user ? user.phone : guestPhone,
        name: user ? user.name : guestName,
        items: itemsPayload,
        payment_method: paymentMethod,
      };

      const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {}; // Guest không gửi token

      const res = await API.post("/orders", orderData, { headers });

      setMessage("✅ Đặt hàng thành công!");
      setCart([]);
      setTimeout(() => navigate(user ? "/profile" : "/"), 2000);
    } catch (err) {
      console.error(err);
      setMessage(
        "❌ Lỗi đặt hàng: " + (err.response?.data?.message || err.message)
      );
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
        <div className="text-gray-400 mb-4">
          <i className="fa-solid fa-cart-shopping text-6xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Giỏ hàng trống
        </h2>
        <button
          onClick={() => navigate("/")}
          className="bg-violet-600 text-white px-6 py-2 rounded-full hover:bg-violet-700 transition"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center uppercase tracking-wide">
        Thanh Toán
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
        {/* --- CỘT TRÁI: THÔNG TIN & THANH TOÁN (Chiếm 7 phần) --- */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Địa chỉ giao hàng */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-location-dot text-violet-600"></i>
              Địa chỉ nhận hàng
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Nhập địa chỉ chi tiết <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-400 focus:outline-none transition"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số nhà, đường, phường/xã, quận/huyện..."
              ></textarea>
            </div>
          </div>
          {!user && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-user text-violet-600"></i>
                Thông tin khách hàng (Guest)
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600">Họ tên</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Nhập họ tên của bạn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Số điện thoại</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>
          )}

          {/* 2. Phương thức thanh toán */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-credit-card text-violet-600"></i>
              Phương thức thanh toán
            </h3>
            <div className="space-y-3">
              {/* COD */}
              <label
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${paymentMethod === "cod"
                  ? "border-violet-600 bg-violet-50"
                  : "hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="text-violet-600 focus:ring-violet-500"
                  />
                  <div>
                    <span className="font-bold text-gray-800">
                      Thanh toán khi nhận hàng (COD)
                    </span>
                    <p className="text-xs text-gray-500">
                      Thanh toán tiền mặt khi shipper giao hàng
                    </p>
                  </div>
                </div>
                <i className="fa-solid fa-money-bill-wave text-xl text-green-600"></i>
              </label>

              {/* Chuyển khoản */}
              <label
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${paymentMethod === "banking"
                  ? "border-violet-600 bg-violet-50"
                  : "hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="banking"
                    checked={paymentMethod === "banking"}
                    onChange={() => setPaymentMethod("banking")}
                    className="text-violet-600 focus:ring-violet-500"
                  />
                  <div>
                    <span className="font-bold text-gray-800">
                      Chuyển khoản ngân hàng
                    </span>
                    <p className="text-xs text-gray-500">
                      QR Code sẽ hiện sau khi đặt hàng
                    </p>
                  </div>
                </div>
                <i className="fa-solid fa-building-columns text-xl text-blue-600"></i>
              </label>

              {/* Ví điện tử */}
              <label
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${paymentMethod === "momo"
                  ? "border-violet-600 bg-violet-50"
                  : "hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="momo"
                    checked={paymentMethod === "momo"}
                    onChange={() => setPaymentMethod("momo")}
                    className="text-violet-600 focus:ring-violet-500"
                  />
                  <div>
                    <span className="font-bold text-gray-800">
                      Ví MoMo / ZaloPay
                    </span>
                  </div>
                </div>
                <i className="fa-solid fa-wallet text-xl text-pink-600"></i>
              </label>
            </div>
          </div>

          {/* 3. Nút đặt hàng (Đặt ở bên trái luôn) */}
          <button
            className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition transform active:scale-95 ${!address
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-violet-600 hover:bg-violet-700"
              }`}
            onClick={handleCheckout}
            disabled={!address}
          >
            HOÀN TẤT ĐẶT HÀNG
          </button>

          {message && (
            <div
              className={`text-center p-3 rounded-lg font-medium ${message.includes("✅")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
                }`}
            >
              {message}
            </div>
          )}
        </div>

        {/* --- CỘT PHẢI: THÔNG TIN ĐƠN HÀNG (Chiếm 5 phần) --- */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">
              Đơn hàng của bạn ({cart.length} sản phẩm)
            </h3>

            {/* Danh sách sản phẩm */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-6 custom-scrollbar">
              {cart.map((item, index) => (
                <div key={index} className="flex gap-4 items-start">
                  {/* Ảnh sản phẩm */}
                  <div className="w-16 h-16 flex-shrink-0 border rounded overflow-hidden">
                    <img
                      src={getImgUrl(item)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) =>
                      (e.target.src =
                        "http://localhost:5000/public/placeholder.jpg")
                      }
                    />
                  </div>

                  {/* Thông tin */}
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-800 line-clamp-2">
                      {item.name}
                    </h4>
                    <div className="text-xs text-gray-500 mt-1">
                      <span>Màu: {item.color_name || "Ngẫu nhiên"}</span> |{" "}
                      <span>Size: {item.size_name || "F"}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm font-bold text-violet-600">
                        {Number(item.price).toLocaleString()}đ
                      </span>
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        x{item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tổng tiền */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span>{total.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển:</span>
                <span className="text-green-600 font-medium">Miễn phí</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t mt-2">
                <span>Tổng cộng:</span>
                <span className="text-red-600">{total.toLocaleString()}đ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
