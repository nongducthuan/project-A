import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    productCount: 0,
    totalStock: 0,
    orders: 0,
    banners: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all required data concurrently
      const results = await Promise.allSettled([
        API.get("/admin/products", { headers }),
        API.get("/admin/orders", { headers }),
        API.get("/admin/banners", { headers }),
      ]);

      // Helper to safely extract data array
      const getData = (result) => {
        if (result.status === "fulfilled" && result.value.data) {
          return Array.isArray(result.value.data) ? result.value.data : [];
        }
        return [];
      };

      const products = getData(results[0]);
      const orders = getData(results[1]);
      const banners = getData(results[2]);

      // Calculate total stock from all products
      const totalStockCount = products.reduce(
        (sum, p) => sum + (Number(p.total_stock) || 0),
        0
      );

      // Update the state with the calculated statistics
      setStats({
        productCount: products.length,
        totalStock: totalStockCount,
        orders: orders.length,
        banners: banners.length,
      });
    };

    fetchStats();
  }, []);

  const cardStyle = {
    cursor: "pointer",
    borderRadius: "14px",
    border: "none",
    transition: "all 0.3s ease",
  };

  return (
    <div className="container mt-5 mb-5">
      <h2
        className="text-center fw-bold mb-5 text-uppercase text-dark"
        style={{ letterSpacing: "1px" }}
      >
        Admin Dashboard
      </h2>

      {/* ======================== TOP 4 STATS ROW ======================== */}
      <div className="row g-4 mb-4">
        {/* 1. TOTAL STOCK */}
        <div className="col-md-3">
          <div
            className="card shadow h-100 bg-white"
            style={cardStyle}
            onClick={() => navigate("/admin/products")}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <i className="fa-solid fa-boxes-stacked fa-3x text-success"></i>
              </div>
              <h6 className="text-muted text-uppercase fw-bold mb-2">Total Stock</h6>
              <h2 className="fw-bold text-success mb-0">
                {stats.totalStock.toLocaleString()}
              </h2>
              <p className="text-muted small mt-2 mb-0">Available products</p>
            </div>
            <div className="card-footer bg-transparent border-0 pb-3">
              <small className="text-success fw-bold">Manage Products →</small>
            </div>
          </div>
        </div>

        {/* 2. NEW ORDERS */}
        <div className="col-md-3">
          <div
            className="card shadow h-100 bg-white"
            style={cardStyle}
            onClick={() => navigate("/admin/orders")}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <i className="fa-solid fa-file-invoice-dollar fa-3x text-warning"></i>
              </div>
              <h6 className="text-muted text-uppercase fw-bold mb-2">New Orders</h6>
              <h2 className="fw-bold text-warning mb-0">{stats.orders}</h2>
              <p className="text-muted small mt-2 mb-0">Need immediate processing</p>
            </div>
            <div className="card-footer bg-transparent border-0 pb-3">
              <small className="text-warning fw-bold">View List →</small>
            </div>
          </div>
        </div>

        {/* 3. PRODUCT CATEGORIES */}
        <div className="col-md-3">
          <div
            className="card shadow h-100 bg-white"
            style={cardStyle}
            onClick={() => navigate("/admin/categories")}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <i className="fa-solid fa-tags fa-3x text-dark"></i>
              </div>
              <h6 className="text-muted text-uppercase fw-bold mb-2">Product Categories</h6>
              <h2 className="fw-bold text-dark mb-0">{stats.productCount}</h2> {/* Reusing productCount for the number of products */}
              <p className="text-muted small mt-2 mb-0">Add, edit, delete categories</p>
            </div>
            <div className="card-footer bg-transparent border-0 pb-3">
              <small className="text-dark fw-bold">Go to →</small>
            </div>
          </div>
        </div>

        {/* 4. BANNERS */}
        <div className="col-md-3">
          <div
            className="card shadow h-100 bg-white"
            style={cardStyle}
            onClick={() => navigate("/admin/banners")}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <i className="fa-solid fa-panorama fa-3x text-primary"></i>
              </div>
              <h6 className="text-muted text-uppercase fw-bold mb-2">Banners</h6>
              <h2 className="fw-bold text-primary mb-0">{stats.banners}</h2>
              <p className="text-muted small mt-2 mb-0">Currently displayed</p>
            </div>
            <div className="card-footer bg-transparent border-0 pb-3">
              <small className="text-primary fw-bold">Edit →</small>
            </div>
          </div>
        </div>
      </div>

      {/* ======================= BOTTOM ROW: REVENUE FULL WIDTH ======================= */}
      <div className="row g-4">
        <div className="col-12">
          <div
            className="card shadow bg-white"
            style={{ ...cardStyle, cursor: "pointer" }}
            onClick={() => navigate("/admin/report")}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div className="card-body text-center p-5">
              <div className="mb-3">
                <i className="fa-solid fa-chart-pie fa-3x text-info"></i>
              </div>
              <h6 className="text-muted text-uppercase fw-bold mb-2">
                Revenue Report
              </h6>

              <h2 className="fw-bold text-info mb-3" style={{ fontSize: "2.4rem" }}>
                REVENUE
              </h2>

              <p className="text-muted small mt-2 mb-0">
                View detailed statistics & charts for the entire system revenue.
              </p>
            </div>

            <div className="card-footer bg-transparent border-0 pb-4 text-center">
              <small className="text-info fw-bold">View Charts →</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}