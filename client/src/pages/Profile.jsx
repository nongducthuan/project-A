import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../api.jsx";

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders"); // orders | info
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [phone, setPhone] = useState(user?.phone || "");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [user, activeTab]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const formatCurrency = (val) => Number(val).toLocaleString("vi-VN") + "đ";

  // CSS cho Tab
  const tabClass = (tabName) =>
    `px-6 py-3 font-bold cursor-pointer transition-all border-b-2 ${
      activeTab === tabName
        ? "border-black text-black"
        : "border-transparent text-gray-500 hover:text-black"
    }`;

  // CSS cho Badge trạng thái
  const getStatusBadge = (status) => {
    const colors = {
      "Chờ xác nhận": "bg-yellow-100 text-yellow-800",
      "Đã xác nhận": "bg-blue-100 text-blue-800",
      "Đang giao hàng": "bg-purple-100 text-purple-800",
      "Đã giao hàng": "bg-green-100 text-green-800",
      "Đã hủy": "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-bold ${
          colors[status] || "bg-gray-100"
        }`}
      >
        {status}
      </span>
    );
  };

  const handleUpdateProfile = async () => {
    // 🔍 Kiểm tra số điện thoại 10 số
    if (!/^\d{10}$/.test(phone)) {
      Swal.fire({
        icon: "warning",
        title: "Số điện thoại chưa hợp lệ",
        text: "Vui lòng nhập đúng 10 số.",
        confirmButtonText: "Đã hiểu",
      });
      return; // ⛔ Dừng lại, không gọi API
    }

    try {
      const token = localStorage.getItem("token");

      const res = await API.put(
        "/auth/update-profile",
        { phone },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedUser = { ...user, phone };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // 🎉 Thông báo thành công
      Swal.fire({
        icon: "success",
        title: "Cập nhật thành công!",
        text: "Thông tin của bạn đã được lưu.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);

      // ❌ Thông báo lỗi
      Swal.fire({
        icon: "error",
        title: "Cập nhật thất bại",
        text: err.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {/* Header Profile */}
        <div className="p-8 bg-white border-b flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-4xl">
            <i className="fa-solid fa-user"></i>
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-500">{user.email}</p>
            <p className="text-sm text-gray-400 mt-1">
              Thành viên từ:{" "}
              {new Date(user.created_at || Date.now()).toLocaleDateString(
                "vi-VN"
              )}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger px-4 py-2 rounded-full font-bold"
          >
            <i className="fa-solid fa-right-from-bracket mr-2"></i> Đăng xuất
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b bg-white sticky top-0 z-10">
          <div
            className={tabClass("orders")}
            onClick={() => setActiveTab("orders")}
          >
            Lịch sử đơn hàng
          </div>
          <div
            className={tabClass("info")}
            onClick={() => setActiveTab("info")}
          >
            Thông tin tài khoản
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 min-h-[400px]">
          {/* TAB 1: ĐƠN HÀNG */}
          {activeTab === "orders" && (
            <div>
              <h3 className="text-lg font-bold mb-4 uppercase text-gray-700">
                Đơn hàng của bạn
              </h3>
              {loadingOrders ? (
                <div className="text-center py-10 text-gray-500">
                  Đang tải...
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded border border-dashed">
                  <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
                  <button
                    onClick={() => navigate("/")}
                    className="mt-3 text-violet-600 font-bold hover:underline"
                  >
                    Mua sắm ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex justify-between items-center border-b pb-3 mb-3">
                        <div>
                          <span className="font-bold text-lg mr-3">
                            #{order.id}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                        <div>{getStatusBadge(order.status)}</div>
                      </div>

                      {/* List Item Preview */}
                      <div className="space-y-2">
                        {order.items &&
                          order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center text-sm"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden border">
                                  {item.image_url && (
                                    <img
                                      src={`http://localhost:5000${item.image_url}`}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800">
                                    {item.product_name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {item.color_name} | Size: {item.size} | x
                                    {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <div className="font-bold text-gray-700">
                                {formatCurrency(item.price)}
                              </div>
                            </div>
                          ))}
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-dashed">
                        <span className="text-sm text-gray-500">
                          Địa chỉ: {order.address}
                        </span>
                        <div className="text-lg">
                          Tổng tiền:{" "}
                          <span className="text-red-600 font-bold">
                            {formatCurrency(order.total_price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: THÔNG TIN */}
          {activeTab === "info" && (
            <div className="max-w-lg">
              <h3 className="text-lg font-bold mb-6 uppercase text-gray-700">
                Cập nhật thông tin
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue={user.name}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    defaultValue={user.email}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  {/* Sửa input để nhận giá trị từ state và onChange */}
                  <input
                    type="text"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                {/* Thêm sự kiện onClick */}
                <button
                  type="button"
                  onClick={handleUpdateProfile}
                  className="btn bg-violet-600 text-white mt-2 hover:bg-violet-700"
                >
                  Lưu thay đổi
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
