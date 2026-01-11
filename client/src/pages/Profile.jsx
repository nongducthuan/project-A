import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../api.jsx";

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [phone, setPhone] = useState(user?.phone || "");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (activeTab === "orders") fetchOrders();
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

  const tabClass = (tab) =>
    `px-6 py-3 font-bold cursor-pointer border-b-2 ${
      activeTab === tab
        ? "border-black text-black"
        : "border-transparent text-gray-500 hover:text-black"
    }`;

  const getStatusBadge = (status) => {
    const map = {
      Pending: "bg-yellow-100 text-yellow-800",
      Confirmed: "bg-blue-100 text-blue-800",
      Shipping: "bg-purple-100 text-purple-800",
      Delivered: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-bold ${map[status]}`}>
        {status}
      </span>
    );
  };

  const handleUpdateProfile = async () => {
    if (!/^\d{10}$/.test(phone)) {
      Swal.fire("Invalid phone", "Phone must be 10 digits", "warning");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await API.put(
        "/auth/update-profile",
        { phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = { ...user, phone };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      Swal.fire("Success", "Profile updated", "success");
    } catch {
      Swal.fire("Error", "Update failed", "error");
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white rounded-xl border">
        {/* HEADER */}
        <div className="p-6 flex flex-col md:flex-row items-center gap-6 border-b">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-3xl text-gray-400">
            <i className="fa-solid fa-user"></i>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
          <button onClick={handleLogout} className="btn btn-outline-danger">
            Log out
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b">
          <div
            className={tabClass("orders")}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </div>
          <div
            className={tabClass("info")}
            onClick={() => setActiveTab("info")}
          >
            Account Info
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          {activeTab === "orders" && (
            <>
              {loadingOrders ? (
                <div className="text-center py-10 text-gray-500">
                  Loading orders...
                </div>
              ) : orders.length === 0 ? (
                /* ===== EMPTY STATE ===== */
                <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-lg border border-dashed">
                  <i className="fa-solid fa-box-open text-5xl text-gray-400 mb-4"></i>

                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    You have no orders yet
                  </h3>

                  <p className="text-sm text-gray-500 mb-6 max-w-sm">
                    Looks like you haven’t placed any orders. Start shopping to
                    see your orders appear here.
                  </p>

                  <button
                    onClick={() => navigate("/")}
                    className="px-6 py-3 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 transition"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                /* ===== ORDER LIST ===== */
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 bg-white"
                    >
                      <div className="flex justify-between mb-2">
                        <div>
                          <b>#{order.id}</b>{" "}
                          <span className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>

                      <div className="text-sm text-gray-500 mb-3">
                        {order.items?.length} items
                      </div>

                      <div className="flex justify-between items-center border-t pt-3">
                        <span className="text-gray-500">
                          Total:{" "}
                          <b className="text-red-600">
                            {formatCurrency(order.total_price)}
                          </b>
                        </span>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-violet-600 font-bold text-sm hover:underline"
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "info" && (
            <div className="max-w-3xl">
              {/* SECTION HEADER */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  Account Information
                </h3>
                <p className="text-sm text-gray-500">
                  Update your personal information below. Your email cannot be
                  changed.
                </p>
              </div>

              {/* FORM CARD */}
              <div className="bg-gray-50 border rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* FULL NAME */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={user.name}
                      disabled
                      className="w-full px-4 py-2 rounded-lg border bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-2 rounded-lg border bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  {/* PHONE */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>
                </div>

                {/* ACTION BAR */}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleUpdateProfile}
                    className="px-6 py-2.5 bg-violet-600 text-white font-bold rounded-lg
                     hover:bg-violet-700 transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ORDER DETAIL MODAL */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}

/* ================= ORDER DETAIL MODAL ================= */

function OrderDetailModal({ order, onClose, formatCurrency }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-2xl max-h-[90vh] rounded-t-xl sm:rounded-xl overflow-y-auto">
        <div className="p-4 border-b flex justify-between">
          <h3 className="font-bold text-lg">Order #{order.id}</h3>
          <button onClick={onClose} className="text-xl">
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          {order.items?.map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-16 h-16 bg-gray-100 border rounded flex items-center justify-center">
                <img
                  src={`http://localhost:5000${item.image_url}`}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <p className="font-bold">{item.product_name}</p>
                <p className="text-sm text-gray-500">
                  {item.color_name} | Size {item.size} | x{item.quantity}
                </p>
              </div>
              <div className="font-bold">{formatCurrency(item.price)}</div>
            </div>
          ))}

          <div className="border-t pt-4 space-y-1 text-sm">
            <p>
              <b>Address:</b> {order.address}
            </p>
            <p>
              <b>Status:</b> {order.status}
            </p>
            <p className="text-lg font-bold text-red-600">
              Total: {formatCurrency(order.total_price)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
