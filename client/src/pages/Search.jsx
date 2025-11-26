import { useState, useEffect, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom"; // Thêm useSearchParams
import API from "../api.jsx";
import ProductCard from "../components/ProductCard.jsx";

const PRICE_RANGES = [
  { label: "Tất cả", min: 0, max: Infinity },
  { label: "< 100k", min: 0, max: 100000 },
  { label: "100k - 300k", min: 100000, max: 300000 },
  { label: "300k - 500k", min: 300000, max: 500000 },
  { label: "> 500k", min: 500000, max: Infinity },
];

const GENDERS = [
  { id: "all", label: "Tất cả" },
  { id: "male", label: "Nam" },
  { id: "female", label: "Nữ" },
  { id: "unisex", label: "Unisex" },
];

export default function SearchResults() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy tham số từ URL để đồng bộ với Navbar
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("query") || "";
  const urlGender = searchParams.get("gender") || "all";
  const urlCategory = searchParams.get("category") || "";

  // State bộ lọc (Khởi tạo giá trị từ URL)
  const [filterGender, setFilterGender] = useState(urlGender);
  const [filterCategory, setFilterCategory] = useState(urlCategory);
  const [filterPrice, setFilterPrice] = useState(0);

  // Đồng bộ lại State khi URL thay đổi (Ví dụ: Đang ở Search bấm Navbar đổi giới tính)
  useEffect(() => {
    setFilterGender(urlGender);
    setFilterCategory(urlCategory);
  }, [urlGender, urlCategory]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          API.get("/products?limit=2000"), // Lấy nhiều để lọc client
          API.get("/categories"),
        ]);

        const prodData = Array.isArray(prodRes.data)
          ? prodRes.data
          : prodRes.data?.data || [];
        const catData = Array.isArray(catRes.data)
          ? catRes.data
          : catRes.data?.data || [];

        setProducts(prodData);
        setCategories(catData);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Chỉ chạy 1 lần khi mount

  // Logic Lọc
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];

    return products.filter((p) => {
      // a. Tên (Ưu tiên tìm theo tên có dấu hoặc không dấu)
      const matchQuery = p.name.toLowerCase().includes(urlQuery.toLowerCase());

      // b. Giới tính
      let matchGender = true;
      if (filterGender !== "all") {
        matchGender = p.gender === filterGender;
      }

      // c. Danh mục
      let matchCategory = true;
      if (filterCategory) {
        matchCategory = String(p.category_id) === String(filterCategory);
      }

      // d. Giá
      const selectedRange = PRICE_RANGES[filterPrice];
      const price = Number(p.price);
      const matchPrice =
        price >= selectedRange.min && price < selectedRange.max;

      return matchQuery && matchGender && matchCategory && matchPrice;
    });
  }, [products, urlQuery, filterGender, filterCategory, filterPrice]);

  // Hàm cập nhật bộ lọc và URL
  const updateFilter = (key, value) => {
    if (key === "gender") setFilterGender(value);
    if (key === "category") setFilterCategory(value);
    if (key === "price") setFilterPrice(value);

    // Cập nhật URL để người dùng có thể copy link gửi cho người khác
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== "all" && value !== 0) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Đang tải dữ liệu...
      </div>
    );

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen flex flex-col md:flex-row gap-8">
      {/* SIDEBAR BỘ LỌC */}
      <div className="w-full md:w-1/4 flex-shrink-0">
        <div className="sticky top-24 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="font-bold text-lg uppercase text-gray-800">
              Bộ lọc
            </h3>
            <button
              className="text-xs text-red-500 hover:underline"
              onClick={() => setSearchParams({})} // Reset URL về trắng
            >
              Xóa tất cả
            </button>
          </div>

          {/* Giới tính */}
          <div className="mb-6">
            <h4 className="font-semibold text-sm mb-3 text-gray-700">
              Giới tính
            </h4>
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => updateFilter("gender", g.id)}
                  className={`px-3 py-1.5 text-sm border rounded transition-all ${
                    filterGender === g.id
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Danh mục */}
          <div className="mb-6">
            <h4 className="font-semibold text-sm mb-3 text-gray-700">
              Danh mục
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateFilter("category", "")}
                className={`px-2 py-2 text-sm border rounded text-center transition-all ${
                  !filterCategory
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
                }`}
              >
                Tất cả
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateFilter("category", c.id)}
                  className={`px-2 py-2 text-sm border rounded text-center truncate ${
                    String(filterCategory) === String(c.id)
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
                  }`}
                  title={c.name}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Giá tiền */}
          <div className="mb-6">
            <h4 className="font-semibold text-sm mb-3 text-gray-700">
              Mức giá
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {PRICE_RANGES.map((range, index) => (
                <button
                  key={index}
                  onClick={() => updateFilter("price", index)}
                  className={`px-3 py-2 text-sm border rounded text-left transition-all ${
                    filterPrice === index
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DANH SÁCH SẢN PHẨM */}
      <div className="w-full md:w-3/4">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold uppercase text-gray-800">
              {urlQuery ? `Kết quả: "${urlQuery}"` : "Tất cả sản phẩm"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Hiển thị {filteredProducts.length} sản phẩm
            </p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">
              Không tìm thấy sản phẩm nào phù hợp.
            </p>
            <button
              className="mt-4 text-sm text-blue-600 hover:underline"
              onClick={() => setSearchParams({})}
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
