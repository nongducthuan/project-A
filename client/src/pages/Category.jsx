import { useParams, useSearchParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import API from "../api";

const ITEMS_PER_PAGE = 8;

export default function CategoryPage() {
  const { id } = useParams();
  const location = useLocation(); // ⭐ IMPORTANT: track changes in ?gender=xxx
  const [searchParams] = useSearchParams();

  const rawGender = searchParams.get("gender");
  const gender = ["male", "female", "unisex"].includes(rawGender)
    ? rawGender
    : null;

  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("Loading...");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ⭐ IMPORTANT: Reload whenever id, gender, or page changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [productsRes, categoriesRes] = await Promise.all([
          API.get("/products", {
            params: {
              category_id: id,
              gender: gender,
              page: currentPage,
              limit: ITEMS_PER_PAGE,
            },
          }),
          API.get("/categories"),
        ]);

        const prodData = productsRes.data;
        const safeProducts = Array.isArray(prodData)
          ? prodData
          : prodData?.data || prodData?.products || [];

        setProducts(safeProducts);
        setTotalPages(prodData?.totalPages || 1);

        const catList = Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : categoriesRes.data?.data || [];

        const currentCat = catList.find((c) => String(c.id) === String(id));

        let title = currentCat ? currentCat.name : "Product Category";
        if (gender === "male") title += " (Men)";
        if (gender === "female") title += " (Women)";
        if (gender === "unisex") title += " (Unisex)";

        setCategoryName(title);
      } catch (err) {
        console.error("❌ Error loading data:", err);
        setError("Unable to load data. Please check your connection.");
        setProducts([]);
      } finally {
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    fetchData();
  }, [id, gender, currentPage, location.search]);
  // ⭐⭐ MAJOR FIX: added location.search to re-run when query changes

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="h-10 w-1/3 bg-gray-200 rounded mb-8 animate-pulse"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 h-80 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-500">
        <p className="text-xl font-semibold mb-4">⚠️ {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-200 rounded text-gray-800 hover:bg-gray-300"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-800 uppercase">
          {categoryName}
        </h2>
        <span className="text-gray-500 mt-2 md:mt-0">
          {products.length} products available
        </span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No matching products found.</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 text-blue-600 hover:underline"
          >
            &larr; Go Back
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="flex justify-center items-center gap-4 mt-10">
            <button
              disabled={currentPage === 1}
              onClick={handlePrevPage}
              className={`px-4 py-2 rounded border ${currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "hover:bg-gray-50 text-gray-700"
                }`}
            >
              &larr; Previous
            </button>

            <span className="font-medium text-gray-700">
              Page {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={handleNextPage}
              className={`px-4 py-2 rounded border ${currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "hover:bg-gray-50 text-gray-700"
                }`}
            >
              Next &rarr;
            </button>
          </div>
        </>
      )}
    </div>
  );
}