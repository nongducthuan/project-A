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
        if (!res.ok) throw new Error("Product does not exist");
        return res.json();
      })
      .then((data) => {
        // Image processing for main image
        if (data.image_url && !data.image_url.startsWith("http")) {
          data.image_url = `${backendUrl}${data.image_url}`;
        }
        // Image processing for color images
        if (data.colors) {
          data.colors = data.colors.map((c) => ({
            ...c,
            image_url: c.image_url.startsWith("http") ? c.image_url : `${backendUrl}${c.image_url}`,
          }));
        }

        setProduct(data);

        // AUTO SELECTION LOGIC:
        // 1. If colors exist, select the first color.
        // 2. If that color has sizes, select the first available size.
        if (data.colors && data.colors.length > 0) {
          const firstColor = data.colors[0];
          setSelectedColor(firstColor);
          setMainImage(firstColor.image_url);

          if (firstColor.sizes && firstColor.sizes.length > 0) {
            // Find an in-stock size to select first (prioritize user experience)
            const availableSize = firstColor.sizes.find(s => s.stock > 0);
            setSelectedSize(availableSize || firstColor.sizes[0]);
          }
        } else {
            // Case where product has no colors (incomplete data)
            setMainImage(data.image_url);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("This product has been deleted or does not exist.");
      });
  }, [id]);

  // When user changes color -> Update image and reset size selection
  useEffect(() => {
    if (selectedColor) {
        setMainImage(selectedColor.image_url);

        // Check if the new color has any size in stock > 0
        if (selectedColor.sizes && selectedColor.sizes.length > 0) {
            // Try to keep the old size if the new color also has that size and it's in stock
            const sameSize = selectedColor.sizes.find(s => s.size === selectedSize?.size && s.stock > 0);
            // If the old size isn't available, select the first available size
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
        <button onClick={() => navigate("/")} className="btn btn-outline-dark">Go to homepage</button>
    </div>
  );

  if (!product) return <div className="text-center py-20">Loading product information...</div>;

  // Check if product data is complete
  const isProductIncomplete = !product.colors || product.colors.length === 0;

  const currentStock = selectedSize ? selectedSize.stock : 0;

  const getStockMessage = () => {
    if (isProductIncomplete) return "Product is updating.";
    if (!selectedColor) return "Please select a color";
    if (!selectedColor.sizes || selectedColor.sizes.length === 0) return "This color is temporarily out of size";
    if (!selectedSize) return "Please select a size";
    if (currentStock === 0) return "Out of stock";
    return `In stock: ${currentStock} items`;
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* LEFT COLUMN: PRODUCT IMAGES */}
        <div className="flex flex-col gap-4 ml-auto">
          {/* Main Image */}
          <div className="w-full aspect-square overflow-hidden rounded-lg border bg-gray-50">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-contain" // object-contain to show the whole product
              onError={(e) => e.target.src = "http://localhost:5000/public/placeholder.jpg"}
            />
          </div>

          {/* Thumbnail List */}
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

        {/* RIGHT COLUMN: PURCHASE INFO */}
        <div>
          <div className="mb-2 text-sm text-gray-500 uppercase tracking-widest">{product.category_name}</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-2xl text-red-600 font-bold">{formatPrice(product.price)} đ</p>

          {/* Color Selection */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Color: <span className="font-bold">{selectedColor?.color_name || "Not selected"}</span></h3>
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
              {isProductIncomplete && <p className="text-sm text-gray-400 italic">Color information not available.</p>}
            </div>
          </div>

          {/* Size Selection */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-900">Size</h3>
                {/* Size guide link can be added here */}
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
                <p className="text-sm text-red-500 italic mt-1">This color has no sizes available.</p>
            )}
          </div>

          {/* Quantity & Stock */}
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

          {/* Purchase Button */}
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
            className="mt-8 w-full sm:w-1/2 bg-black text-white py-4 px-8 rounded font-bold text-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-lg"
          >
            {isProductIncomplete ? "Product not ready" : currentStock === 0 ? "OUT OF STOCK" : "ADD TO CART"}
          </button>

          {/* Description */}
          <div className="mt-10 border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Product Description</h3>
            <div className="prose text-gray-600 text-sm leading-relaxed whitespace-pre-line">
              {product.description || "No detailed description available for this product."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}