import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api.jsx";

export default function AdminProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const backendUrl = "http://localhost:5000";

  const [product, setProduct] = useState(null);
  const [colors, setColors] = useState([]);

  // State form thêm màu
  const [newColor, setNewColor] = useState({
    color_name: "",
    color_code: "#000000",
    image_url: "",
  });
  const [uploadingColor, setUploadingColor] = useState(false);

  // State form thêm size
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
      setProduct(null); // 1. Reset về null để ép render lại (Fix lỗi không update)
      setTimeout(() => {
        const data = res.data;
        setProduct(data);
        if (data.colors) {
          // Tạo mảng mới để React nhận biết thay đổi
          setColors([...data.colors]);
          // Nếu đang chọn màu mà màu đó vừa bị xóa hoặc cập nhật, reset selection
          if (!selectedColorId && data.colors.length > 0) {
            setSelectedColorId(data.colors[0].id);
          }
        }
      }, 0);
    } catch (err) {
      console.error(err);
    }
  };

  // Upload ảnh cho màu
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
      alert("Lỗi upload");
    } finally {
      setUploadingColor(false);
    }
  };

  // Thêm màu mới
  const handleAddColor = async () => {
    if (!newColor.color_name) return alert("Nhập tên màu");
    try {
      const res = await API.post(`/admin/products/${id}/colors`, newColor, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewColor({ color_name: "", color_code: "#000000", image_url: "" });
      fetchProduct();
      alert("Đã thêm màu!");
    } catch (err) {
      alert("Lỗi thêm màu");
    }
  };

  // Xóa màu
  const handleDeleteColor = async (colorId) => {
    if (!window.confirm("Xóa màu này sẽ xóa hết các size trong đó. Tiếp tục?"))
      return;
    try {
      await API.delete(`/admin/colors/${colorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProduct();
      if (selectedColorId === colorId) setSelectedColorId(null);
    } catch (err) {
      alert("Lỗi xóa màu");
    }
  };

  // Thêm size
  const handleAddSize = async () => {
    if (!selectedColorId) return alert("Vui lòng chọn một màu trước!");

    const stock = Number(newSize.stock);
    const size = newSize.size?.trim();

    if (!size) return alert("Vui lòng chọn size");
    if (isNaN(stock) || stock < 0) return alert("Stock không hợp lệ");

    try {
      const selectedColor = colors.find(c => c.id === selectedColorId);
      const existingSize = selectedColor.sizes.find(s => s.size === size);

      const res = await API.post(
        `/admin/colors/${selectedColorId}/sizes`,
        { size, stock, increment: true }, // gửi đúng kiểu dữ liệu
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const returnedId = res.data.id;

      if (existingSize) {
        existingSize.stock += stock;
        setColors([...colors]);
        alert("Đã cộng dồn stock size!");
      } else {
        selectedColor.sizes.push({ id: returnedId, size, stock });
        setColors([...colors]);
        alert("Đã thêm size mới!");
      }

      // Reset form về mặc định hợp lệ
      setNewSize({ size: "S", stock: 0 });
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Lỗi khi thêm/cập nhật size");
    }
  };

  // Xóa size
  const handleDeleteSize = async (sizeId) => {
    if (!window.confirm("Xóa size này?")) return;
    try {
      await API.delete(`/admin/sizes/${sizeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProduct();
    } catch (err) {
      console.error(err);
    }
  };

  if (!product) return <div className="p-10 text-center">Đang tải...</div>;

  const selectedColorObj = colors.find((c) => c.id === selectedColorId);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header: Nút quay lại và Tên SP */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/admin/products")}
          className="btn btn-outline-secondary"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i> Quay lại
        </button>
        <h2 className="text-2xl font-bold uppercase text-gray-800">
          Quản lý kho: <span className="text-blue-600">{product.name}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CỘT TRÁI: DANH SÁCH MÀU (3/12) */}
        <div className="lg:col-span-4 bg-white p-4 shadow rounded-lg border h-fit">
          <h4 className="font-bold text-lg border-b pb-2 mb-4">
            1. Danh sách Màu
          </h4>

          {/* List Màu hiện có */}
          <div className="space-y-2 mb-6">
            {colors.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedColorId(c.id)}
                className={`p-2 rounded border flex items-center justify-between cursor-pointer transition ${selectedColorId === c.id
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
                Chưa có màu nào. Hãy thêm mới.
              </p>
            )}
          </div>

          {/* Form Thêm Màu */}
          <div className="bg-gray-50 p-3 rounded border">
            <h5 className="font-bold text-sm mb-2 text-gray-700">
              + Thêm Màu Mới
            </h5>
            <input
              className="form-control mb-2 text-sm"
              placeholder="Tên màu (VD: Trắng)"
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
                title="Chọn mã màu"
              />
              <span className="text-xs text-gray-500">Mã màu</span>
            </div>
            <input
              type="file"
              className="form-control mb-2 text-xs"
              onChange={handleColorFileUpload}
            />
            <input
              className="form-control mb-2 text-xs"
              placeholder="Link ảnh (nếu có)..."
              value={newColor.image_url}
              onChange={(e) =>
                setNewColor({ ...newColor, image_url: e.target.value })
              }
            />
            {uploadingColor && (
              <p className="text-xs text-blue-500 mb-2">Đang tải ảnh...</p>
            )}
            <button
              onClick={handleAddColor}
              className="btn btn-dark btn-sm w-full"
            >
              Thêm Màu
            </button>
          </div>
        </div>

        {/* CỘT PHẢI: QUẢN LÝ SIZE (9/12) */}
        <div className="lg:col-span-8 bg-white p-6 shadow rounded-lg border min-h-[500px]">
          <h4 className="font-bold text-lg border-b pb-2 mb-4">
            2. Quản lý Size & Tồn kho
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
                    Màu đang chọn: {selectedColorObj.color_name}
                  </h5>
                  <p className="text-sm text-gray-600">
                    Quản lý số lượng tồn kho cho từng size của màu này.
                  </p>
                </div>
              </div>

              {/* Bảng Size */}
              <div className="mb-6">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Size</th>
                      <th>Tồn kho hiện tại</th>
                      <th className="text-end">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedColorObj.sizes && selectedColorObj.sizes.length > 0 ? (
                      [...selectedColorObj.sizes]
                        .sort(
                          (a, b) =>
                            SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size)
                        )
                        .map((s) => (
                          <tr key={s.id}>
                            <td>
                              <span className="badge bg-secondary text-lg">{s.size}</span>
                            </td>
                            <td className="font-bold text-success text-lg">{s.stock}</td>
                            <td className="text-end">
                              <button
                                onClick={() => handleDeleteSize(s.id)}
                                className="btn btn-outline-danger btn-sm"
                              >
                                <i className="fa-solid fa-trash"></i> Xóa
                              </button>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center text-gray-400 py-4">
                          Chưa có size nào cho màu này.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Form Thêm Size */}
              <div className="bg-gray-50 p-4 rounded border max-w-md">
                <h5 className="font-bold text-sm mb-3">Thêm Size Mới</h5>
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
                      Số lượng
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
                      <i className="fa-solid fa-plus"></i> Thêm
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <i className="fa-solid fa-arrow-left fa-3x mb-4 opacity-30"></i>
              <p className="text-lg">
                Vui lòng chọn một <strong>Màu</strong> ở cột bên trái để quản lý
                Size.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
