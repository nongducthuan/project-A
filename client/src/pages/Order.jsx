import { useEffect, useState } from "react";
import API from "../api.jsx";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Bạn cần đăng nhập để xem đơn hàng.");
        setLoading(false);
        return;
      }

      try {
        const res = await API.get("/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải đơn hàng.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatCurrency = (amount) =>
    Number(amount).toLocaleString("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }) + " đ";

  if (loading)
    return <p className="text-center mt-4">Đang tải đơn hàng...</p>;
  if (error)
    return <p className="text-center mt-4">{error}</p>;
  if (!orders.length)
    return <p className="text-center mt-4">Chưa có đơn hàng.</p>;

  return (
    <div className="max-w-5xl mx-auto px-2 mt-4">
      <h2 className="text-center text-xl md:text-2xl font-bold mb-4">ĐƠN HÀNG CỦA TÔI</h2>
      {orders.map((order) => (
        <div key={order.id} className="bg-white shadow-md rounded-lg mb-4 overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 font-semibold">
            <span>Đơn #{order.id}</span> - <span>{order.status}</span> -{" "}
            <span>{new Date(order.created_at).toLocaleString()}</span>
          </div>
          <div className="p-4 space-y-2">
            <p><strong>Số điện thoại:</strong> {order.phone || "Chưa có"}</p>
            <p><strong>Địa chỉ giao hàng:</strong> {order.address || "Chưa có"}</p>
            <p><strong>Tổng tiền:</strong> {formatCurrency(order.total_price)}</p>

            <ul className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2"
                >
                  <div className="flex items-start sm:items-center mb-2 sm:mb-0">
                    {item.color_image && (
                      <img
                        src={item.color_image}
                        alt={item.color}
                        className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded mr-3"
                      />
                    )}
                    <div className="text-sm sm:text-base">
                      <strong>{item.product_name}</strong>
                      {item.size && <span> - Size: {item.size}</span>}
                      {item.color && <span> - Màu: {item.color}</span>}
                      <div>Số lượng: {item.quantity}</div>
                    </div>
                  </div>
                  <span className="text-sm sm:text-base font-medium">{formatCurrency(Number(item.price) * item.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
