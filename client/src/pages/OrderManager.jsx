import { useState, useEffect } from "react";
import API from "../api.jsx";
import Toast from "../pages/Toast.jsx";

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmAction, setConfirmAction] = useState(false); // State để xử lý xác nhận 2 bước
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const token = localStorage.getItem("token");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const fetchOrders = async () => {
    try {
      const res = await API.get("/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Sắp xếp: Cũ nhất lên đầu
      const sortedOrders = res.data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setOrders(sortedOrders);
    } catch (err) {
      console.error(err);
      showToast("Lỗi tải danh sách đơn hàng", "error");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleChangeStatus = async (orderId, status) => {
    try {
      await API.put(
        `/admin/orders/${orderId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status }));
      }
      showToast(`Đã cập nhật trạng thái: ${status}`, "success");
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || err.message, "error");
    }
  };

  const formatCurrency = (amount) => Number(amount).toLocaleString("vi-VN") + " đ";

  const getStatusColor = (status) => {
    switch (status) {
      case "Chờ xác nhận": return "#ffc107";
      case "Đã xác nhận": return "#17a2b8";
      case "Đang giao hàng": return "#007bff";
      case "Đã giao hàng": return "#28a745";
      case "Đã hủy": return "#dc3545";
      default: return "#6c757d";
    }
  };

  return (
    <div className="container mt-4 mb-5 relative">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <h2 className="text-center text-2xl font-bold mb-4 uppercase">Quản lý Đơn hàng</h2>
      <div className="flex justify-end mb-3">
        <select
          className="form-select w-auto"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="Tất cả">Tất cả</option>
          <option value="Chờ xác nhận">Chờ xác nhận</option>
          <option value="Đã xác nhận">Đã xác nhận</option>
          <option value="Đang giao hàng">Đang giao hàng</option>
          <option value="Đã giao hàng">Đã giao hàng</option>
          <option value="Đã hủy">Đã hủy</option>
        </select>
      </div>
      {orders.length === 0 ? (
        <div className="text-center py-10 text-muted bg-white shadow-sm rounded">
          Chưa có đơn hàng nào cần xử lý.
        </div>
      ) : (
        <div className="table-responsive shadow rounded">
          <table className="table table-hover align-middle mb-0 bg-white">
            <thead className="bg-light">
              <tr>
                <th className="py-3 ps-3">STT</th>
                <th>Ngày đặt</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th className="text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {orders
                .filter(order => filterStatus === "Tất cả" || order.status === filterStatus)
                .map((order, index) => (
                  <tr key={order.id}>
                    <td className="fw-bold ps-3 text-muted">#{index + 1}</td>
                    <td>
                      <span className="fw-semibold">{new Date(order.created_at).toLocaleDateString("vi-VN")}</span>
                      <br />
                      <small className="text-muted">{new Date(order.created_at).toLocaleTimeString("vi-VN")}</small>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{order.user_name}</div>
                      <div className="text-muted small">{order.phone}</div>
                    </td>
                    <td className="text-danger fw-bold">{formatCurrency(order.total_price)}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleChangeStatus(order.id, e.target.value)}
                        className="form-select form-select-sm fw-bold text-white border-0 shadow-none"
                        style={{
                          backgroundColor: getStatusColor(order.status),
                          width: "150px",
                          cursor: "pointer"
                        }}
                      >
                        <option value="Chờ xác nhận">Chờ xác nhận</option>
                        <option value="Đã xác nhận">Đã xác nhận</option>
                        <option value="Đang giao hàng">Đang giao hàng</option>
                        <option value="Đã giao hàng">Đã giao hàng</option>
                        <option value="Đã hủy">Đã hủy</option>
                      </select>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-outline-primary btn-sm rounded-pill px-3"
                        onClick={() => {
                          setSelectedOrder(order);
                          setConfirmAction(false); // Reset trạng thái nút khi mở modal mới
                        }}
                      >
                        <i className="fa-solid fa-eye me-1"></i> Xem
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- MODAL CHI TIẾT ĐƠN HÀNG --- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">

            {/* Header Modal */}
            <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-lg">
              <h4 className="text-lg font-bold text-gray-800 m-0">
                Chi tiết đơn hàng #{selectedOrder.id}
              </h4>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-red-500 transition border-0 bg-transparent text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-4">
              {/* Thông tin khách hàng */}
              <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-100">
                <h5 className="font-bold text-blue-800 mb-2 text-sm uppercase">Thông tin giao hàng</h5>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <p><span className="font-semibold">Người nhận:</span> {selectedOrder.user_name}</p>
                  <p><span className="font-semibold">SĐT:</span> {selectedOrder.phone}</p>
                  <p className="col-span-2"><span className="font-semibold">Địa chỉ:</span> {selectedOrder.address}</p>
                  <p><span className="font-semibold">Ngày đặt:</span> {new Date(selectedOrder.created_at).toLocaleString("vi-VN")}</p>
                  <p>
                    <span className="font-semibold">Trạng thái: </span>
                    <span className="badge" style={{ backgroundColor: getStatusColor(selectedOrder.status) }}>{selectedOrder.status}</span>
                  </p>
                </div>
              </div>

              {/* Danh sách sản phẩm */}
              <h5 className="font-bold text-gray-800 mb-3 text-sm uppercase">Sản phẩm đã đặt</h5>
              <div className="border rounded overflow-hidden mb-4">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-2">Sản phẩm</th>
                      <th className="p-2">Phân loại</th>
                      <th className="p-2 text-center">SL</th>
                      <th className="p-2 text-end">Đơn giá</th>
                      <th className="p-2 text-end">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-medium">
                          <div className="flex items-center gap-2">
                            {item.image_url && (
                              <img
                                src={item.image_url.startsWith('http') ? item.image_url : `http://localhost:5000${item.image_url}`}
                                alt=""
                                className="w-10 h-10 object-cover rounded border"
                                onError={(e) => e.target.src = "http://localhost:5000/public/placeholder.jpg"}
                              />
                            )}
                            <span>{item.product_name}</span>
                          </div>
                        </td>
                        <td className="p-2 text-gray-600">
                          {item.color_name && <span>Màu: {item.color_name}</span>}
                          {item.size && <span className="ml-1">| Size: {item.size}</span>}
                        </td>
                        <td className="p-2 text-center">{item.quantity}</td>
                        <td className="p-2 text-end">{formatCurrency(item.price)}</td>
                        <td className="p-2 text-end font-semibold">{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tổng tiền */}
              <div className="text-end border-t pt-3">
                <span className="text-gray-600 mr-2">Tổng thanh toán:</span>
                <span className="text-2xl font-bold text-red-600">{formatCurrency(selectedOrder.total_price)}</span>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition"
                onClick={() => setSelectedOrder(null)}
              >
                Đóng
              </button>
              {selectedOrder.status === "Chờ xác nhận" && (
                // Thay thế window.confirm bằng nút xác nhận 2 bước
                confirmAction ? (
                  <button
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition font-bold animate-pulse"
                    onClick={() => {
                      handleChangeStatus(selectedOrder.id, "Đã xác nhận");
                      setConfirmAction(false);
                    }}
                    onMouseLeave={() => setConfirmAction(false)} // Tự reset nếu di chuột ra ngoài
                  >
                    <i className="fa-solid fa-circle-question mr-2"></i>
                    Chắc chắn xác nhận?
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition font-bold"
                    onClick={() => setConfirmAction(true)}
                  >
                    <i className="fa-solid fa-check mr-2"></i>
                    Xác nhận đơn
                  </button>
                )
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
