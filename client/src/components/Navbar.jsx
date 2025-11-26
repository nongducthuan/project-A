import { NavLink, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import API from "../api";

export default function Navbar() {
  const { user, setUser } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const [repImages, setRepImages] = useState({});
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [hoveredGender, setHoveredGender] = useState(null);
  const [genderTimeout, setGenderTimeout] = useState(null);
  const [userTimeout, setUserTimeout] = useState(null);

  // Các ID danh mục cần lấy ảnh (dựa trên MENU_CONFIG bên dưới)
  const CATEGORY_IDS = [1, 2, 3, 4, 5];

  const MENU_CONFIG = {
    male: {
      title: "NAM",
      items: [
        { name: "Áo Sơ Mi", link: "/category/1?gender=male", repId: 1 },
        { name: "Áo Khoác/Hoodie", link: "/category/4?gender=male", repId: 4 },
        { name: "Quần Dài", link: "/category/2?gender=male", repId: 2 },
      ],
    },
    female: {
      title: "NỮ",
      items: [
        { name: "Áo Sơ Mi", link: "/category/1?gender=female", repId: 1 },
        { name: "Áo Thun", link: "/category/3?gender=female", repId: 3 },
        { name: "Quần Dài", link: "/category/2?gender=female", repId: 2 },
      ],
    },
    unisex: {
      title: "UNISEX",
      items: [
        { name: "Áo Thun", link: "/category/3?gender=unisex", repId: 3 },
        { name: "Quần Dài", link: "/category/2?gender=unisex", repId: 2 },
        { name: "Quần Short", link: "/category/5?gender=unisex", repId: 5 },
      ],
    },
  };

  const maleProducts = [
    { name: "Áo sơ mi", category_id: 1, image: "/public/images/ao-so-mi-nam-white.png" },
    { name: "Áo khoác", category_id: 4, image: "/public/images/ao-khoac-nam-black.png" },
    { name: "Quần dài", category_id: 2, image: "/public/images/quan-dai-nam-beige.png" },
  ];

  // 👉 SỬA ĐỔI QUAN TRỌNG: Lấy 1 sản phẩm từ mỗi danh mục để làm ảnh đại diện
  useEffect(() => {
    const fetchRepImages = async () => {
      const imgMap = {};

      // Lấy tất cả gender
      const genders = Object.keys(MENU_CONFIG);

      // Chạy song song theo gender + repId
      await Promise.all(
        genders.map(async (gender) => {
          await Promise.all(
            MENU_CONFIG[gender].items.map(async (item) => {
              try {
                const res = await API.get("/products", {
                  params: { category_id: item.repId, limit: 1, gender },
                });

                const data = res.data;
                const products = Array.isArray(data)
                  ? data
                  : data.data || data.products || [];

                if (products.length > 0 && products[0].image_url) {
                  // Lưu ảnh theo key gender-repId
                  imgMap[`${gender}-${item.repId}`] = products[0].image_url;
                }
              } catch (err) {
                console.error(`Lỗi lấy ảnh cho category ${item.repId}`, err);
              }
            })
          );
        })
      );

      setRepImages(imgMap);
    };

    fetchRepImages();
  }, []);


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const handleGenderEnter = (gender) => {
    if (genderTimeout) clearTimeout(genderTimeout);
    setHoveredGender(gender);
  };

  const handleGenderLeave = () => {
    const timeout = setTimeout(() => setHoveredGender(null), 100);
    setGenderTimeout(timeout);
  };

  const handleUserEnter = () => {
    if (userTimeout) clearTimeout(userTimeout);
    setUserMenuOpen(true);
  };

  const handleUserLeave = () => {
    const timeout = setTimeout(() => setUserMenuOpen(false), 200);
    setUserTimeout(timeout);
  };

  const getImgUrl = (path) => {
    if (!path) return "http://localhost:5000/public/placeholder.jpg";
    return path.startsWith("http") ? path : `http://localhost:5000${path}`;
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50 h-16">
      <div className="container mx-auto px-4 h-full flex justify-between items-center">
        <NavLink
          to="/"
          className="text-2xl font-bold text-violet-600 tracking-wider"
        >
          CLOTHING SHOP
        </NavLink>

        {/* MENU CHÍNH */}
        <div className="hidden md:flex gap-8 h-full items-center">
          {Object.keys(MENU_CONFIG).map((key) => (
            <div
              key={key}
              className="relative h-full flex items-center group"
              onMouseEnter={() => handleGenderEnter(key)}
              onMouseLeave={handleGenderLeave}
            >
              <span
                className={`cursor-pointer font-medium uppercase transition ${hoveredGender === key
                  ? "text-violet-600 border-b-2 border-violet-600"
                  : "text-gray-700"
                  }`}
              >
                {MENU_CONFIG[key].title}
              </span>

              {hoveredGender === key && (
                <div
                  className="absolute top-full left-0 bg-white shadow-xl rounded-b-lg p-6 border-t border-gray-100 animate-fadeIn"
                  style={{ width: "600px", left: "-100px" }}
                >
                  <div className="grid grid-cols-3 gap-4">
                    {MENU_CONFIG[key].items.map((item, index) => (
                      <div
                        key={index}
                        className="group/item cursor-pointer flex flex-col items-center gap-2 p-2 hover:bg-gray-50 rounded transition"
                        onClick={() => {
                          setHoveredGender(null);
                          navigate(item.link);
                        }}
                      >
                        {/* Hiển thị ảnh lấy từ repImages */}
                        <div className="w-full h-24 overflow-hidden rounded border group-hover/item:border-violet-400">
                          <img
                            src={repImages[`${key}-${item.repId}`] ? getImgUrl(repImages[`${key}-${item.repId}`]) : "/public/placeholder.jpg"}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-700 group-hover/item:text-violet-700 text-center">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ICONS */}
        <div className="flex items-center gap-5">
          <i
            className="fa-solid fa-magnifying-glass text-gray-700 hover:text-violet-600 cursor-pointer text-lg"
            onClick={() => navigate("/search")}
          ></i>
          <div
            className="relative cursor-pointer"
            onClick={() => navigate("/cart")}
          >
            <i className="fa-solid fa-cart-shopping text-gray-700 hover:text-violet-600 text-lg"></i>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {cart.length}
              </span>
            )}
          </div>
          <div
            className="relative h-full flex items-center px-2 cursor-pointer"
            onMouseEnter={handleUserEnter}
            onMouseLeave={handleUserLeave}
          >
            <i
              className={`fa-solid fa-user text-lg transition ${user ? "text-violet-600" : "text-gray-700 hover:text-violet-600"
                }`}
            ></i>
            {userMenuOpen && (
              <div
                className="absolute top-10 right-0 bg-white rounded-lg shadow-md py-2 w-48 border border-gray-100 z-50 mt-2"
                onMouseEnter={handleUserEnter}
                onMouseLeave={handleUserLeave}
              >
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b mb-1">
                      <p className="font-bold text-gray-800 truncate">
                        {user.name}
                      </p>
                    </div>
                    {user.role === "admin" && (
                      <div
                        className="px-4 py-2 hover:bg-violet-50 text-violet-700 cursor-pointer font-semibold"
                        onClick={() => navigate("/admin")}
                      >
                        Trang Admin
                      </div>
                    )}
                    <div
                      className="px-4 py-2 hover:bg-violet-50 cursor-pointer"
                      onClick={() => navigate("/profile")}
                    >
                      Thông tin
                    </div>
                    <div
                      className="px-4 py-2 hover:bg-red-50 text-red-600 cursor-pointer"
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className="px-4 py-2 hover:bg-violet-50 cursor-pointer"
                      onClick={() => navigate("/login")}
                    >
                      Đăng nhập
                    </div>
                    <div
                      className="px-4 py-2 hover:bg-violet-50 cursor-pointer"
                      onClick={() => navigate("/register")}
                    >
                      Đăng ký
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
