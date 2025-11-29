import { useState, useEffect } from "react";
import API from "../api.jsx";

export default function BannerManager() {
  const backendUrl = "http://localhost:5000";
  const token = localStorage.getItem("token");
  const [banners, setBanners] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ imageUrl: "", title: "", subtitle: "" });
  const [editingId, setEditingId] = useState(null);

  const fetchBanners = async () => {
    try {
      const res = await API.get("/admin/banners", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Assuming the API returns image_url as imageUrl in the component's state
      const mappedBanners = Array.isArray(res.data) 
        ? res.data.map(b => ({ ...b, imageUrl: b.image_url || b.imageUrl })) 
        : [];
      setBanners(mappedBanners);
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
      setForm((prev) => ({ ...prev, imageUrl: res.data.url }));
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, image_url: form.imageUrl }; // Map back to snake_case for API
      
      const endpoint = editingId
        ? `/admin/banners/${editingId}`
        : "/admin/banners";
      const method = editingId ? API.put : API.post;
      
      await method(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ imageUrl: "", title: "", subtitle: "" });
      setEditingId(null);
      fetchBanners();
      alert("Success!");
    } catch (err) {
      alert("Failed to save banner!");
    }
  };

  const handleEdit = (b) => {
    setForm({ imageUrl: b.image_url, title: b.title, subtitle: b.subtitle });
    setEditingId(b.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      await API.delete(`/admin/banners/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBanners();
    } catch (err) {
      alert("Delete failed!");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 uppercase text-gray-800 border-b pb-2">
        Banner Management
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* FORM */}
        <div className="lg:col-span-4 bg-white p-6 rounded-lg shadow-lg sticky top-24 border border-gray-200">
          <h3 className="font-bold text-lg mb-4 text-violet-600 border-b pb-2">
            {editingId ? "Edit Banner" : "Add New Banner"}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="font-bold text-sm">Title</label>
              <input
                className="form-control"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="font-bold text-sm">Subtitle</label>
              <input
                className="form-control"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              />
            </div>

            {/* Upload */}
            <div>
              <label className="font-bold text-sm mb-1">Image</label>
              <input
                type="file"
                className="form-control mb-2"
                onChange={handleFileUpload}
                accept="image/*"
              />
              <input
                className="form-control text-sm"
                value={form.imageUrl}
                onChange={(e) =>
                  setForm({ ...form, imageUrl: e.target.value })
                }
                placeholder="Or online link..."
              />
              {uploading && (
                <p className="text-xs text-blue-500">Uploading...</p>
              )}
              {form.imageUrl && (
                <img
                  src={
                    form.imageUrl.startsWith("http")
                      ? form.imageUrl
                      : `${backendUrl}${form.imageUrl}`
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
                {editingId ? "Update" : "Add New"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ imageUrl: "", title: "", subtitle: "" });
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
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