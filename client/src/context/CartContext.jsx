import { createContext, useState } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Xác định 1 item đã tồn tại (id + size_id + color_id)
  const isMatch = (p1, p2) =>
    p1.id === p2.id &&
    p1.size_id === p2.size_id &&
    p1.color_id === p2.color_id;

  // Thêm sản phẩm vào giỏ
  const addToCart = (product) => {
    const existing = cart.find((item) => isMatch(item, product));

    if (existing) {
      // Nếu cùng biến thể → cộng số lượng
      setCart(
        cart.map((item) =>
          isMatch(item, product)
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        )
      );
    } else {
      // Nếu biến thể mới → thêm mới với cartItemId mới
      const newItem = {
        ...product,
        cartItemId: crypto.randomUUID(),
        quantity: product.quantity || 1,
        image_url: product.image_url || "/public/placeholder.jpg",
      };
      setCart([...cart, newItem]);
    }
  };

  // Cập nhật số lượng
  const updateQuantity = (cartItemId, delta) => {
    setCart(
      cart.map((p) =>
        p.cartItemId === cartItemId
          ? { ...p, quantity: Math.max(1, p.quantity + delta) }
          : p
      )
    );
  };

  // Xóa sản phẩm
  const removeFromCart = (cartItemId) => {
    setCart(cart.filter((p) => p.cartItemId !== cartItemId));
  };

  return (
    <CartContext.Provider
      value={{ cart, setCart, addToCart, updateQuantity, removeFromCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
