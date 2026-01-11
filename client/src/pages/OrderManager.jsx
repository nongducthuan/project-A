import { useState, useEffect } from "react";
import API from "../api.jsx";
import Toast from "../pages/Toast.jsx";

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmAction, setConfirmAction] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All"); // Default filter value
  const token = localStorage.getItem("token");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const fetchOrders = async () => {
    try {
      const res = await API.get("/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Sort: Newest first
      const sortedOrders = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setOrders(sortedOrders);
    } catch (err) {
      console.error(err);
      showToast("Error loading orders", "error");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleChangeStatus = async (orderId, status) => {
    try {
      await API.put(
        `/admin/orders/${orderId}`,
        { status }, // Backend receives Vietnamese string
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status }));
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || err.message, "error");
    }
  };

  const formatCurrency = (amount) =>
    Number(amount).toLocaleString("vi-VN") + "đ";

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#ffc107"; // Yellow
      case "Confirmed":
        return "#17a2b8"; // Cyan
      case "Shipping":
        return "#007bff"; // Blue
      case "Delivered":
        return "#28a745"; // Green
      case "Cancelled":
        return "#dc3545"; // Red
      default:
        return "#6c757d";
    }
  };

  // Filter Logic
  const filteredOrders = orders.filter(
    (order) => filterStatus === "All" || order.status === filterStatus
  );

  return (
    <div className="container mx-auto p-4 mb-20">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <h2 className="text-center text-2xl font-bold mb-6 uppercase text-gray-800">
        Order Management
      </h2>

      {/* Filter Bar */}
      <div className="flex justify-end mb-4">
        <div className="relative w-full md:w-auto">
          <select
            className="w-full md:w-48 p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            {/* Values must match DB (Vietnamese), Labels are English */}
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipping">Shipping</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
          <i className="fa-regular fa-folder-open text-4xl mb-3 block"></i>
          No orders found.
        </div>
      ) : (
        <>
          {/* --- MOBILE VIEW (CARD) --- */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-4 rounded-lg shadow border border-gray-100 relative"
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className="px-2 py-1 rounded text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                  </span>
                </div>

                {/* Main Info */}
                <div className="mb-2 pr-20">
                  <p className="font-bold text-gray-800">
                    #{order.id} - {order.user_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleString("en-GB")}
                  </p>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="text-red-600 font-bold text-lg">
                    {formatCurrency(order.total_price)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setConfirmAction(false);
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded text-sm font-medium transition"
                  >
                    Details
                  </button>
                  {/* Quick Status Select */}
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleChangeStatus(order.id, e.target.value)
                    }
                    className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded text-sm pl-2 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Shipping">Shipping</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* --- DESKTOP VIEW (TABLE) --- */}
          <div className="hidden md:block overflow-hidden rounded-lg shadow border border-gray-200">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID / Date
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        #{order.id}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("en-GB")}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.user_name}
                      </div>
                      <div className="text-xs text-gray-500">{order.phone}</div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-red-600 font-bold">
                      {formatCurrency(order.total_price)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleChangeStatus(order.id, e.target.value)
                        }
                        className="text-xs font-bold text-white py-1 px-2 rounded cursor-pointer border-0 focus:ring-2 focus:ring-offset-1"
                        style={{
                          backgroundColor: getStatusColor(order.status),
                        }}
                      >
                        <option
                          value="Pending"
                          className="text-gray-800 bg-white"
                        >
                          Pending
                        </option>
                        <option
                          value="Confirmed"
                          className="text-gray-800 bg-white"
                        >
                          Confirmed
                        </option>
                        <option
                          value="Shipping"
                          className="text-gray-800 bg-white"
                        >
                          Shipping
                        </option>
                        <option
                          value="Delivered"
                          className="text-gray-800 bg-white"
                        >
                          Delivered
                        </option>
                        <option
                          value="Cancelled"
                          className="text-gray-800 bg-white"
                        >
                          Cancelled
                        </option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setConfirmAction(false);
                        }}
                        className="text-blue-600 hover:text-blue-900 font-medium text-sm border border-blue-600 px-3 py-1 rounded hover:bg-blue-50 transition"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* --- MODAL DETAILS --- */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex justify-center items-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scaleIn relative z-50">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h4 className="text-lg font-bold text-gray-800">
                Order Details #{selectedOrder.id}
              </h4>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 overflow-y-auto custom-scrollbar">
              {/* Customer Info */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4 text-sm">
                <h5 className="font-bold text-blue-800 mb-2 uppercase text-xs">
                  Delivery Information
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <p>
                    <span className="font-semibold text-gray-600">
                      Recipient:
                    </span>{" "}
                    {selectedOrder.user_name}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-600">Phone:</span>{" "}
                    {selectedOrder.phone}
                  </p>
                  <p className="sm:col-span-2">
                    <span className="font-semibold text-gray-600">
                      Address:
                    </span>{" "}
                    {selectedOrder.address}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-600">
                      Date Placed:
                    </span>{" "}
                    {new Date(selectedOrder.created_at).toLocaleString("en-GB")}
                  </p>
                </div>
              </div>

              {/* Product List */}
              <h5 className="font-bold text-gray-800 mb-2 text-sm uppercase">
                Products ({selectedOrder.items?.length})
              </h5>
              <div className="space-y-3">
                {selectedOrder.items &&
                  selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 bg-white border rounded p-2 items-start"
                    >
                      <img
                        src={
                          item.image_url?.startsWith("http")
                            ? item.image_url
                            : `http://localhost:5000${item.image_url}`
                        }
                        onError={(e) =>
                          (e.target.src =
                            "http://localhost:5000/public/placeholder.jpg")
                        }
                        alt=""
                        className="w-16 h-16 object-cover rounded border bg-gray-50 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.color_name && `Color: ${item.color_name}`}
                          {item.size && ` | Size: ${item.size}`}
                        </p>
                        <div className="flex justify-between items-end mt-2">
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            x{item.quantity}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <span className="font-bold text-gray-600">Grand Total:</span>
                <span className="text-xl font-bold text-red-600">
                  {formatCurrency(selectedOrder.total_price)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>

              {selectedOrder.status === "Pending" &&
                (confirmAction ? (
                  <button
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition animate-pulse"
                    onClick={() => {
                      handleChangeStatus(selectedOrder.id, "Confirmed");
                      setConfirmAction(false);
                    }}
                    onMouseLeave={() => setConfirmAction(false)}
                  >
                    Confirm Now?
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition flex items-center gap-2"
                    onClick={() => setConfirmAction(true)}
                  >
                    <i className="fa-solid fa-check"></i> Approve
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
