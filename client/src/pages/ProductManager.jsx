import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api.jsx";

export default function ProductManager() {
  const navigate = useNavigate();
  const backendUrl = "http://localhost:5000";
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    gender: "unisex",
    category_id: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [filterGender, setFilterGender] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        API.get("/admin/products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        API.get("/categories"),
      ]);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
      setCategories(
        Array.isArray(catRes.data) ? catRes.data : catRes.data?.data || []
      );
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, image_url: res.data.url }));
    } catch (err) {
      alert("Lỗi upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchGender = filterGender === "all" || p.gender === filterGender;
      const matchSearch = p.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchGender && matchSearch;
    });
  }, [products, filterGender, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 1. Validate & Trim dữ liệu
    const cleanName = form.name.trim();
    const cleanDesc = form.description.trim();

    if (!cleanName || !form.price || !form.category_id)
      return alert("Vui lòng nhập đủ thông tin!");

    const payload = { ...form, name: cleanName, description: cleanDesc };

    try {
      const endpoint = editingId
        ? `/admin/products/${editingId}`
        : "/admin/products";
      const method = editingId ? API.put : API.post;

      const res = await method(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setForm({
        name: "",
        description: "",
        price: "",
        image_url: "",
        gender: "unisex",
        category_id: "",
      });
      setEditingId(null);
      fetchData();

      if (!editingId) {
        // Nếu là thêm mới, hỏi người dùng có muốn vào trang chi tiết để nhập kho không
        if (
          window.confirm(
            "Thêm sản phẩm thành công! Bạn có muốn vào nhập Màu & Size (Tồn kho) ngay không?"
          )
        ) {
          navigate(`/admin/products/${res.data.id}`);
        }
      } else {
        alert("Cập nhật thành công!");
      }
    } catch (err) {
      alert("Lỗi lưu sản phẩm!");
    }
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price,
      image_url: p.image_url || "",
      gender: p.gender || "unisex",
      category_id: p.category_id || "",
    });
    setEditingId(p.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Chắc chắn xóa?")) return;
    try {
      await API.delete(`/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      alert("Lỗi xóa!");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 uppercase text-gray-800 border-b pb-2">
        Quản lý Sản phẩm
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CỘT TRÁI: FORM */}
        <div className="lg:col-span-4 bg-white p-6 rounded-lg shadow-lg lg:sticky top-24 border border-gray-200">
          <h3 className="font-bold text-lg mb-4 text-violet-600 border-b pb-2">
            {editingId ? "Sửa thông tin chung" : "Tạo sản phẩm mới"}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700">
                Tên sản phẩm
              </label>
              <input
                className="form-control"
                name="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ví dụ: Áo thun Cotton..."
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-bold">Giá bán</label>
                {/* Placeholder đã sửa */}
                <input
                  type="number"
                  className="form-control"
                  name="price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: +e.target.value })}
                  placeholder="Nhập giá..."
                />
              </div>
              <div>
                <label className="text-sm font-bold">Giới tính</label>
                <select
                  className="form-select"
                  name="gender"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="unisex">Unisex</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-bold">Danh mục</label>
              <select
                className="form-select"
                name="category_id"
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value })
                }
              >
                <option value="">-- Chọn --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* INPUT UPLOAD ẢNH */}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1">
                Ảnh đại diện (Chính)
              </label>
              <input
                type="file"
                className="form-control mb-2"
                onChange={handleFileUpload}
                accept="image/*"
              />
              <input
                className="form-control text-sm"
                name="image_url"
                value={form.image_url}
                onChange={(e) =>
                  setForm({ ...form, image_url: e.target.value })
                }
                placeholder="Hoặc nhập link ảnh online..."
              />
              {uploading && (
                <p className="text-blue-500 text-xs mt-1">
                  Đang tải ảnh lên...
                </p>
              )}
              {form.image_url && (
                <div className="mt-2 border rounded p-1">
                  <img
                    src={
                      form.image_url.startsWith("http")
                        ? form.image_url
                        : `${backendUrl}${form.image_url}`
                    }
                    alt="Preview"
                    className="w-full h-40 object-cover rounded"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-bold">Mô tả</label>
              <textarea
                className="form-control"
                rows="3"
                name="description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className={`btn w-full ${
                  editingId
                    ? "btn-warning"
                    : "bg-violet-600 text-white border-violet-600 hover:bg-violet-700 hover:border-violet-700"
                }`}
              >
                {editingId ? "Cập nhật thông tin" : "Tạo sản phẩm"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({
                      name: "",
                      description: "",
                      price: "",
                      image_url: "",
                      gender: "unisex",
                      category_id: "",
                    });
                  }}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
              )}
            </div>
            {!editingId && (
              <p className="text-xs text-gray-500 italic mt-2 text-center">
                Lưu ý: Sau khi tạo xong, bạn sẽ được chuyển hướng để nhập Màu
                sắc và Size (Tồn kho).
              </p>
            )}
          </form>
        </div>

        {/* CỘT PHẢI: DANH SÁCH */}
        <div className="lg:col-span-8">
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex flex-wrap gap-4 justify-between items-center border border-gray-200">
            <div className="flex gap-2">
              {["all", "male", "female", "unisex"].map((g) => (
                <button
                  key={g}
                  onClick={() => setFilterGender(g)}
                  className={`btn btn-sm ${
                    filterGender === g ? "btn-dark" : "btn-outline-secondary"
                  }`}
                >
                  {g === "all" ? "Tất cả" : g}
                </button>
              ))}
            </div>
            <input
              className="form-control w-auto rounded-pill"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="card h-100 cursor-pointer group bg-white"
                onClick={() => navigate(`/admin/products/${p.id}`)}
              >
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  {p.image_url ? (
                    <img
                      src={
                        p.image_url.startsWith("http")
                          ? p.image_url
                          : `${backendUrl}${p.image_url}`
                      }
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) =>
                        (e.target.src = "https://via.placeholder.com/300")
                      }
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <i className="fa-solid fa-image fa-2x"></i>
                    </div>
                  )}
                  <span
                    className={`absolute top-2 right-2 badge ${
                      p.gender === "male"
                        ? "bg-primary"
                        : p.gender === "female"
                        ? "bg-danger"
                        : "bg-success"
                    }`}
                  >
                    {p.gender}
                  </span>
                </div>
                <div className="card-body p-3">
                  <div className="text-xs text-muted uppercase mb-1">
                    {p.category_name}
                  </div>
                  <h6 className="card-title text-truncate font-bold">
                    {p.name}
                  </h6>
                  <div className="d-flex justify-content-between items-center mt-2">
                    <div className="text-danger fw-bold">
                      {Number(p.price).toLocaleString()}đ
                    </div>
                    <div className="btn-group">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(p);
                        }}
                        className="btn btn-sm btn-light text-warning"
                      >
                        <i className="fas fa-pen"></i>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(p.id);
                        }}
                        className="btn btn-sm btn-light text-danger"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                    Kho: <strong>{p.total_stock || 0}</strong> | Bấm để quản lý
                    Size
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
