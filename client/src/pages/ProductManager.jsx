import { useState, useEffect, useMemo, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Listbox, Transition } from "@headlessui/react";
import { FaChevronDown, FaImage, FaPen, FaTrash } from "react-icons/fa6";

// --- INTERNAL COMPONENTS (To ensure stability) ---

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "error" ? "bg-red-500" : "bg-green-500";
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-6 py-4 rounded shadow-lg text-white animate-slideIn ${bgColor}`}>
      <span className="font-bold">{message}</span>
      <button onClick={onClose} className="ml-4 hover:opacity-75">x</button>
    </div>
  );
};

const BACKEND_URL = "http://localhost:5000";
const API = {
  get: async (endpoint, options = {}) => {
    const res = await fetch(`${BACKEND_URL}${endpoint}`, { ...options, method: "GET", headers: { "Content-Type": "application/json", ...options.headers } });
    if (!res.ok) throw new Error("API Error");
    return { data: await res.json() };
  },
  post: async (endpoint, body, options = {}) => {
    const isFormData = body instanceof FormData;
    const headers = { ...options.headers };
    if (!isFormData) headers["Content-Type"] = "application/json";
    
    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      ...options,
      method: "POST",
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });
    if (!res.ok) throw new Error("API Error");
    return { data: await res.json() };
  },
  put: async (endpoint, body, options = {}) => {
    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      ...options,
      method: "PUT",
      headers: { "Content-Type": "application/json", ...options.headers },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("API Error");
    return { data: await res.json() };
  },
  delete: async (endpoint, options = {}) => {
    const res = await fetch(`${BACKEND_URL}${endpoint}`, { ...options, method: "DELETE", headers: { ...options.headers } });
    if (!res.ok) throw new Error("API Error");
    return { data: await res.json() };
  }
};

// --- MAIN COMPONENT ---

export default function ProductManager() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // STATE
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const [filterGender, setFilterGender] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    gender: "unisex",
    category_id: "",
  });

  const showToast = (message, type = "success") => setToast({ message, type });

  // FETCH DATA
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setFilterCategory("all");
  }, [filterGender]);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        API.get("/admin/products", { headers: { Authorization: `Bearer ${token}` } }),
        API.get("/categories"),
      ]);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
      setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data?.data || []);
    } catch (err) {
      console.error("Error loading data:", err);
      showToast("Failed to load data", "error");
    }
  };

  // UPLOAD IMAGE
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await API.post("/upload", formData);
      setForm((prev) => ({ ...prev, image_url: res.data.url }));
      showToast("Image uploaded successfully");
    } catch {
      showToast("Image upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  // FILTER + SORT
  const sortGenderOrder = (list) => {
    const order = { male: 1, female: 2, unisex: 3 };
    return [...list].sort((a, b) => order[a.gender] - order[b.gender]);
  };

  const filteredProducts = useMemo(() => {
    const sorted = sortGenderOrder(products);
    return sorted.filter((p) => {
      const matchGender = filterGender === "all" || p.gender === filterGender;
      const matchCategory = filterCategory === "all" || String(p.category_id) === String(filterCategory);
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchGender && matchCategory && matchSearch;
    });
  }, [products, filterGender, filterCategory, searchTerm]);

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = form.name.trim();
    if (!cleanName || !form.price || !form.category_id) return showToast("Please fill all required fields", "error");

    const selectedCategory = categories.find((c) => String(c.id) === String(form.category_id));
    if (selectedCategory && selectedCategory.gender !== form.gender) {
      return showToast("Product gender must match category gender!", "error");
    }

    const payload = { ...form, name: cleanName, description: form.description.trim() };

    try {
      const endpoint = editingId ? `/admin/products/${editingId}` : "/admin/products";
      const method = editingId ? API.put : API.post;
      await method(endpoint, payload, { headers: { Authorization: `Bearer ${token}` } });

      showToast(editingId ? "Product updated!" : "Product created!");
      setEditingId(null);
      setForm({ name: "", description: "", price: "", image_url: "", gender: "unisex", category_id: "" });
      window.dispatchEvent(new Event("categories-updated"));
      await fetchData();
    } catch (err) {
      showToast("Failed to save product", "error");
    }
  };

  // ACTIONS
  const handleEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price,
      image_url: p.image_url || "",
      gender: p.gender,
      category_id: p.category_id,
    });
    setEditingId(p.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await API.delete(`/admin/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setProducts(products.filter((p) => p.id !== id));
      showToast("Product deleted");
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  return (
    <div className="container mx-auto p-4 mb-20">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4 gap-4">
        <h2 className="text-2xl font-bold uppercase text-gray-800">Product Management</h2>
        <button
          onClick={() => navigate("/admin/categories")}
          className="w-full md:w-auto px-6 py-2 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition shadow-sm"
        >
          Manage Categories
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: FORM */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow border border-gray-100 sticky top-4">
          <h3 className="font-bold text-lg mb-4 text-violet-600 border-b pb-2">
            {editingId ? "Edit Product" : "Create New Product"}
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
              <input
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Cotton T-Shirt..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: +e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Gender</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="unisex">Unisex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                <option value="">-- Select Category --</option>
                {categories
                  .filter((c) => c.gender === form.gender)
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Main Image</label>
              <input type="file" className="block w-full text-sm text-gray-500 mb-2" onChange={handleFileUpload} />
              <input
                className="w-full px-3 py-2 border rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="Or image URL..."
              />
              {uploading && <p className="text-blue-500 text-xs">Uploading...</p>}
              {form.image_url && (
                <div className="mt-2 border rounded p-1 bg-gray-50">
                  <img
                    src={form.image_url.startsWith("http") ? form.image_url : `${BACKEND_URL}${form.image_url}`}
                    className="w-full h-40 object-cover rounded"
                    alt="Preview"
                    onError={(e) => e.target.src = "http://localhost:5000/public/placeholder.jpg"}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                rows="3"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className={`flex-1 py-2 px-4 rounded-lg font-bold text-white transition ${
                  editingId ? "bg-yellow-500 hover:bg-yellow-600" : "bg-violet-600 hover:bg-violet-700"
                }`}
              >
                {editingId ? "Update Product" : "Create Product"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ name: "", description: "", price: "", image_url: "", gender: "unisex", category_id: "" });
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: LIST */}
        <div className="lg:col-span-8">
          
          {/* FILTER BAR */}
          <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center border border-gray-100">
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              {["all", "male", "female", "unisex"].map((g) => (
                <button
                  key={g}
                  onClick={() => setFilterGender(g)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                    filterGender === g ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {g === "all" ? "All" : g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* CATEGORY DROPDOWN */}
              <div className="relative w-full sm:w-48 z-20">
                <Listbox value={filterCategory} onChange={setFilterCategory}>
                  <div className="relative">
                    <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 sm:text-sm shadow-sm">
                      <span className="block truncate">
                        {filterCategory === "all"
                          ? "All Categories"
                          : categories.find((c) => String(c.id) === String(filterCategory))?.name || "Select"}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <FaChevronDown className="h-3 w-3 text-gray-400" aria-hidden="true" />
                      </span>
                    </Listbox.Button>
                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                      <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-30">
                        <Listbox.Option value="all" className={({ active }) => `relative cursor-default select-none py-2 pl-4 pr-4 ${active ? 'bg-violet-100 text-violet-900' : 'text-gray-900'}`}>
                          All Categories
                        </Listbox.Option>
                        {(filterGender === "all" ? categories : categories.filter((c) => c.gender === filterGender)).map((c) => (
                          <Listbox.Option key={c.id} value={c.id} className={({ active }) => `relative cursor-default select-none py-2 pl-4 pr-4 ${active ? 'bg-violet-100 text-violet-900' : 'text-gray-900'}`}>
                            {c.name}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>

              {/* SEARCH */}
              <input
                className="w-full sm:w-48 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* PRODUCT GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition cursor-pointer group" onClick={() => navigate(`/admin/products/${p.id}`)}>
                {/* Image */}
                <div className="relative h-48 bg-gray-50 overflow-hidden">
                  {p.image_url ? (
                    <img
                      src={p.image_url.startsWith("http") ? p.image_url : `${BACKEND_URL}${p.image_url}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      alt={p.name}
                      onError={(e) => e.target.src = "http://localhost:5000/public/placeholder.jpg"}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300">
                      <FaImage className="text-4xl" />
                    </div>
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold text-white rounded uppercase shadow-sm ${
                    p.gender === "male" ? "bg-blue-500" : p.gender === "female" ? "bg-pink-500" : "bg-green-500"
                  }`}>
                    {p.gender}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1 truncate">{p.category_name}</div>
                  <h4 className="font-bold text-gray-800 text-lg truncate mb-2" title={p.name}>{p.name}</h4>
                  
                  <div className="flex justify-between items-center border-t pt-3 mt-1">
                    <span className="text-red-600 font-bold">{Number(p.price).toLocaleString()}đ</span>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(p); }}
                        className="p-2 bg-gray-100 text-yellow-600 rounded-full hover:bg-yellow-100 transition"
                        title="Edit Info"
                      >
                        <FaPen size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                        className="p-2 bg-gray-100 text-red-600 rounded-full hover:bg-red-100 transition"
                        title="Delete"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-center text-gray-400 bg-gray-50 py-1 rounded">
                    Total Stock: <strong className="text-gray-700">{p.total_stock || 0}</strong> • Click to manage sizes
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed">
              No products found matching your criteria.
            </div>
          )}

        </div>
      </div>
    </div>
  );
}