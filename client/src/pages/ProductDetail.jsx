import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const backendUrl = "http://localhost:5000";

  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);

  const formatPrice = (price) => Number(price).toLocaleString("vi-VN");

  useEffect(() => {
    fetch(`${backendUrl}/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Sản phẩm không tồn tại");
        return res.json();
      })
      .then((data) => {
        // Xử lý ảnh chính
        if (data.image_url && !data.image_url.startsWith("http")) {
          data.image_url = `${backendUrl}${data.image_url}`;
        }
        // Xử lý ảnh các màu
        if (data.colors) {
          data.colors = data.colors.map((c) => ({
            ...c,
            image_url: c.image_url.startsWith("http") ? c.image_url : `${backendUrl}${c.image_url}`,
          }));
        }

        setProduct(data);

        // LOGIC TỰ ĐỘNG CHỌN:
        // 1. Nếu có màu, chọn màu đầu tiên.
        // 2. Nếu màu đó có size, chọn size đầu tiên.
        if (data.colors && data.colors.length > 0) {
          const firstColor = data.colors[0];
          setSelectedColor(firstColor);
          setMainImage(firstColor.image_url);

          if (firstColor.sizes && firstColor.sizes.length > 0) {
            // Tìm size còn hàng để chọn trước (ưu tiên trải nghiệm người dùng)
            const availableSize = firstColor.sizes.find(s => s.stock > 0);
            setSelectedSize(availableSize || firstColor.sizes[0]);
          }
        } else {
            // Trường hợp sản phẩm không có màu (chưa nhập liệu đủ)
            setMainImage(data.image_url);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Sản phẩm này đã bị xóa hoặc không tồn tại.");
      });
  }, [id]);

  // Khi người dùng đổi màu -> Cập nhật ảnh và reset size
  useEffect(() => {
    if (selectedColor) {
        setMainImage(selectedColor.image_url);

        // Kiểm tra xem màu mới có size nào stock > 0 không
        if (selectedColor.sizes && selectedColor.sizes.length > 0) {
            // Cố gắng giữ lại size cũ nếu màu mới cũng có size đó và còn hàng
            const sameSize = selectedColor.sizes.find(s => s.size === selectedSize?.size && s.stock > 0);
            // Nếu không có size cũ, chọn size đầu tiên còn hàng
            const firstAvailable = selectedColor.sizes.find(s => s.stock > 0);

            setSelectedSize(sameSize || firstAvailable || selectedColor.sizes[0]);
        } else {
            setSelectedSize(null);
        }
    }
  }, [selectedColor]);

  if (error) return (
    <div className="text-center py-20">
        <h2 className="text-xl font-bold text-red-600 mb-4">{error}</h2>
        <button onClick={() => navigate("/")} className="btn btn-outline-dark">Về trang chủ</button>
    </div>
  );

  if (!product) return <div className="text-center py-20">Đang tải thông tin sản phẩm...</div>;

  // Kiểm tra xem sản phẩm đã hoàn thiện dữ liệu chưa
  const isProductIncomplete = !product.colors || product.colors.length === 0;

  const currentStock = selectedSize ? selectedSize.stock : 0;

  const getStockMessage = () => {
    if (isProductIncomplete) return "Sản phẩm đang cập nhật.";
    if (!selectedColor) return "Vui lòng chọn màu sắc";
    if (!selectedColor.sizes || selectedColor.sizes.length === 0) return "Màu này tạm hết size";
    if (!selectedSize) return "Vui lòng chọn kích thước";
    if (currentStock === 0) return "Tạm hết hàng";
    return `Còn lại: ${currentStock} sản phẩm`;
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* CỘT TRÁI: ẢNH SẢN PHẨM */}
        <div className="flex flex-col gap-4">
          {/* Ảnh Lớn */}
          <div className="w-full aspect-square overflow-hidden rounded-lg border bg-gray-50">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-contain" // object-contain để thấy toàn bộ sp
              onError={(e) => e.target.src = "http://localhost:5000/public/placeholder.jpg"}
            />
          </div>

          {/* List Ảnh Nhỏ (Thumbnail) */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
                {product.colors.map(c => (
                    <img
                        key={c.id}
                        src={c.image_url}
                        className={`w-20 h-20 object-cover rounded cursor-pointer border-2 transition-all ${selectedColor?.id === c.id ? 'border-black ring-1 ring-black opacity-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        onClick={() => setSelectedColor(c)}
                        title={c.color_name}
                    />
                ))}
            </div>
          )}
        </div>

        {/* CỘT PHẢI: THÔNG TIN MUA HÀNG */}
        <div>
          <div className="mb-2 text-sm text-gray-500 uppercase tracking-widest">{product.category_name}</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-2xl text-red-600 font-bold">{formatPrice(product.price)} đ</p>

          {/* Chọn Màu */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Màu sắc: <span className="font-bold">{selectedColor?.color_name || "Chưa chọn"}</span></h3>
            <div className="flex items-center space-x-3">
              {product.colors?.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border shadow-sm transition-transform focus:outline-none ${
                    selectedColor?.id === color.id ? "ring-2 ring-offset-2 ring-black scale-110" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: color.color_code }}
                  title={color.color_name}
                />
              ))}
              {isProductIncomplete && <p className="text-sm text-gray-400 italic">Chưa có thông tin màu sắc.</p>}
            </div>
          </div>

          {/* Chọn Size */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-900">Kích thước</h3>
                {/* Có thể thêm link hướng dẫn chọn size tại đây */}
            </div>

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {selectedColor?.sizes?.map((sizeObj) => (
                <button
                  key={sizeObj.id}
                  onClick={() => setSelectedSize(sizeObj)}
                  disabled={sizeObj.stock === 0}
                  className={`border py-2 text-sm font-bold uppercase rounded transition-colors ${
                    selectedSize?.id === sizeObj.id
                      ? "bg-black text-white border-black"
                      : sizeObj.stock === 0
                      ? "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-100"
                      : "bg-white text-gray-900 hover:border-black"
                  }`}
                >
                  {sizeObj.size}
                </button>
              ))}
            </div>
            {!isProductIncomplete && (!selectedColor?.sizes || selectedColor.sizes.length === 0) && (
                <p className="text-sm text-red-500 italic mt-1">Màu này chưa nhập size.</p>
            )}
          </div>

          {/* Số lượng & Stock */}
          <div className="mt-8 flex items-center gap-6">
             <div className="flex items-center border rounded border-gray-300">
                <button
                    onClick={()=>setQuantity(Math.max(1, quantity-1))}
                    className="px-4 py-2 hover:bg-gray-100 text-lg text-gray-600"
                    disabled={quantity <= 1}
                >-</button>
                <span className="px-4 font-bold text-lg min-w-[3rem] text-center">{quantity}</span>
                <button
                    onClick={()=>setQuantity(Math.min(currentStock || 1, quantity+1))}
                    className="px-4 py-2 hover:bg-gray-100 text-lg text-gray-600"
                    disabled={quantity >= currentStock}
                >+</button>
             </div>
             <span className={`text-sm font-medium ${currentStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {getStockMessage()}
             </span>
          </div>

          {/* Nút Mua */}
          <button
            onClick={() => addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                color_id: selectedColor?.id,
                color: selectedColor?.color_name,
                color_image: selectedColor?.image_url,
                size_id: selectedSize?.id,
                size: selectedSize?.size,
                quantity,
                stock: currentStock
            })}
            disabled={currentStock === 0 || !selectedSize}
            className="mt-8 w-full bg-black text-white py-4 px-8 rounded font-bold text-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-lg"
          >
            {isProductIncomplete ? "Sản phẩm chưa sẵn sàng" : currentStock === 0 ? "HẾT HÀNG" : "THÊM VÀO GIỎ HÀNG"}
          </button>

          {/* Mô tả */}
          <div className="mt-10 border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Mô tả sản phẩm</h3>
            <div className="prose text-gray-600 text-sm leading-relaxed whitespace-pre-line">
              {product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
