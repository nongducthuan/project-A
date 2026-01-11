import { useState } from "react";
import API from "../api";

export default function GuestOrderTracking() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Logic giữ nguyên
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/orders/send-otp", { email });
      setStep(2);
      // Có thể thay alert bằng Toast/Notification cho đẹp hơn
      // alert("Đã gửi mã OTP vào email của bạn!"); 
    } catch (err) {
      alert("Lỗi gửi OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/orders/verify-otp", { email, code: otp });
      setOrders(res.data.orders);
      setStep(3);
    } catch (err) {
      alert("Mã OTP sai hoặc đã hết hạn");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => Number(val).toLocaleString("vi-VN") + "đ";

  // --- PHẦN GIAO DIỆN ĐƯỢC NÂNG CẤP ---
  return (
    <div className="min-h-[calc(100vh-25vh)] bg-gray-100 flex items-center justify-center p-4">
      {/* CARD CONTAINER */}
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">

        {/* HEADER CỦA CARD */}
        <div className="bg-violet-600 p-6 text-center text-white">
          <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-3">
            {/* Icon thay đổi theo step */}
            {step === 1 && <i className="fa-solid fa-envelope text-2xl"></i>}
            {step === 2 && <i className="fa-solid fa-lock text-2xl"></i>}
            {step === 3 && <i className="fa-solid fa-box-open text-2xl"></i>}
          </div>
          <h2 className="text-2xl font-bold">
            {step === 1 && "Tra Cứu Đơn Hàng"}
            {step === 2 && "Xác Thực OTP"}
            {step === 3 && "Danh Sách Đơn Hàng"}
          </h2>
          <p className="text-violet-100 text-sm mt-1">
            {step === 1 && "Nhập email đã dùng để mua hàng"}
            {step === 2 && "Kiểm tra hộp thư đến của bạn"}
            {step === 3 && `Kết quả cho: ${email}`}
          </p>
        </div>

        {/* BODY CỦA CARD */}
        <div className="p-8">

          {/* --- BƯỚC 1: NHẬP EMAIL --- */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Email mua hàng</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400">
                    <i className="fa-solid fa-at"></i>
                  </span>
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vidu@gmail.com"
                  />
                </div>
              </div>
              <button
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition disabled:opacity-70"
              >
                {loading ? (
                  <span><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>Đang gửi...</span>
                ) : (
                  "Gửi mã xác thực"
                )}
              </button>
            </form>
          )}

          {/* --- BƯỚC 2: NHẬP OTP --- */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center">
                <label className="block text-sm font-semibold text-gray-600 mb-4">Nhập mã 6 số chúng tôi vừa gửi</label>
                <input
                  type="text"
                  required
                  className="w-2/3 mx-auto block text-center text-3xl tracking-[0.5em] font-bold border-b-2 border-gray-300 focus:border-violet-600 outline-none py-2 text-violet-800"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // Chỉ cho nhập số
                  maxLength={6}
                  placeholder="------"
                />
              </div>

              <button
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md transition disabled:opacity-70"
              >
                {loading ? "Đang kiểm tra..." : "Xác nhận & Xem đơn"}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gray-500 hover:text-violet-600 text-sm font-medium transition"
                >
                  <i className="fa-solid fa-arrow-left mr-1"></i> Gửi lại mã hoặc đổi Email?
                </button>
              </div>
            </form>
          )}

          {/* --- BƯỚC 3: KẾT QUẢ --- */}
          {step === 3 && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-10">
                  <i className="fa-solid fa-box-open text-4xl text-gray-300 mb-3"></i>
                  <p className="text-gray-500">Không tìm thấy đơn hàng nào.</p>
                </div>
              ) : (
                <div className="max-h-[450px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                      {/* Header đơn hàng */}
                      <div
                        onClick={() => toggleOrder(order.id)}
                        className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800">Đơn hàng #{order.id}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                              }`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(order.created_at).toLocaleDateString('vi-VN')} - {order.payment_method}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-violet-600">{formatCurrency(order.total_price)}</p>
                          <i className={`fa-solid fa-chevron-${expandedOrder === order.id ? 'up' : 'down'} text-xs text-gray-400`}></i>
                        </div>
                      </div>

                      {/* Chi tiết sản phẩm (Chỉ hiện khi nhấn vào) */}
                      {expandedOrder === order.id && (
                        <div className="bg-gray-50 p-4 border-t border-gray-100 space-y-3 animate-fadeIn">
                          {order.items && order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-center">
                              <img
                                src={`http://localhost:5000${item.image}`}
                                alt={item.product_name}
                                className="w-12 h-12 object-cover rounded-md border"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/150' }}
                              />
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-800 leading-tight">{item.product_name}</h4>
                                <p className="text-[11px] text-gray-500">
                                  Phân loại: {item.color}, {item.size} | SL: x{item.quantity}
                                </p>
                              </div>
                              <p className="text-sm font-semibold text-gray-700">{formatCurrency(item.price)}</p>
                            </div>
                          ))}

                          <div className="mt-3 pt-3 border-t border-dashed border-gray-300">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Địa chỉ giao hàng:</span>
                              <span className="text-gray-700 font-medium">{order.address}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Số điện thoại:</span>
                              <span className="text-gray-700 font-medium">{order.phone}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => { setStep(1); setOrders([]); setOtp(""); setEmail(""); }}
                className="w-full mt-4 border border-gray-300 text-gray-600 font-bold py-2 rounded-lg hover:bg-gray-100 transition"
              >
                Tra cứu Email khác
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}