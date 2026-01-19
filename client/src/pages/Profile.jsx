import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api.jsx";

// 1. Cấu hình các mốc hạng (Khớp với logic Seed MySQL của bạn)
const TIER_CONFIG = {
  Bronze: { next: 5000000, color: "text-orange-600", bg: "bg-orange-100", icon: "fa-medal", label: "Silver" },
  Silver: { next: 10000000, color: "text-slate-400", bg: "bg-slate-100", icon: "fa-award", label: "Gold" },
  Gold: { next: null, color: "text-yellow-500", bg: "bg-yellow-100", icon: "fa-crown", label: "Maximum" },
};

export default function Profile() {
  const { user, logout, discount, tier, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [phone, setPhone] = useState(user?.phone || "");

  const currentConfig = TIER_CONFIG[tier] || TIER_CONFIG.Bronze;
  const totalSpent = Number(user?.total_spent || 0);
  const rawProgress = currentConfig.next ? (totalSpent / currentConfig.next) * 100 : 100;
  const safeProgress = Math.min(rawProgress, 100);

  // 2. Logic khởi tạo và đồng bộ dữ liệu
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      refreshUser(); // Lấy dữ liệu mới nhất từ server (hạng, tổng chi)
    }
  }, []);

  useEffect(() => {
    if (user && activeTab === "orders") fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Lỗi lấy đơn hàng:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const formatCurrency = (val) => Number(val).toLocaleString("vi-VN") + "đ";

  if (!user) return null;

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen bg-gray-50 text-gray-800">
      {/* KHUNG CHÍNH (BOXED STYLE) */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* HEADER: Thông tin cơ bản */}
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 border-b border-gray-100">
          <div className={`w-20 h-20 ${currentConfig.bg} rounded-full flex items-center justify-center text-3xl ${currentConfig.color} shadow-inner`}>
            <i className={`fa-solid ${currentConfig.icon}`}></i>
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-2">
              <h2 className="text-2xl font-black">{user.name}</h2>
              <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${currentConfig.bg} ${currentConfig.color} border`}>
                {tier} Member
              </span>
            </div>
            <p className="text-gray-400 text-sm font-medium">{user.email}</p>
          </div>
          <button onClick={logout} className="px-6 py-2 border border-red-100 text-red-500 rounded-xl font-bold hover:bg-red-50 transition-all">
            Đăng xuất
          </button>
        </div>

        {/* THANH TABS */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-white text-black border-b-2 border-black' : 'text-gray-400 hover:text-black'}`}
          >
            Lịch sử đơn hàng
          </button>
          <button
            onClick={() => setActiveTab("info")}
            className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'info' ? 'bg-white text-black border-b-2 border-black' : 'text-gray-400 hover:text-black'}`}
          >
            Thành viên & Thông tin
          </button>
        </div>

        {/* NỘI DUNG TABS */}
        <div className="p-6 md:p-8">
          {activeTab === "orders" && (
            <OrderListSection
              orders={orders}
              loading={loadingOrders}
              formatCurrency={formatCurrency}
              setSelectedOrder={setSelectedOrder}
              navigate={navigate}
            />
          )}

          {activeTab === "info" && (
            <div className="max-w-3xl space-y-10">

              {/* MEMBERSHIP CARD (Dark Style inside Box) */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white rounded-3xl p-8 shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Hạng thành viên</p>
                  <h3 className="text-4xl font-black mb-6 italic flex items-center gap-3">
                    {tier}
                    <span className="text-sm font-normal not-italic text-slate-400 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                      Ưu đãi {Math.round(user?.discount_percent || 0)}%
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <p className="text-slate-500 text-[10px] font-black uppercase mb-1">Tổng chi tiêu</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
                    </div>
                    {currentConfig.next && (
                      <div className="text-right">
                        <p className="text-slate-500 text-[10px] font-black uppercase mb-1">Mốc kế tiếp</p>
                        <p className="text-2xl font-bold text-violet-400">{formatCurrency(currentConfig.next)}</p>
                      </div>
                    )}
                  </div>

                  {/* PROGRESS BAR LOGIC */}
                  {currentConfig.next ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                        <span className="text-slate-400">Tiến trình lên {currentConfig.label}</span>
                        <span>{Math.round(safeProgress)}%</span>
                      </div>
                      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full transition-all duration-1000"
                          style={{ width: `${safeProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 px-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 text-xs font-bold text-center">
                      🎉 Chúc mừng! Bạn đã đạt hạng cao nhất.
                    </div>
                  )}
                </div>
                {/* Icon trang trí ẩn hiện */}
                <i className={`fa-solid ${currentConfig.icon} absolute -right-6 -bottom-6 text-[10rem] text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700`}></i>
              </div>

              {/* FORM THÔNG TIN (Boxed) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Họ và tên</label>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-600 italic">
                    {user.name}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số điện thoại</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-bold"
                    placeholder="Nhập số điện thoại..."
                  />
                </div>
                <button className="md:col-span-2 w-full py-4 bg-black text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-800 transition shadow-lg shadow-black/10">
                  Cập nhật thông tin tài khoản
                </button>
              </div>

            </div>
          )}
        </div>
      </div>

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}

// Sub-component: Danh sách đơn hàng
function OrderListSection({ orders, loading, formatCurrency, setSelectedOrder, navigate }) {
  if (loading) return <div className="text-center py-20 text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">Đang tải dữ liệu...</div>;

  if (orders.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
      <i className="fa-solid fa-box-open text-4xl text-gray-200 mb-4"></i>
      <h3 className="font-black text-gray-400 uppercase text-xs tracking-widest">Bạn chưa có đơn hàng nào</h3>
      <button onClick={() => navigate("/")} className="mt-6 px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl">Mua sắm ngay</button>
    </div>
  );

  return (
    <div className="grid gap-4">
      {orders.map((order) => (
        <div key={order.id} className="border border-gray-100 rounded-2xl p-5 bg-white flex flex-col md:flex-row justify-between items-center hover:shadow-md hover:border-gray-200 transition-all group">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-colors">
              <i className="fa-solid fa-receipt text-lg"></i>
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-tighter">Đơn hàng #{order.id}</p>
              <p className="text-[10px] font-bold text-gray-400">{new Date(order.created_at).toLocaleDateString("vi-VN")}</p>
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-10 mt-4 md:mt-0">
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-300 uppercase">Tổng tiền</p>
              <p className="text-red-500 font-black tracking-tight">{formatCurrency(order.total_price)}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={order.status} />
              <button onClick={() => setSelectedOrder(order)} className="text-[10px] font-black text-violet-600 hover:underline tracking-widest uppercase">Chi tiết</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Pending: "bg-amber-50 text-amber-600 border-amber-100",
    Confirmed: "bg-blue-50 text-blue-600 border-blue-100",
    Shipping: "bg-purple-50 text-purple-600 border-purple-100",
    Delivered: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Cancelled: "bg-red-50 text-red-600 border-red-100",
  };
  return <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${map[status] || "bg-gray-100"}`}>{status}</span>;
}

function OrderDetailModal({ order, onClose, formatCurrency }) {
  if (!order) return null;
  const getImgUrl = (path) => path.startsWith("http") ? path : `http://localhost:5000${path}`;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-black text-lg uppercase">Chi tiết đơn hàng #{order.id}</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition">✕</button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {order.items?.map((item, i) => (
            <div key={i} className="flex gap-4 p-3 rounded-2xl border border-transparent hover:border-gray-100 transition">
              <img src={getImgUrl(item.image_url)} className="w-20 h-20 object-cover rounded-xl border" />
              <div className="flex-1">
                <p className="font-black text-gray-800 leading-tight">{item.product_name}</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">{item.color_name} | Size {item.size} | x{item.quantity}</p>
                <p className="font-black text-gray-900 mt-1">{formatCurrency(item.price)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
          <div className="text-xs">
            <p className="text-gray-500 font-black uppercase mb-1">Địa chỉ giao hàng</p>
            <p className="font-medium opacity-80">{order.address}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 font-black uppercase mb-1">Thanh toán</p>
            <p className="text-2xl font-black text-red-400">{formatCurrency(order.total_price)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}