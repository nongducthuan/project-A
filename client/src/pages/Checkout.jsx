import { useContext, useState, useMemo } from "react";
import { CartContext } from "../context/CartContext.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import API from "../api.jsx";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const { cart, setCart } = useContext(CartContext);
  const { user, discount, tier } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod"); // Default to COD (Cash on Delivery)
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const navigate = useNavigate();

  const handleGetCurrentLocation = () => {
  setIsLocating(true);
  setMessage(""); // Xóa thông báo cũ

  navigator.geolocation.getCurrentPosition(
    // 1. Tham số thứ nhất: THÀNH CÔNG
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();
        
        if (data && data.display_name) {
          // Logic xử lý địa chỉ của bạn giữ nguyên...
          const rawParts = data.display_name.split(",").map(p => p.trim());
          const cleanParts = [];
          rawParts.forEach((part) => {
            const isDuplicate = cleanParts.some(
              (addedPart) => addedPart.includes(part) || part.includes(addedPart)
            );
            if (!isDuplicate) cleanParts.push(part);
          });
          const finalAddress = cleanParts.slice(0, -2).join(", ");
          setAddress(finalAddress);
        }
      } catch (err) {
        console.error(err);
        setMessage("❌ Lỗi khi lấy địa chỉ từ tọa độ.");
      } finally {
        setIsLocating(false); // Dừng quay khi xong
      }
    },
    // 2. Tham số thứ hai: THẤT BẠI (Quan trọng!)
    (error) => {
      console.error("Geolocation Error:", error);
      setIsLocating(false); // DỪNG QUAY NGAY LẬP TỨC NẾU LỖI
      
      switch(error.code) {
        case error.PERMISSION_DENIED:
          setMessage("❌ Bạn đã từ chối quyền truy cập vị trí.");
          break;
        case error.POSITION_UNAVAILABLE:
          setMessage("❌ Không thể xác định được vị trí.");
          break;
        case error.TIMEOUT:
          setMessage("❌ Quá thời gian lấy vị trí.");
          break;
        default:
          setMessage("❌ Lỗi vị trí không xác định.");
          break;
      }
    },
    // 3. Tham số thứ ba: CẤU HÌNH (Options)
    {
      enableHighAccuracy: true,
      timeout: 10000, // Nếu sau 10 giây không lấy được thì báo lỗi timeout
      maximumAge: 0
    }
  );
};

  // Calculate the total price of all items in the cart
  // 1. Tính tổng tiền hàng (chưa giảm)
  const subtotal = useMemo(() => {
    return cart.reduce(
      (sum, p) => sum + Number(p.price) * (p.quantity ?? 1),
      0
    );
  }, [cart]);

  // 2. Tính số tiền được giảm (dựa trên discount từ AuthContext)
  const discountAmount = user ? (subtotal * (discount / 100)) : 0;

  // 3. Tổng tiền cuối cùng khách phải trả
  const finalTotal = subtotal - discountAmount;

  // Helper function to handle image URLs (important for correct display)
  const getImgUrl = (item) => {
    const url = item.color_image || item.image_url;
    if (!url) return "https://via.placeholder.com/150?text=No+Image";
    // Assuming backend serves images from localhost:5000 and requires path fixing
    return url.startsWith("http")
      ? url
      : `http://localhost:5000/${url.replace(/^\/+/, "")}`;
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");

    // INPUT VALIDATION
    if (!address.trim()) {
      setMessage("Please enter a shipping address!");
      return;
    }

    // Guest user validation
    if (!user) {
      if (!guestName.trim() || !guestPhone.trim() || !guestEmail.trim()) {
        setMessage("Please enter your name, phone, and email!"); // Thêm email vào đây
        return;
      }
      // Check định dạng email cơ bản
      if (!guestEmail.includes("@")) {
        setMessage("Invalid email format!");
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
        total_price: finalTotal, // GỬI GIÁ ĐÃ GIẢM Ở ĐÂY
        address,
        phone: user ? user.phone : guestPhone,
        name: user ? user.name : guestName,
        email: user ? user.email : guestEmail,
        items: itemsPayload,
        payment_method: paymentMethod,
      };

      // Include Authorization header only if a token exists
      const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {}; // Guest users send no token

      // Post the order to the backend API
      const res = await API.post("/orders", orderData, { headers });

      setMessage("✅ Order placed successfully!");
      setCart([]); // Clear the cart upon successful order
      // Redirect after 2 seconds
      setTimeout(() => navigate(user ? "/profile" : "/"), 2000);
    } catch (err) {
      console.error(err);
      setMessage(
        "❌ Ordering Error: " + (err.response?.data?.message || err.message)
      );
    }
  };

  // If cart is empty, show empty cart message
  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
        <div className="text-gray-400 mb-4">
          {/* Using a generic cart icon - assuming font-awesome is linked */}
          <i className="fa-solid fa-cart-shopping text-6xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Your cart is empty
        </h2>
        <button
          onClick={() => navigate("/")}
          className="bg-violet-600 text-white px-6 py-2 rounded-full hover:bg-violet-700 transition"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center uppercase tracking-wide">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
        {/* --- LEFT COLUMN: INFO & PAYMENT (7/12 width on large screens) --- */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1a. Shipping Address */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-violet-600"></i>
                Shipping Address
              </h3>

              {/* Nút lấy vị trí hiện tại */}
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="text-xs flex items-center gap-1 text-violet-600 hover:text-violet-800 font-medium transition"
                disabled={isLocating}
              >
                <i className={`fa-solid ${isLocating ? "fa-spinner animate-spin" : "fa-crosshairs"}`}></i>
                {isLocating ? "Locating..." : "Use Current Location"}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Enter detailed address <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-400 focus:outline-none transition"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House number, street, ward/commune, district/city..."
              ></textarea>
            </div>
          </div>

          {/* 1b. Guest Information (nếu chưa đăng nhập) */}
          {!user && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-user text-violet-600"></i>
                Customer Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Full Name <span className="text-red-500">*</span> </label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-violet-400 outline-none"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">Phone Number <span className="text-red-500">*</span> </label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-violet-400 outline-none"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-violet-400 outline-none"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="Your email to receive Order OTP"
                  />
                  <p className="text-[11px] text-gray-400 mt-1 italic">
                    * Used to track your order status later.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. Payment Method */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-credit-card text-violet-600"></i>
              Payment Method
            </h3>
            <div className="space-y-3">
              {/* COD (Cash on Delivery) */}
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
                      Cash on Delivery (COD)
                    </span>
                    <p className="text-xs text-gray-500">
                      Pay cash upon delivery
                    </p>
                  </div>
                </div>
                {/* Icon for cash/payment - using font-awesome */}
                <i className="fa-solid fa-money-bill-wave text-xl text-green-600"></i>
              </label>

              {/* Bank Transfer */}
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
                      Bank Transfer
                    </span>
                    <p className="text-xs text-gray-500">
                      QR Code will appear after ordering
                    </p>
                  </div>
                </div>
                {/* Icon for bank */}
                <i className="fa-solid fa-building-columns text-xl text-blue-600"></i>
              </label>

              {/* E-Wallet */}
              <label
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${paymentMethod === "e-wallet"
                  ? "border-violet-600 bg-violet-50"
                  : "hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="e-wallet"
                    checked={paymentMethod === "e-wallet"}
                    onChange={() => setPaymentMethod("e-wallet")}
                    className="text-violet-600 focus:ring-violet-500"
                  />
                  <div>
                    <span className="font-bold text-gray-800">
                      MoMo / ZaloPay E-Wallet
                    </span>
                    {/* Add a descriptive line here if needed, or remove p tag */}
                  </div>
                </div>
                {/* Icon for wallet */}
                <i className="fa-solid fa-wallet text-xl text-pink-600"></i>
              </label>
            </div>
          </div>

          {/* 3. Complete Order Button (Located on the left for better flow) */}
          <button
            className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition transform active:scale-95 ${!address
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-violet-600 hover:bg-violet-700"
              }`}
            onClick={handleCheckout}
            disabled={!address}
          >
            COMPLETE ORDER
          </button>

          {/* Checkout Message */}
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

        {/* --- RIGHT COLUMN: ORDER SUMMARY (5/12 width on large screens) --- */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">
              Your Order ({cart.length} items)
            </h3>

            {/* Product List */}
            {/* Added custom-scrollbar class for styling flexibility if needed */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-6">
              {cart.map((item, index) => (
                <div key={index} className="flex gap-4 items-start">
                  {/* Product Image */}
                  <div className="w-16 h-16 flex-shrink-0 border rounded overflow-hidden">
                    <img
                      src={getImgUrl(item)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) =>
                      (e.target.src =
                        "http://localhost:5000/public/placeholder.jpg")
                      } // Placeholder fallback
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-800 line-clamp-2">
                      {item.name}
                    </h4>
                    <div className="text-xs text-gray-500 mt-1">
                      <span>Color: {item.color || "Random"}</span> |{" "}
                      <span>Size: {item.size || "F"}</span>
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

            {/* Total Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>{subtotal.toLocaleString()}đ</span>
              </div>

              {/* HIỂN THỊ GIẢM GIÁ NẾU CÓ */}
              {discountAmount > 0 && (
                <div className="flex justify-between text-red-600 font-medium bg-red-50 p-1 rounded">
                  <span>Member Discount ({tier}):</span>
                  <span>-{discountAmount.toLocaleString()}đ</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee:</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>

              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t mt-2">
                <span>Total:</span>
                <span className="text-red-600">{finalTotal.toLocaleString()}đ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}