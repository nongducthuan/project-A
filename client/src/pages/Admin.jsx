import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api.jsx";

export default function Admin() {
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

      const results = await Promise.allSettled([
        API.get("/admin/products", { headers }),
        API.get("/admin/orders", { headers }),
        API.get("/admin/banners", { headers }),
      ]);

      const getData = (result) => {
        if (result.status === "fulfilled" && result.value.data) {
          return Array.isArray(result.value.data) ? result.value.data : [];
        }
        console.error("API Error:", result.reason);
        return [];
      };

      const products = getData(results[0]);
      const orders = getData(results[1]);
      const banners = getData(results[2]);

      const totalStockCount = products.reduce((sum, p) => sum + (Number(p.total_stock) || 0), 0);

      setStats({
        productCount: products.length,
        totalStock: totalStockCount,
        orders: orders.length,
        banners: banners.length,
      });
    };

    fetchStats();
  }, []);

  // Style chung cho các thẻ Card
  const cardStyle = {
    cursor: "pointer",
    borderRadius: "12px",
    border: "none",
    transition: "all 0.3s ease",
  };

  return (
    <div className="container mt-5 mb-5">
      <h2 className="text-center fw-bold mb-5 text-uppercase text-dark" style={{ letterSpacing: "1px" }}>
        Dashboard Quản Trị
      </h2>

      <div className="row g-4">
        {/* 1. KHO HÀNG */}
        <div className="col-md-3">
          <div
            // THÊM bg-white VÀO ĐÂY
            className="card shadow h-100 bg-white"
            style={cardStyle}
            onClick={() => navigate("/admin/products")}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div className="card-body text-center p-4 d-flex flex-column justify-content-center">
              <div className="mb-3">
                 <i className="fa-solid fa-boxes-stacked fa-3x text-success"></i>
              </div>
              <h6 className="text-muted text-uppercase fw-bold mb-2">Tổng Tồn Kho</h6>
              <h2 className="display-5 fw-bold text-success mb-0">
                {stats.totalStock.toLocaleString()}
              </h2>
              <p className="text-muted small mt-2 mb-0">Sản phẩm sẵn sàng</p>
            </div>
            <div className="card-footer bg-transparent border-0 pb-3">
              <small className="text-success fw-bold">Quản lý sản phẩm &rarr;</small>
            </div>
          </div>
        </div>

        {/* 2. ĐƠN HÀNG */}
        <div className="col-md-3">
          <div
            // THÊM bg-white VÀO ĐÂY
            className="card shadow h-100 bg-white"
            style={cardStyle}
            onClick={() => navigate("/admin/orders")}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div className="card-body text-center p-4 d-flex flex-column justify-content-center">
              <div className="mb-3">
                <i className="fa-solid fa-file-invoice-dollar fa-3x text-warning"></i>
              </div>
              <h6 className="text-muted text-uppercase fw-bold mb-2">Đơn Hàng Mới</h6>
              <h2 className="display-5 fw-bold text-warning mb-0">
                {stats.orders}
              </h2>
              <p className="text-muted small mt-2 mb-0">Cần xử lý ngay</p>
            </div>
            <div className="card-footer bg-transparent border-0 pb-3">
              <small className="text-warning fw-bold">Xem danh sách &rarr;</small>
            </div>
          </div>
        </div>

        {/* 3. DOANH THU */}
        <div className="col-md-3">
          <div
            // THÊM bg-white VÀO ĐÂY
            className="card shadow h-100 bg-white"
            style={cardStyle}
            onClick={() => navigate("/admin/report")}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div className="card-body text-center p-4 d-flex flex-column justify-content-center">
              <div className="mb-3">
                <i className="fa-solid fa-chart-pie fa-3x text-info"></i>
              </div>
              <h6 className="text-muted text-uppercase fw-bold mb-2">Báo Cáo</h6>
              <h2 className="fw-bold text-info mb-0" style={{ fontSize: "2rem" }}>
                DOANH THU
              </h2>
              <p className="text-muted small mt-2 mb-0">Thống kê chi tiết</p>
            </div>
            <div className="card-footer bg-transparent border-0 pb-3">
              <small className="text-info fw-bold">Xem biểu đồ &rarr;</small>
            </div>
          </div>
        </div>

        {/* 4. BANNER */}
        <div className="col-md-3">
          <div
            // THÊM bg-white VÀO ĐÂY
            className="card shadow h-100 bg-white"
            style={cardStyle}
            onClick={() => navigate("/admin/banners")}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div className="card-body text-center p-4 d-flex flex-column justify-content-center">
              <div className="mb-3">
                <i className="fa-solid fa-panorama fa-3x text-primary"></i>
              </div>
              <h6 className="text-muted text-uppercase fw-bold mb-2">Banner</h6>
              <h2 className="display-5 fw-bold text-primary mb-0">
                {stats.banners}
              </h2>
              <p className="text-muted small mt-2 mb-0">Đang hiển thị</p>
            </div>
            <div className="card-footer bg-transparent border-0 pb-3">
              <small className="text-primary fw-bold">Chỉnh sửa &rarr;</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
