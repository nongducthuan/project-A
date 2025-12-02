import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api.jsx";

export default function ProductDetailManager() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const backendUrl = "http://localhost:5000";

  const [product, setProduct] = useState(null);
  const [colors, setColors] = useState([]);

  // State form for adding color
  const [newColor, setNewColor] = useState({
    color_name: "",
    color_code: "#000000",
    image_url: "",
  });
  const [uploadingColor, setUploadingColor] = useState(false);

  // State form for adding size
  const [selectedColorId, setSelectedColorId] = useState(null);
  const [newSize, setNewSize] = useState({ size: "S", stock: 10 });
  const SIZE_ORDER = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "FreeSize",
    "29",
    "30",
    "31",
    "32",
  ];

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await API.get(`/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProduct(null); // 1. Reset to null to force re-render (Fix non-update issue)
      setTimeout(() => {
        const data = res.data;
        setProduct(data);
        if (data.colors) {
          // Create new array for React to recognize change
          setColors([...data.colors]);
          // If no color is selected but colors exist, select the first one
          if (!selectedColorId && data.colors.length > 0) {
            setSelectedColorId(data.colors[0].id);
          }
        }
      }, 0);
    } catch (err) {
      console.error(err);
    }
  };

  // Upload image for color
  const handleColorFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingColor(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNewColor((prev) => ({ ...prev, image_url: res.data.url }));
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploadingColor(false);
    }
  };

  // Add new color
  const handleAddColor = async () => {
    if (!newColor.color_name) return alert("Enter color name");
    try {
      await API.post(`/admin/products/${id}/colors`, newColor, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewColor({ color_name: "", color_code: "#000000", image_url: "" });
      fetchProduct();
      alert("Color added successfully!");
    } catch (err) {
      alert("Failed to add color");
    }
  };

  // Delete color
  const handleDeleteColor = async (colorId) => {
    if (
      !window.confirm(
        "Deleting this color will delete all associated sizes. Continue?"
      )
    )
      return;
    try {
      await API.delete(`/admin/colors/${colorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProduct();
      if (selectedColorId === colorId) setSelectedColorId(null);
    } catch (err) {
      alert("Failed to delete color");
    }
  };

  // Add size
  const handleAddSize = async () => {
    if (!selectedColorId) return alert("Please select a color first!");

    const stock = Number(newSize.stock);
    const size = newSize.size?.trim();

    if (!size) return alert("Please select a size");
    if (isNaN(stock) || stock < 0) return alert("Invalid stock value");

    try {
      const selectedColor = colors.find((c) => c.id === selectedColorId);
      const existingSize = selectedColor.sizes.find((s) => s.size === size);

      const res = await API.post(
        `/admin/colors/${selectedColorId}/sizes`,
        { size, stock, increment: true }, // Send correct data type
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const returnedId = res.data.id;

      if (existingSize) {
        existingSize.stock += stock;
        setColors([...colors]);
        alert("Stock incremented successfully!");
      } else {
        selectedColor.sizes.push({ id: returnedId, size, stock });
        setColors([...colors]);
        alert("New size added successfully!");
      }

      // Reset form to a valid default
      setNewSize({ size: "S", stock: 0 });
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Failed to add/update size");
    }
  };

  // Delete size
  const handleDeleteSize = async (sizeId) => {
    if (!window.confirm("Delete this size?")) return;
    try {
      await API.delete(`/admin/sizes/${sizeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProduct();
    } catch (err) {
      console.error(err);
    }
  };

  if (!product) return <div className="p-10 text-center">Loading...</div>;

  const selectedColorObj = colors.find((c) => c.id === selectedColorId);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header: Back Button and Product Name */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/admin/products")}
          className="btn btn-outline-secondary"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i> Back
        </button>
        <h2 className="text-2xl font-bold uppercase text-gray-800">
          Inventory Management: <span className="text-blue-600">{product.name}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: COLOR LIST (4/12) */}
        <div className="lg:col-span-4 bg-white p-4 shadow rounded-lg border h-fit">
          <h4 className="font-bold text-lg border-b pb-2 mb-4">
            1. Color List
          </h4>

          {/* List of existing Colors */}
          <div className="space-y-2 mb-6">
            {colors.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedColorId(c.id)}
                className={`p-2 rounded border flex items-center justify-between cursor-pointer transition ${
                  selectedColorId === c.id
                    ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded border bg-gray-100 overflow-hidden">
                    {c.image_url && (
                      <img
                        src={
                          c.image_url.startsWith("http")
                            ? c.image_url
                            : `${backendUrl}${c.image_url}`
                        }
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{c.color_name}</p>
                    <div className="flex items-center gap-1">
                      <span
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: c.color_code }}
                      ></span>
                      <span className="text-xs text-gray-500">
                        {c.color_code}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteColor(c.id);
                  }}
                  className="text-red-400 hover:text-red-600 p-2"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            ))}
            {colors.length === 0 && (
              <p className="text-sm text-gray-400 italic text-center">
                No colors found. Please add a new one.
              </p>
            )}
          </div>

          {/* Add New Color Form */}
          <div className="bg-gray-50 p-3 rounded border">
            <h5 className="font-bold text-sm mb-2 text-gray-700">
              + Add New Color
            </h5>
            <input
              className="form-control mb-2 text-sm"
              placeholder="Color Name (e.g., White)"
              value={newColor.color_name}
              onChange={(e) =>
                setNewColor({ ...newColor, color_name: e.target.value })
              }
            />
            <div className="flex items-center gap-2 mb-2">
              <input
                type="color"
                className="form-control form-control-color"
                value={newColor.color_code}
                onChange={(e) =>
                  setNewColor({ ...newColor, color_code: e.target.value })
                }
                title="Select color code"
              />
              <span className="text-xs text-gray-500">Color Code</span>
            </div>
            <input
              type="file"
              className="form-control mb-2 text-xs"
              onChange={handleColorFileUpload}
            />
            <input
              className="form-control mb-2 text-xs"
              placeholder="Image link (if any)..."
              value={newColor.image_url}
              onChange={(e) =>
                setNewColor({ ...newColor, image_url: e.target.value })
              }
            />
            {uploadingColor && (
              <p className="text-xs text-blue-500 mb-2">Uploading image...</p>
            )}
            <button
              onClick={handleAddColor}
              className="btn btn-dark btn-sm w-full"
            >
              Add Color
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: SIZE MANAGEMENT (8/12) */}
        <div className="lg:col-span-8 bg-white p-6 shadow rounded-lg border min-h-[500px]">
          <h4 className="font-bold text-lg border-b pb-2 mb-4">
            2. Manage Size & Stock
          </h4>

          {selectedColorObj ? (
            <>
              <div className="flex items-center gap-4 mb-6 bg-blue-50 p-4 rounded border border-blue-100">
                <img
                  src={
                    selectedColorObj.image_url?.startsWith("http")
                      ? selectedColorObj.image_url
                      : `${backendUrl}${selectedColorObj.image_url}`
                  }
                  className="w-20 h-20 object-cover rounded bg-white border"
                  onError={(e) =>
                    (e.target.src =
                      "http://localhost:5000/public/placeholder.jpg")
                  }
                />
                <div>
                  <h5 className="font-bold text-xl text-blue-800">
                    Selected Color: {selectedColorObj.color_name}
                  </h5>
                  <p className="text-sm text-gray-600">
                    Manage inventory stock quantity for each size of this color.
                  </p>
                </div>
              </div>

              {/* Size Table */}
              <div className="mb-6">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Size</th>
                      <th>Current Stock</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedColorObj.sizes &&
                    selectedColorObj.sizes.length > 0 ? (
                      [...selectedColorObj.sizes]
                        .sort(
                          (a, b) =>
                            SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size)
                        )
                        .map((s) => (
                          <tr key={s.id}>
                            <td>
                              <span className="badge bg-secondary text-lg">
                                {s.size}
                              </span>
                            </td>
                            <td className="font-bold text-success text-lg">
                              {s.stock}
                            </td>
                            <td className="text-end">
                              <button
                                onClick={() => handleDeleteSize(s.id)}
                                className="btn btn-outline-danger btn-sm"
                              >
                                <i className="fa-solid fa-trash"></i> Delete
                              </button>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center text-gray-400 py-4">
                          No sizes available for this color.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add New Size Form */}
              <div className="bg-gray-50 p-4 rounded border max-w-md">
                <h5 className="font-bold text-sm mb-3">Add New Size</h5>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-bold mb-1 block">Size</label>
                    <select
                      className="form-select"
                      value={newSize.size}
                      onChange={(e) =>
                        setNewSize({ ...newSize, size: e.target.value })
                      }
                    >
                      {[
                        "XS",
                        "S",
                        "M",
                        "L",
                        "XL",
                        "XXL",
                        "FreeSize",
                        "29",
                        "30",
                        "31",
                        "32",
                      ].map((sz) => (
                        <option key={sz} value={sz}>
                          {sz}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold mb-1 block">
                      Quantity
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={newSize.stock}
                      onChange={(e) =>
                        setNewSize({ ...newSize, stock: +e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleAddSize}
                      className="btn btn-success font-bold"
                    >
                      <i className="fa-solid fa-plus"></i> Add
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <i className="fa-solid fa-arrow-left fa-3x mb-4 opacity-30"></i>
              <p className="text-lg">
                Please select a <strong>Color</strong> from the left column to manage Sizes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}