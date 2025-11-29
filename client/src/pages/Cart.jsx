import { useContext } from "react";
import { CartContext } from "../context/CartContext.jsx";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
  const { cart, setCart, removeFromCart, updateQuantity } =
    useContext(CartContext);
  const navigate = useNavigate();

  // Helper to format price in Vietnamese currency (đ - VND)
  const formatPrice = (n) => Number(n).toLocaleString("vi-VN") + " đ";

  // Calculate total quantity of items
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate total price of all items
  const total = cart.reduce(
    (sum, p) => sum + Number(p.price) * (p.quantity || 1),
    0
  );

  const backendUrl = "http://localhost:5000";

  // Helper to get safe image link
  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/150?text=No+Image";
    // Checks if the URL is already an absolute link or needs the backend URL prepended
    return url.startsWith("http") ? url : `${backendUrl}${url}`;
  };

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold text-center mb-8 uppercase tracking-wide text-gray-800">
        Shopping Cart
      </h2>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-100">
          <i className="fa-solid fa-cart-arrow-down text-6xl text-gray-200 mb-4"></i>
          <p className="text-gray-500 text-lg mb-6">Your cart is empty</p>
          <Link
            to="/"
            className="inline-block px-8 py-3 bg-black text-white font-bold rounded hover:bg-gray-800 transition"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: CART ITEMS */}
          <div className="lg:w-2/3 flex flex-col gap-4">
            {cart.map((p, index) => {
              // Create unique key
              const itemKey = `${p.id}-${p.color_id || "nc"}-${
                p.size_id || "ns"
              }`;

              return (
                <div
                  key={itemKey}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-4 relative group"
                >
                  {/* Remove Button (top right for mobile, or hover for desktop) */}
                  <button
                    onClick={() => removeFromCart(p.cartItemId)}
                    className="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-2 transition"
                    title="Remove item"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>

                  {/* Product Image */}
                  <div className="w-24 h-24 flex-shrink-0 border rounded overflow-hidden bg-gray-50">
                    <img
                      src={getImageUrl(p.color_image || p.image_url)}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      onError={(e) =>
                        (e.target.src =
                          "https://via.placeholder.com/150?text=Error")
                      }
                    />
                  </div>

                  {/* Information */}
                  <div className="flex-grow text-left">
                    <Link
                      to={`/products/${p.id}`}
                      className="font-bold text-gray-800 hover:text-blue-600 transition text-lg"
                    >
                      {p.name}
                    </Link>

                    <div className="text-sm text-gray-500 mt-1 flex flex-wrap justify-center sm:justify-start gap-3">
                      {p.color && (
                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                          Color:{" "}
                          <span className="font-semibold text-gray-700">
                            {p.color}
                          </span>
                        </span>
                      )}
                      {p.size && (
                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                          Size:{" "}
                          <span className="font-semibold text-gray-700">
                            {p.size}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Unit Price for mobile */}
                    <div className="text-sm text-gray-400 mt-1 sm:hidden">
                      Unit Price: {formatPrice(p.price)}
                    </div>
                  </div>

                  {/* Quantity Controller */}
                  <div className="flex items-center border rounded">
                    <button
                      onClick={() => updateQuantity(p.cartItemId, -1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                      disabled={p.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-sm">
                      {p.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(p.cartItemId, +1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                      // Assuming 'stock' holds the maximum available quantity
                      disabled={p.quantity >= p.stock} 
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal Price */}
                  <div className="w-32 text-right font-bold text-red-600 text-lg hidden sm:block">
                    {formatPrice(p.price * p.quantity)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: SUMMARY (Sticky) */}
          <div className="lg:w-1/3">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-bold text-lg border-b pb-3 mb-4 text-gray-800">
                ORDER SUMMARY
              </h3>

              <div className="flex justify-between text-gray-600 mb-2">
                <span>Quantity:</span>
                <span className="font-medium">{totalQuantity} items</span>
              </div>

              <div className="flex justify-between text-gray-600 mb-4">
                <span>Subtotal:</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>

              <div className="border-t pt-4 mt-2 flex justify-between items-center">
                <span className="font-bold text-gray-800 text-lg">
                  TOTAL
                </span>
                <span className="font-bold text-red-600 text-2xl">
                  {formatPrice(total)}
                </span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="block w-full bg-black text-white text-center mt-6 py-4 rounded font-bold hover:bg-gray-800 transition shadow-lg"
              >
                PROCEED TO CHECKOUT
              </button>

              <Link
                to="/"
                className="block text-center mt-4 py-2 text-sm text-gray-500 hover:text-black hover:underline"
              >
                &larr; Continue shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}