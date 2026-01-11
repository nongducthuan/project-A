import { useEffect, useState } from "react";
import API from "../api";

export default function CategoryManager() {
  /* ============================================================
   * 1) STATE
   * ============================================================ */
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filterGender, setFilterGender] = useState("male");

  const [categoryImages, setCategoryImages] = useState([]);
  const [recommendNames, setRecommendNames] = useState([]);

  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };
  const backendUrl = "http://localhost:5000"; // Assuming backend URL

  const [form, setForm] = useState({
    name: "",
    gender: "",
    image_url: "",
  });

  /* ============================================================
   * 2) FETCH CATEGORIES
   * ============================================================ */
  async function fetchCategories() {
    try {
      const res = await API.get("/categories/with-preview");
      let list = Array.isArray(res.data) ? res.data : res.data.data;

      // Sort by gender: male → female → unisex
      const order = { male: 1, female: 2, unisex: 3 };
      list = [...list].sort((a, b) => order[a.gender] - order[b.gender]);

      setCategories(list || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ============================================================
   * 3) FORM HANDLERS
   * ============================================================ */
  async function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // When changing gender → load category suggestions
    if (name === "gender" && value) {
      try {
        const res = await API.get(`/categories/recommend?gender=${value}`);
        setRecommendNames(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch recommended names:", error);
        setRecommendNames([]);
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await API.put(`/categories/${editingId}`, form, auth);
      } else {
        await API.post("/categories", form, auth);
      }

      resetForm();
      await fetchCategories();
      // Dispatch a custom event for other components to listen
      window.dispatchEvent(new Event("categories-updated"));
      alert(`Category ${editingId ? "updated" : "added"} successfully!`);
    } catch (err) {
      console.error("Error saving category:", err);
      alert(
        `Failed to save category. Error: ${
          err.response?.data?.message || err.message
        }`
      );
    }

    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setForm({ name: "", gender: "", image_url: "" });
    setCategoryImages([]);
    setRecommendNames([]);
  }

  /* ============================================================
   * 4) EDIT + DELETE
   * ============================================================ */
  async function handleEdit(cat) {
    setEditingId(cat.id);

    setForm({
      name: cat.name,
      gender: cat.gender,
      image_url: cat.image_url || "",
    });

    // Load related product images
    try {
      const res = await API.get(`/categories/${cat.id}/images`);
      setCategoryImages(res.data.data || []);

      // Load suggestions
      const res2 = await API.get(`/categories/recommend?gender=${cat.gender}`);
      setRecommendNames(res2.data.data || []);
    } catch (error) {
      console.error("Failed to load edit data:", error);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    try {
      await API.delete(`/categories/${id}`, auth);
      await fetchCategories();
      alert("Category deleted successfully!");
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Cannot delete category containing products.");
    }
  }

  /* ============================================================
   * 5) UI HELPERS
   * ============================================================ */
  const genderLabel = (g) =>
    g === "male" ? "Male" : g === "female" ? "Female" : "Unisex";

  const genderTabs = [
    { key: "male", label: "Male" },
    { key: "female", label: "Female" },
    { key: "unisex", label: "Unisex" },
  ];

  /* ============================================================
   * 6) RENDER UI
   * ============================================================ */
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          CATEGORY MANAGEMENT
        </h1>
        <button
          onClick={() => (window.location.href = "/admin/products")}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700"
        >
          Manage Products
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ================= LEFT SIDE FORM ================= */}
        <div className="bg-white shadow-xl rounded-xl border p-6 h-fit sticky top-20">
          <h3 className="text-xl font-bold mb-4 text-gray-700">
            {editingId ? "Edit Category" : "Add New Category"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* CATEGORY NAME */}
            <div>
              <label className="block font-medium mb-1">Category Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
                placeholder="E.g., T-Shirts"
              />

              {/* CATEGORY SUGGESTIONS */}
              {recommendNames.length > 0 && (
                <div className="mt-2 p-3 border rounded-lg bg-violet-50">
                  <p className="font-semibold text-sm text-violet-700 mb-2">
                    Suggested Categories not yet added:
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {recommendNames.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setForm({ ...form, name: item.name })}
                        className="px-3 py-1 bg-white border rounded-lg shadow-sm hover:bg-violet-100 text-sm"
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* GENDER */}
            <div>
              <label className="block font-medium mb-1">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
              >
                <option value="">-- Select --</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>

            {/* COVER IMAGE */}
            <div>
              <label className="block font-medium mb-1">Cover Image</label>

              {editingId && categoryImages.length > 0 ? (
                <div className="grid grid-cols-4 gap-2 bg-gray-50 p-2 rounded border">
                  {categoryImages.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() =>
                        setForm({ ...form, image_url: img.image_url })
                      }
                      className={`border rounded cursor-pointer overflow-hidden ${
                        form.image_url === img.image_url
                          ? "ring-2 ring-violet-600"
                          : "opacity-80 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={
                          img.image_url.startsWith("http")
                            ? img.image_url
                            : `${backendUrl}${img.image_url}` // Use defined backendUrl
                        }
                        className="w-full h-20 object-cover"
                        alt={`Product image ${idx}`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic text-sm">
                  Select a category to display related product images here.
                </p>
              )}

              {form.image_url && (
                <p className="text-green-600 text-xs mt-1 truncate">
                  Selected Image: {form.image_url}
                </p>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className={`text-white px-5 py-2 rounded-lg font-semibold transition ${
                  loading
                    ? "bg-violet-400 cursor-not-allowed"
                    : "bg-violet-600 hover:bg-violet-700"
                }`}
              >
                {editingId ? "Update" : "Add New"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ================= RIGHT SIDE CATEGORY TABLE ================= */}
        <div>
          {/* GENDER TABS */}
          <div className="flex gap-4 mb-6">
            {genderTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setFilterGender(t.key)}
                className={`px-4 py-2 rounded-lg font-semibold border transition ${
                  filterGender === t.key
                    ? "bg-violet-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* TABLE */}
          <div className="bg-white shadow-lg rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border w-28 text-left">Image</th>
                  <th className="p-3 border text-left">Name</th>
                  <th className="p-3 border w-28 text-left">Gender</th>
                  <th className="p-3 border w-40 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {categories
                  .filter((cat) => cat.gender === filterGender)
                  .map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50">
                      <td className="p-3 border">
                        {(() => {
                          const imageSrc = cat.image_url || cat.preview_image;

                          return imageSrc ? (
                            <img
                              src={
                                imageSrc.startsWith("http")
                                  ? imageSrc
                                  : `${backendUrl}${imageSrc}`
                              }
                              className="w-14 h-14 object-cover rounded"
                              alt={cat.name}
                            />
                          ) : (
                            <span className="text-gray-400 italic text-sm">
                              N/A
                            </span>
                          );
                        })()}
                      </td>

                      <td className="p-3 border font-medium">{cat.name}</td>
                      <td className="p-3 border text-sm text-gray-600">
                        {genderLabel(cat.gender)}
                      </td>

                      <td className="p-3 border text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="w-9 h-9 flex items-center justify-center
                                       bg-blue-100 text-blue-600 rounded-full
                                       hover:bg-blue-200 transition"
                            title="Edit"
                          >
                            <i className="fa-solid fa-pen text-sm"></i>
                          </button>

                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="w-9 h-9 flex items-center justify-center
                                       bg-red-100 text-red-600 rounded-full
                                       hover:bg-red-200 transition"
                            title="Delete"
                          >
                            <i className="fa-solid fa-trash text-sm"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {categories.filter((x) => x.gender === filterGender).length ===
                  0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-4 text-center text-gray-500 italic"
                    >
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
