import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api.jsx";
import ProductCard from "../components/ProductCard.jsx";

/* ================= HELPER ================= */
const removeVietnameseTones = (str) => {
  if (!str) return "";
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  // Combine diacritical marks
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return str;
};

/* ================= CONSTANTS ================= */
const PRICE_RANGES = [
  { label: "All", min: 0, max: Infinity },
  { label: "< 100k", min: 0, max: 100000 },
  { label: "100k - 300k", min: 100000, max: 300000 },
  { label: "300k - 500k", min: 300000, max: 500000 },
  { label: "> 500k", min: 500000, max: Infinity },
];

const GENDERS = [
  { id: "all", label: "All" },
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "unisex", label: "Unisex" },
];

export default function SearchResults() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // url params
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("query") || "";
  const urlGender = searchParams.get("gender") || "all";
  const urlCategory = searchParams.get("category") || "";

  // local state
  const [searchInput, setSearchInput] = useState(urlQuery);
  const [filterPrice, setFilterPrice] = useState(0);

  // sync when browser back
  useEffect(() => {
    setSearchInput(urlQuery);
  }, [urlQuery]);

  // fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          API.get("/products?limit=2000"),
          API.get("/categories"),
        ]);

        const prodData = Array.isArray(prodRes.data) ? prodRes.data : prodRes.data?.data || [];
        const catData = Array.isArray(catRes.data) ? catRes.data : catRes.data?.data || [];

        setProducts(prodData);
        setCategories(catData);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // dedupe categories by name (preserve first occurrence)
  const uniqueCategories = useMemo(() => {
    const unique = [];
    const seen = new Set();
    categories.forEach((c) => {
      const key = (c.name || "").trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(c);
      }
    });
    return unique;
  }, [categories]);

  // main filter logic (UNCHANGED)
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];

    return products.filter((p) => {
      const productNameNorm = removeVietnameseTones(p.name || "").toLowerCase();
      const queryNorm = removeVietnameseTones(urlQuery || "").toLowerCase();
      const matchQuery = productNameNorm.includes(queryNorm);

      let matchGender = true;
      if (urlGender !== "all") matchGender = p.gender === urlGender;

      let matchCategory = true;
      if (urlCategory) {
        const currentCategory = categories.find((c) => String(c.id) === String(urlCategory));
        if (currentCategory) {
          const sameNameCategoryIds = categories
            .filter((c) => (c.name || "").trim().toLowerCase() === currentCategory.name.trim().toLowerCase())
            .map((c) => String(c.id));
          matchCategory = sameNameCategoryIds.includes(String(p.category_id));
        } else {
          matchCategory = String(p.category_id) === String(urlCategory);
        }
      }

      const selectedRange = PRICE_RANGES[filterPrice] || PRICE_RANGES[0];
      const price = Number(p.price) || 0;
      const matchPrice = price >= selectedRange.min && price < selectedRange.max;

      return matchQuery && matchGender && matchCategory && matchPrice;
    });
  }, [products, urlQuery, urlGender, urlCategory, filterPrice, categories]);

  // search submit (keeps logic)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) newParams.set("query", searchInput);
    else newParams.delete("query");
    setSearchParams(newParams);
  };

  // update filters (price kept local as original)
  const updateFilter = (key, value) => {
    if (key === "price") {
      setFilterPrice(value);
      return;
    }
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== "all") newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-gray-500">Loading...</div>;
  }

  return (
    <div className="sr-container container mx-auto py-6 px-3 md:px-4 min-h-screen flex flex-col md:flex-row gap-6 overflow-x-hidden">
      {/* inline CSS to ensure images don't overflow and mobile fits */}
      <style>{`
        .sr-container img { max-width: 100%; height: auto; object-fit: contain; }
        /* ensure no horizontal overflow from long titles/buttons */
        .sr-container * { box-sizing: border-box; }
      `}</style>

      {/* ========== SIDEBAR (PC only) - keep exactly as your original behavior ========== */}
      <div className="hidden md:block md:w-1/4 flex-shrink-0">
        <div className="sticky bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="font-bold text-lg uppercase text-gray-800">Filters</h3>
            <button
              className="text-xs text-red-500 hover:underline"
              onClick={() => {
                setSearchParams({});
                setFilterPrice(0);
                setSearchInput("");
              }}
            >
              Clear all
            </button>
          </div>

          {/* Gender (PC) */}
          <div className="mb-6">
            <h4 className="font-semibold text-sm mb-3 text-gray-700">Gender</h4>
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => updateFilter("gender", g.id)}
                  className={`px-3 py-1.5 text-sm border rounded transition-all ${
                    urlGender === g.id
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories (PC) */}
          <div className="mb-6">
            <h4 className="font-semibold text-sm mb-3 text-gray-700">Category</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateFilter("category", "")}
                className={`px-2 py-2 text-sm border rounded text-center transition-all ${
                  !urlCategory
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
                }`}
              >
                All
              </button>
              {uniqueCategories.map((c) => {
                const currentSelectedCat = categories.find((cat) => String(cat.id) === String(urlCategory));
                const isSelected = currentSelectedCat && currentSelectedCat.name === c.name;

                return (
                  <button
                    key={c.id}
                    onClick={() => updateFilter("category", c.id)}
                    className={`px-2 py-2 text-sm border rounded text-center truncate ${
                      isSelected
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
                    }`}
                    title={c.name}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range (PC) */}
          <div className="mb-6">
            <h4 className="font-semibold text-sm mb-3 text-gray-700">Price Range</h4>
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

      {/* ========== MAIN CONTENT ========== */}
      <div className="w-full md:w-3/4">
        {/* SEARCH BOX (compact on mobile, unchanged on PC) */}
        <div className="mb-4 bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-100">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-black focus:outline-none"
              placeholder="Search products"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />

            {/* mobile: show small icon button; md+: show full button (preserve PC look) */}
            <button
              type="submit"
              className="md:hidden w-10 h-10 rounded-full flex items-center justify-center border border-gray-300"
              aria-label="Search"
            >
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>

            <button
              type="submit"
              className="hidden md:inline-flex bg-black text-white px-6 py-2 rounded-md font-bold hover:bg-gray-800 transition flex items-center gap-2"
            >
              <i className="fa-solid fa-magnifying-glass"></i>
              Search
            </button>
          </form>
        </div>

        {/* MOBILE FILTER BUTTON (visible only on small screens) */}
        <div className="mb-3 md:hidden">
          <button
            onClick={() => setShowMobileFilter(true)}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-full bg-white"
          >
            <i className="fa-solid fa-filter"></i>
            Filters
          </button>
        </div>

        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold uppercase text-gray-800">
              {urlQuery ? `Results: "${urlQuery}"` : "All Products"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Showing {filteredProducts.length} products</p>
          </div>
        </div>

        {/* Product grid: mobile 2 columns, tablet 2, desktop 3 */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">No matching products found.</p>
            <button
              className="mt-4 text-sm text-blue-600 hover:underline"
              onClick={() => {
                setSearchParams({});
                setSearchInput("");
                setFilterPrice(0);
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="w-full">
                {/* wrapper ensures product card doesn't overflow horizontally on mobile */}
                <div className="w-full overflow-hidden">
                  <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========== MOBILE FILTER DRAWER ========== */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilter(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Filters</h3>
              <button onClick={() => setShowMobileFilter(false)} className="text-xl px-2">✕</button>
            </div>

            {/* Gender (mobile) */}
            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-2">Gender</h4>
              <div className="flex gap-2 flex-wrap">
                {GENDERS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => updateFilter("gender", g.id)}
                    className={`px-3 py-2 text-sm border rounded ${urlGender === g.id ? "bg-black text-white" : ""}`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category (mobile) */}
            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-2">Category</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateFilter("category", "")}
                  className={`py-2 rounded text-sm border ${!urlCategory ? "bg-black text-white" : ""}`}
                >
                  All
                </button>
                {uniqueCategories.map((c) => {
                  const current = categories.find((cat) => String(cat.id) === String(urlCategory));
                  const isSelected = current && current.name === c.name;
                  return (
                    <button
                      key={c.id}
                      onClick={() => updateFilter("category", c.id)}
                      className={`py-2 rounded text-sm border truncate ${isSelected ? "bg-black text-white" : ""}`}
                      title={c.name}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price (mobile) */}
            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-2">Price</h4>
              <div className="space-y-2">
                {PRICE_RANGES.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => updateFilter("price", i)}
                    className={`w-full text-left py-2 px-3 border rounded ${filterPrice === i ? "bg-black text-white" : ""}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3">
              <button
                onClick={() => setShowMobileFilter(false)}
                className="w-full bg-black text-white py-3 rounded font-bold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
