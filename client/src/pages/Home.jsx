import { useEffect, useState } from "react";
import API from "../api";
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Home() {
  const [banners, setBanners] = useState([]);
  const backendUrl = "http://localhost:5000";

  useEffect(() => {
    API.get("/banners")
      .then((res) => setBanners(res.data))
      .catch((err) => console.error("Lỗi tải banner:", err));

    AOS.init({
      duration: 1000,
      offset: 300,
      once: false,
      mirror: false
    });
  }, []);

  return (
    <div className="w-full">
      {/* 🖼 Carousel Banner */}
      <div id="heroCarousel" className="carousel slide mb-8" data-bs-ride="carousel">
        <div className="carousel-inner">
          {banners.length > 0 ? (
            banners.map((b, idx) => (
              <div key={b.id} className={`carousel-item ${idx === 0 ? "active" : ""}`}>
                <img
                  src={`${backendUrl}${b.image_url}`}
                  className="d-block w-full rounded-3xl"
                  alt={b.title || `Banner ${idx + 1}`}
                />
                {(b.title || b.subtitle) && (
                  <div className="carousel-caption d-md-block">
                    {b.title && <h1 className="fw-bold text-2xl md:text-4xl">{b.title}</h1>}
                    {b.subtitle && <p className="text-sm md:text-base">{b.subtitle}</p>}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="carousel-item active">
              <img
                src={`${backendUrl}/public/images/placeholder-banner.png`}
                className="d-block w-full rounded-3xl"
                alt="Default Banner"
              />
              <div className="carousel-caption d-md-block">
                <h1 className="fw-bold text-2xl md:text-4xl">Chào mừng đến Clothing Shop</h1>
                <p className="text-sm md:text-base">Bộ sưu tập mới nhất đã có mặt – Giảm giá đến 50% hôm nay!</p>
              </div>
            </div>
          )}
        </div>

        {banners.length > 1 && (
          <>
            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#heroCarousel"
              data-bs-slide="prev"
            >
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#heroCarousel"
              data-bs-slide="next"
            >
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </>
        )}
      </div>

      {/* 🌟 Bộ sưu tập nổi bật */}
      <section className="my-12" data-aos="fade-up">
        <div className="max-w-[1280px] mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 
                 bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent 
                 animate-fadeColor inline-block relative">
            BỘ SƯU TẬP NỔI BẬT
            <span className="block h-1 w-full max-w-xs mx-auto mt-2 
                   bg-gradient-to-r from-blue-400 to-sky-400 rounded animate-slideLine"></span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative rounded-3xl overflow-hidden shadow-lg">
              <img
                src="/assets/images/banner-family.png"
                alt="Áo phông cho cả gia đình"
                className="w-full"
              />
              <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center text-white p-4">
                <h3 className="text-xl md:text-2xl font-bold mb-2">ÁO PHÔNG CHO CẢ GIA ĐÌNH</h3>
                <p className="text-sm md:text-base text-center">Khám phá bảng màu áo phông đa sắc cho mọi lứa tuổi!</p>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-lg">
              <img
                src="/assets/images/banner-vietnam.png"
                alt="Tự hào Việt Nam ơi"
                className="w-full"
              />
              <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center text-white p-4">
                <h3 className="text-xl md:text-2xl font-bold mb-2">TỰ HÀO VIỆT NAM ƠI</h3>
                <p className="text-sm md:text-base text-center">Khoác lên mình màu cờ sắc áo - tôn vinh tinh thần dân tộc với thiết kế ý nghĩa, lan tỏa tình yêu nước đến mọi trái tim người Việt.</p>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-lg">
              <img
                src="/assets/images/banner-homewear.png"
                alt="Homewear"
                className="w-full"
              />
              <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center text-white p-4">
                <h3 className="text-xl md:text-2xl font-bold mb-2">HOMEWEAR</h3>
                <p className="text-sm md:text-base text-center">Chạm vào sự thoải mái với loạt thiết kế êm nhẹ tinh tế – để từng phút giây ở nhà trở nên thật thư thái.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Nam/Nữ */}
      <section className="my-12" data-aos="fade-up">
        <div className="max-w-[1280px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative rounded-3xl overflow-hidden shadow-lg">
            <img
              src="/assets/images/men-wear.png"
              alt="Men Wear"
              className="w-full"
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/30 text-white p-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">MEN WEAR</h2>
              <p className="text-sm md:text-base">Nhập COOLNEW Giảm 50K đơn đầu tiên từ 299k</p>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-lg">
            <img
              src="/assets/images/women-active.png"
              alt="Women Active"
              className="w-full"
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/30 text-white p-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">WOMEN ACTIVE</h2>
              <p className="text-sm md:text-base">Nhập CMVSEAMLESS Giảm 50K cho BST Seamless</p>
            </div>
          </div>
        </div>
      </section>

      {/* 👕 Lookbook */}
      <section className="my-12" data-aos="fade-up">
        <div className="max-w-[1280px] mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 
                 bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent 
                 animate-fadeColor inline-block relative">
            LOOKBOOK GỢI Ý PHỐI ĐỒ
            <span className="block h-1 w-full max-w-xs mx-auto mt-2 
                   bg-gradient-to-r from-blue-400 to-sky-400 rounded animate-slideLine"></span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
            <div className="w-full md:w-[380px] aspect-w-4 aspect-h-6 rounded-3xl overflow-hidden shadow-lg">
              <img
                src="https://api.fastretailing.com/ugc/v1/uq/gl/OFFICIAL_IMAGES/25110708049_official_styling_180000008"
                className="w-full h-full object-cover"
                alt="Look 1"
              />
            </div>
            <div className="w-full md:w-[380px] aspect-w-4 aspect-h-6 rounded-3xl overflow-hidden shadow-lg">
              <img
                src="https://api.fastretailing.com/ugc/v1/uq/gl/OFFICIAL_IMAGES/25110708050_official_styling_180000012"
                className="w-full h-full object-cover"
                alt="Look 2"
              />
            </div>
            <div className="w-full md:w-[380px] aspect-w-4 aspect-h-6 rounded-3xl overflow-hidden shadow-lg">
              <img
                src="https://api.fastretailing.com/ugc/v1/uq/gl/OFFICIAL_IMAGES/251017001532_official_styling_130016330"
                className="w-full h-full object-cover"
                alt="Look 3"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 🎁 Chính sách ưu đãi */}
      <section className="my-12 text-center" data-aos="fade-up">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 
                 bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent 
                 animate-fadeColor inline-block relative">
          CHÍNH SÁCH ƯU ĐÃI
          <span className="block h-1 w-full max-w-xs mx-auto mt-2 
                   bg-gradient-to-r from-blue-400 to-sky-400 rounded animate-slideLine"></span>
        </h2>
        <div className="max-w-[1280px] mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h5 className="text-xl font-bold mb-2">🎁 Giảm giá</h5>
            <p>Giảm 10% cho khách hàng mới</p>
          </div>
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h5 className="text-xl font-bold mb-2">🚚 Freeship</h5>
            <p>Miễn phí vận chuyển cho đơn từ 500k</p>
          </div>
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h5 className="text-xl font-bold mb-2">🔄 Đổi trả</h5>
            <p>Đổi trả miễn phí trong 7 ngày</p>
          </div>
        </div>
      </section>

      {/* ⚙️ Footer */}
      <footer className="bg-gray-900 mt-12 py-8 text-center text-white">
        <p className="mb-1">
          📞 Hotline:{" "}
          <a href="tel:0123456789" className="text-white underline">
            0123-456-789
          </a>
        </p>
        <p className="mb-1">
          📧 Email:{" "}
          <a href="mailto:support@shopquanao.com" className="text-white underline">
            support@shopquanao.com
          </a>
        </p>
        <p className="mb-1">
          🏠 Địa chỉ:{" "}
          <a
            href="https://www.google.com/maps/search/?api=1&query=Đường+Nam+Kỳ+Khởi+Nghĩa,+Phường+Hòa+Phú,+Thủ+Dầu+Một,+Bình+Dương,+Việt+Nam"
            className="text-white underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Đường Nam Kỳ Khởi Nghĩa, Phường Hòa Phú, TP. Thủ Dầu Một, Bình Dương
          </a>
        </p>
        <p className="mb-0">© {new Date().getFullYear()} Clothing Shop - All Rights Reserved</p>
      </footer>
    </div>
  );
}
