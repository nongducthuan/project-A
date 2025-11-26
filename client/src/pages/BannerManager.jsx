import { useState, useEffect } from "react";
import API from "../api.jsx";

export default function BannerManager() {
  const backendUrl = "http://localhost:5000";
  const token = localStorage.getItem("token");
  const [banners, setBanners] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ image_url: "", title: "", subtitle: "" });
  const [editingId, setEditingId] = useState(null);

  const fetchBanners = async () => {
    try {
      const res = await API.get("/admin/banners", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBanners(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = editingId
        ? `/admin/banners/${editingId}`
        : "/admin/banners";
      const method = editingId ? API.put : API.post;
      await method(endpoint, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ image_url: "", title: "", subtitle: "" });
      setEditingId(null);
      fetchBanners();
      alert("Thành công!");
    } catch (err) {
      alert("Lỗi lưu banner!");
    }
  };

  const handleEdit = (b) => {
    setForm({ image_url: b.image_url, title: b.title, subtitle: b.subtitle });
    setEditingId(b.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa banner này?")) return;
    try {
      await API.delete(`/admin/banners/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBanners();
    } catch (err) {
      alert("Lỗi xóa!");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 uppercase text-gray-800 border-b pb-2">
        Quản lý Banner
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* FORM */}
        <div className="lg:col-span-4 bg-white p-6 rounded-lg shadow-lg sticky top-24 border border-gray-200">
          <h3 className="font-bold text-lg mb-4 text-violet-600 border-b pb-2">
            {editingId ? "Sửa Banner" : "Thêm Banner"}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="font-bold text-sm">Tiêu đề</label>
              <input
                className="form-control"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="font-bold text-sm">Phụ đề</label>
              <input
                className="form-control"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              />
            </div>

            {/* Upload */}
            <div>
              <label className="font-bold text-sm mb-1">Hình ảnh</label>
              <input
                type="file"
                className="form-control mb-2"
                onChange={handleFileUpload}
                accept="image/*"
              />
              <input
                className="form-control text-sm"
                value={form.image_url}
                onChange={(e) =>
                  setForm({ ...form, image_url: e.target.value })
                }
                placeholder="Hoặc link online..."
              />
              {uploading && (
                <p className="text-xs text-blue-500">Uploading...</p>
              )}
              {form.image_url && (
                <img
                  src={
                    form.image_url.startsWith("http")
                      ? form.image_url
                      : `${backendUrl}${form.image_url}`
                  }
                  className="mt-2 w-full h-32 object-cover rounded border"
                />
              )}
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
                {editingId ? "Cập nhật" : "Thêm mới"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ image_url: "", title: "", subtitle: "" });
                  }}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* LIST */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((b) => (
            <div key={b.id} className="card shadow-sm h-100 bg-white group">
              <div className="ratio ratio-21x9 bg-light overflow-hidden">
                <img
                  src={
                    b.image_url.startsWith("http")
                      ? b.image_url
                      : `${backendUrl}${b.image_url}`
                  }
                  className="card-img-top object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) =>
                    (e.target.src = "https://via.placeholder.com/400")
                  }
                />
              </div>
              <div className="card-body">
                <h5 className="card-title font-bold text-truncate">
                  {b.title}
                </h5>
                <p className="text-muted small text-truncate">{b.subtitle}</p>
                <div className="text-end mt-2">
                  <button
                    onClick={() => handleEdit(b)}
                    className="btn btn-sm btn-light text-warning me-2"
                  >
                    <i className="fas fa-pen"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="btn btn-sm btn-light text-danger"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
