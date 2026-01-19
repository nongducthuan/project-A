import { useContext, useMemo } from "react";
import { CartContext } from "../context/CartContext.jsx";
import { AuthContext } from "../context/AuthContext.jsx"; // 1. Import AuthContext
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useContext(CartContext);
  const { user, discount, tier } = useContext(AuthContext); // 2. Lấy thông tin hội viên
  const navigate = useNavigate();

  const formatPrice = (n) => Number(n).toLocaleString("vi-VN") + " đ";
  const backendUrl = "http://localhost:5000";

  // 3. LOGIC TÍNH TOÁN TỔNG TIỀN (Gồm giảm giá)
  const { subtotal, discountAmount, finalTotal, totalQuantity } = useMemo(() => {
    const sub = cart.reduce((sum, p) => sum + Number(p.price) * (p.quantity || 1), 0);
    const qty = cart.reduce((sum, item) => sum + item.quantity, 0);
    const dis = user ? (sub * (discount / 100)) : 0;
    
    return {
      subtotal: sub,
      discountAmount: dis,
      finalTotal: sub - dis,
      totalQuantity: qty
    };
  }, [cart, user, discount]);

  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/150?text=No+Image";
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
          <Link to="/" className="inline-block px-8 py-3 bg-black text-white font-bold rounded hover:bg-gray-800 transition">
            CONTINUE SHOPPING
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: CART ITEMS */}
          <div className="lg:w-2/3 flex flex-col gap-4">
            {cart.map((p) => (
              <div key={`${p.id}-${p.color_id}-${p.size_id}`} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-4 relative">
                <button onClick={() => removeFromCart(p.cartItemId)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-2 transition">
                  <i className="fa-solid fa-trash"></i>
                </button>

                <div className="w-24 h-24 flex-shrink-0 border rounded overflow-hidden bg-gray-50">
                  <img src={getImageUrl(p.color_image || p.image_url)} alt={p.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-grow text-left">
                  <Link to={`/products/${p.id}`} className="font-bold text-gray-800 hover:text-violet-600 transition text-lg leading-tight">
                    {p.name}
                  </Link>
                  <div className="text-sm text-gray-500 mt-1 flex gap-2">
                    {p.color && <span className="bg-gray-100 px-2 py-0.5 rounded">Màu: {p.color}</span>}
                    {p.size && <span className="bg-gray-100 px-2 py-0.5 rounded">Size: {p.size}</span>}
                  </div>
                  <div className="text-sm font-medium text-gray-400 mt-2 sm:hidden">
                    {formatPrice(p.price)}
                  </div>
                </div>

                <div className="flex items-center border rounded-lg overflow-hidden h-10">
                  <button onClick={() => updateQuantity(p.cartItemId, -1)} className="w-10 h-full hover:bg-gray-100 disabled:opacity-30" disabled={p.quantity <= 1}>-</button>
                  <span className="w-10 text-center font-bold text-sm">{p.quantity}</span>
                  <button onClick={() => updateQuantity(p.cartItemId, 1)} className="w-10 h-full hover:bg-gray-100 disabled:opacity-30" disabled={p.quantity >= (p.stock || 99)}>+</button>
                </div>

                <div className="w-32 text-right font-bold text-gray-800 text-lg hidden sm:block">
                  {formatPrice(p.price * p.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: SUMMARY (Cập nhật phần Membership) */}
          <div className="lg:w-1/3">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 sticky top-24">
              <h3 className="font-bold text-lg border-b pb-3 mb-4 text-gray-800">ORDER SUMMARY</h3>

              {/* Banner Hội viên / Gợi ý đăng nhập */}
              {user ? (
                <div className="bg-violet-50 border border-violet-100 p-3 rounded-lg mb-4 flex items-center gap-3">
                  <i className="fa-solid fa-crown text-violet-600"></i>
                  <div className="text-xs">
                    <p className="font-bold text-violet-800">Member Rank: {tier}</p>
                    <p className="text-violet-600">You are saving ({Math.round(discount)}%) on this order</p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg mb-4 flex items-center gap-3">
                  <i className="fa-solid fa-circle-info text-amber-600"></i>
                  <p className="text-xs text-amber-800">
                    <Link to="/login" className="font-bold underline">Login</Link> to receive up to 10% membership discount!
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalQuantity} items):</span>
                  <span className="font-medium text-gray-800">{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600 font-medium bg-red-50 p-2 rounded">
                    <span>Membership Discount ({Math.round(discount)}%):</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Shipping:</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>

                <div className="border-t pt-4 mt-2 flex justify-between items-center">
                  <span className="font-bold text-gray-800 text-lg">TOTAL</span>
                  <span className="font-extrabold text-red-600 text-2xl">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="block w-full bg-violet-600 text-white text-center mt-6 py-4 rounded-xl font-bold hover:bg-violet-700 transition shadow-lg transform active:scale-95"
              >
                PROCEED TO CHECKOUT
              </button>

              <Link to="/" className="block text-center mt-4 py-2 text-sm text-gray-400 hover:text-gray-800 transition">
                &larr; Continue shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}