import { useNavigate } from "react-router-dom";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const backendUrl = "http://localhost:5000";

  const formatCurrency = (amount) =>
    Number(amount).toLocaleString("vi-VN") + " đ";

  // Hàm xử lý URL ảnh an toàn
  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/300x400?text=No+Image";
    return url.startsWith("http") ? url : `${backendUrl}${url}`;
  };

  return (
    <div
      className="card product-card border-0 shadow-sm h-100 cursor-pointer group bg-white"
      onClick={() => navigate(`/products/${product.id}`)}
    >
      {/* Phần Ảnh */}
      <div className="position-relative overflow-hidden bg-gray-100" style={{ paddingTop: "100%" }}> {/* Tỉ lệ vuông 1:1 */}
        <img
          src={getImageUrl(product.image_url)}
          className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover transition-transform duration-500 group-hover:scale-105"
          alt={product.name}
          onError={(e) => e.target.src = "https://via.placeholder.com/300x400?text=Error"}
        />
        {/* Badge Gender */}
        {product.gender && (
            <span className={`position-absolute top-2 end-2 badge ${
                product.gender === 'male' ? 'bg-primary' :
                product.gender === 'female' ? 'bg-danger' : 'bg-success'
            }`}>
                {product.gender === 'male' ? 'Nam' : product.gender === 'female' ? 'Nữ' : 'Unisex'}
            </span>
        )}
      </div>

      {/* Phần Thông tin */}
      <div className="card-body d-flex flex-column p-3">
        {/* Tên Sản phẩm: Giới hạn 1 dòng */}
        <h3
            className="font-bold text-base text-gray-800 mb-1 text-truncate"
            title={product.name}
        >
            {product.name}
        </h3>

        {/* Mô tả: Giới hạn 2 dòng bằng CSS line-clamp */}
        <p
            className="text-muted small mb-2"
            style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                height: '3em', // Chiều cao cố định cho 2 dòng
                lineHeight: '1.5em'
            }}
        >
            {product.description || "Không có mô tả thêm."}
        </p>

        {/* Giá tiền */}
        <div className="mt-auto">
            <p className="text-danger fw-bold fs-5 mb-0">
                {formatCurrency(product.price)}
            </p>
        </div>
      </div>
    </div>
  );
}
