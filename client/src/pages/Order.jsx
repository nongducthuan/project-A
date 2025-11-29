import { useEffect, useState } from "react";
import API from "../api.jsx";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      // Check for authentication token
      if (!token) {
        setError("You need to log in to view your orders.");
        setLoading(false);
        return;
      }

      try {
        // Fetch orders from the API
        const res = await API.get("/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error(err);
        setError("Could not load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Currency formatter for VND
  const formatCurrency = (amount) =>
    Number(amount).toLocaleString("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }) + " đ"; // Keeps the 'đ' symbol for Vietnamese currency

  // === Conditional Rendering based on state ===
  if (loading)
    return <p className="text-center mt-4">Loading orders...</p>;
  if (error)
    return <p className="text-center mt-4">{error}</p>;
  if (!orders.length)
    return <p className="text-center mt-4">You have no orders yet.</p>;

  // === Main Content Rendering ===
  return (
    <div className="max-w-5xl mx-auto px-2 mt-4">
      <h2 className="text-center text-xl md:text-2xl font-bold mb-4">MY ORDERS</h2>
      {orders.map((order) => (
        <div key={order.id} className="bg-white shadow-md rounded-lg mb-4 overflow-hidden">
          {/* Order Header */}
          <div className="bg-gray-100 px-4 py-2 font-semibold">
            <span>Order #{order.id}</span> - <span>{order.status}</span> -{" "}
            <span>{new Date(order.created_at).toLocaleString()}</span>
          </div>
          
          {/* Order Details */}
          <div className="p-4 space-y-2">
            <p><strong>Phone:</strong> {order.phone || "N/A"}</p>
            <p><strong>Shipping Address:</strong> {order.address || "N/A"}</p>
            <p><strong>Total Amount:</strong> {formatCurrency(order.total_price)}</p>

            {/* Order Items List */}
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
                      {item.color && <span> - Color: {item.color}</span>}
                      <div>Quantity: {item.quantity}</div>
                    </div>
                  </div>
                  {/* Price for the total quantity of this item */}
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