import { NavLink, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import API from "../api";

export default function Navbar() {
  const { user, setUser } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const [menu, setMenu] = useState({
    male: [],
    female: [],
    unisex: [],
  });

  const [hoveredGender, setHoveredGender] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // --- STATE CHO MOBILE MENU ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedGender, setMobileExpandedGender] = useState(null);
  const menuCloseTimer = useRef(null);
  const userCloseTimer = useRef(null);

  const toggleMobileGender = (gender) => {
    if (mobileExpandedGender === gender) {
      setMobileExpandedGender(null); // Đang mở thì đóng lại
    } else {
      setMobileExpandedGender(gender); // Mở cái mới
    }
  };

  useEffect(() => {
    loadCategoryMenu();
  }, []);

  useEffect(() => {
    const refresh = () => loadCategoryMenu();
    window.addEventListener("categories-updated", refresh);
    return () => window.removeEventListener("categories-updated", refresh);
  }, []);

  async function loadCategoryMenu() {
    try {
      const res = await API.get("/categories/with-preview");
      const list = res.data.data || [];
      const grouped = { male: [], female: [], unisex: [] };
      list.forEach((c) => {
        if (grouped[c.gender]) grouped[c.gender].push(c);
      });
      setMenu(grouped);
    } catch (err) {
      console.error("Lỗi load menu:", err);
    }
  }

  const getImgUrl = (path) =>
    path?.startsWith("http")
      ? path
      : `http://localhost:5000${path || "/public/placeholder.jpg"}`;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
    setIsMobileMenuOpen(false); // Đóng menu mobile nếu đang mở
  };

  // --- DESKTOP HOVER LOGIC ---
  const openGenderMenu = (g) => {
    if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current);
    setHoveredGender(g);
  };

  const closeGenderMenu = () => {
    menuCloseTimer.current = setTimeout(() => setHoveredGender(null), 200);
  };

  const handleMouseEnterUser = () => {
    if (userCloseTimer.current) clearTimeout(userCloseTimer.current);
    setUserMenuOpen(true);
  };

  const handleMouseLeaveUser = () => {
    userCloseTimer.current = setTimeout(() => setUserMenuOpen(false), 200);
  };

  return (
    <>
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50 h-16">
        <div className="container mx-auto px-4 flex justify-between items-center h-full">
          {/* 1. LOGO */}
          <div className="flex-shrink-0">
            <NavLink
              to="/"
              className="font-bold text-violet-600
               text-lg sm:text-xl md:text-2xl
               whitespace-nowrap"
            >
              CLOTHING SHOP
            </NavLink>
          </div>

          {/* 2. DESKTOP MENU (Ẩn trên Mobile) */}
          <div className="hidden md:flex gap-10 mx-auto">
            {["male", "female", "unisex"].map((g) => (
              <div
                key={g}
                className="relative"
                onMouseEnter={() => openGenderMenu(g)}
                onMouseLeave={closeGenderMenu}
              >
                <span
                  className={`cursor-pointer uppercase font-semibold ${hoveredGender === g ? "text-violet-600" : "text-gray-700"
                    }`}
                >
                  {g === "male" && "MALE"}
                  {g === "female" && "FEMALE"}
                  {g === "unisex" && "UNISEX"}
                </span>

                {/* Dropdown Menu Desktop */}
                {hoveredGender === g && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-3 bg-white shadow-2xl border rounded-xl p-6 w-[600px] z-50 animate-fadeIn"
                    onMouseEnter={() => clearTimeout(menuCloseTimer.current)}
                    onMouseLeave={closeGenderMenu}
                  >
                    <div className="grid grid-cols-3 gap-4">
                      {menu[g].map((cat) => (
                        <div
                          key={cat.id}
                          className="cursor-pointer group text-center"
                          onClick={() =>
                            navigate(`/category/${cat.id}?gender=${g}`)
                          }
                        >
                          <div className="mx-auto w-32 aspect-square overflow-hidden rounded-lg border-none bg-transparent flex items-center justify-center">
                            <img
                              src={getImgUrl(
                                cat.image_url || cat.preview_image
                              )}
                              className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105 rounded-lg"
                              alt={cat.name}
                            />
                          </div>
                          <span className="text-sm font-bold mt-2 group-hover:text-violet-700">
                            {cat.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 3. ICONS (Hiện cả Desktop & Mobile) */}
          <div className="flex items-center gap-4">
            {!user && (
              <div
                className="cursor-pointer relative group"
                onClick={() => navigate("/order")} // Đường dẫn trang tra cứu
                title="Tra cứu đơn hàng"
              >
                <i className="fa-solid fa-clipboard-list text-xl text-gray-700 hover:text-violet-600 transition-colors"></i>

                {/* (Tùy chọn) Tooltip nhỏ hiện khi hover để khách hiểu icon làm gì */}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 hidden md:block">
                  Tra cứu đơn
                </span>
              </div>
            )}
            {/* Search */}
            <i
              className="fa-solid fa-magnifying-glass text-xl text-gray-700 cursor-pointer hover:text-violet-600"
              onClick={() => navigate("/search")}
            ></i>

            {/* Cart */}
            <div
              className="relative cursor-pointer"
              onClick={() => navigate("/cart")}
            >
              <i className="fa-solid fa-cart-shopping text-xl text-gray-700 hover:text-violet-600"></i>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>

            {/* User Icon (Desktop Only) */}
            <div
              className="relative hidden md:block"
              onMouseEnter={handleMouseEnterUser}
              onMouseLeave={handleMouseLeaveUser}
            >
              <i
                className={`fa-solid fa-user text-xl cursor-pointer ${user
                    ? "text-violet-600"
                    : "text-gray-700 hover:text-violet-600"
                  }`}
              ></i>
              {/* User Dropdown (Giữ nguyên logic cũ) */}
              {userMenuOpen && (
                <div
                  className="absolute right-0 top-10 bg-white shadow-md rounded-lg border w-48 py-2 z-50"
                  onMouseEnter={() => clearTimeout(userCloseTimer.current)}
                >
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b font-bold text-gray-800">
                        {user.name}
                      </div>
                      {user.role === "admin" && (
                        <div
                          className="px-4 py-2 hover:bg-violet-100 cursor-pointer"
                          onClick={() => navigate("/admin")}
                        >
                          Admin
                        </div>
                      )}
                      <div
                        className="px-4 py-2 hover:bg-violet-100 cursor-pointer"
                        onClick={() => navigate("/profile")}
                      >
                        Profile
                      </div>
                      <div
                        className="px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer"
                        onClick={handleLogout}
                      >
                        Logout
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="px-4 py-2 hover:bg-violet-100 cursor-pointer"
                        onClick={() => navigate("/login")}
                      >
                        Login
                      </div>
                      <div
                        className="px-4 py-2 hover:bg-violet-100 cursor-pointer"
                        onClick={() => navigate("/register")}
                      >
                        Register
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Hamburger Button (Mobile Only) */}
            <button
              className="md:hidden text-2xl text-gray-700 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i
                className={
                  isMobileMenuOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"
                }
              ></i>
            </button>
          </div>
        </div>
      </nav>

      {/* 4. MOBILE MENU DRAWER (Hiện khi bấm Hamburger) */}
      {isMobileMenuOpen && (
        <div className="fixed top-16 left-0 right-0 bottom-0 bg-white z-40 overflow-y-auto p-4 md:hidden animate-fadeIn">
          {/* User Info Mobile */}
          <div className="mb-6 border-b pb-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-bold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{user.name}</p>
                  <p
                    className="text-xs text-gray-500 cursor-pointer hover:text-violet-600"
                    onClick={() => {
                      navigate("/profile");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    View profile
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 border border-violet-600 text-violet-600 rounded font-bold"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    navigate("/register");
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 bg-violet-600 text-white rounded font-bold"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Danh mục Nam/Nữ/Unisex dạng Accordion */}
          <div className="space-y-2">
            {["male", "female", "unisex"].map((g) => (
              <div key={g} className="border-b border-gray-100 last:border-0">
                {/* HEADER: Bấm vào để đóng/mở */}
                <button
                  onClick={() => toggleMobileGender(g)}
                  className="w-full flex justify-between items-center py-3 text-left focus:outline-none"
                >
                  <span
                    className={`font-bold text-lg uppercase ${mobileExpandedGender === g
                        ? "text-violet-700"
                        : "text-gray-700"
                      }`}
                  >
                    {g === "male"
                      ? "MALE"
                      : g === "female"
                        ? "FEMALE"
                        : "UNISEX"}
                  </span>
                  {/* Icon mũi tên xoay */}
                  <i
                    className={`fa-solid fa-chevron-down transition-transform duration-300 ${mobileExpandedGender === g
                        ? "rotate-180 text-violet-700"
                        : "text-gray-400"
                      }`}
                  ></i>
                </button>

                {/* CONTENT: Chỉ hiện khi state trùng khớp */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${mobileExpandedGender === g
                      ? "max-h-[1000px] opacity-100 mb-4"
                      : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="grid grid-cols-2 gap-2 pt-2 pl-2">
                    {menu[g].map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => {
                          navigate(`/category/${cat.id}?gender=${g}`);
                          setIsMobileMenuOpen(false);
                        }}
                        className="p-3 bg-gray-50 rounded text-sm text-gray-600 hover:bg-violet-50 hover:text-violet-700 cursor-pointer truncate transition"
                      >
                        {cat.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Admin Link Mobile */}
          {user && user.role === "admin" && (
            <div className="mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  navigate("/admin");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-3 bg-gray-800 text-white rounded font-bold"
              >
                <i className="fa-solid fa-screwdriver-wrench mr-2"></i> Admin
                page
              </button>
            </div>
          )}

          {/* Logout Mobile */}
          {user && (
            <button
              onClick={handleLogout}
              className="w-full py-3 mt-4 text-red-500 border border-red-200 rounded font-bold hover:bg-red-50"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </>
  );
}
