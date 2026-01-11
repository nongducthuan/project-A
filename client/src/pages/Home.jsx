import { useEffect, useState } from "react";
import API from "../api";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Home() {
  const [banners, setBanners] = useState([]);
  const backendUrl = "http://localhost:5000";

  useEffect(() => {
    API.get("/banners").then((res) => {
      setBanners(res.data);

      if (window.innerWidth >= 768) {
        setTimeout(() => {
          AOS.init({
            duration: 700,
            offset: 200,
            once: true,
            startEvent: "scroll",
            disableMutationObserver: true,
          });
        }, 300);
      }
    });
  }, []);

  return (
    <div className="w-full">
      {/* 🖼 Carousel Banner */}
      <div
        id="heroCarousel"
        className="carousel slide mb-8"
        data-bs-ride="carousel"
      >
        <div className="carousel-inner">
          {banners.length > 0 ? (
            banners.map((b, idx) => (
              <div
                key={b.id}
                className={`carousel-item ${idx === 0 ? "active" : ""} h-[50vh] md:h-[100vh] relative`}
              >
                {/* 🖼️ Ảnh Banner */}
                <img
                  src={`${backendUrl}${b.image_url}`}
                  className="d-block w-full h-full object-cover object-top md:object-center"
                  alt={b.title || `Banner ${idx + 1}`}
                />
                {(b.title || b.subtitle) && (
                  <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-end md:justify-center text-center text-white p-4">
                    {b.title && (
                      <h1 className="fw-bold text-xl sm:text-2xl md:text-3xl drop-shadow-lg mb-2">
                        {b.title}
                      </h1>
                    )}
                    {b.subtitle && (
                      <p className="text-base sm:text-lg md:text-xl drop-shadow-md max-w-2xl">
                        {b.subtitle}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="carousel-item active h-[50vh] md:h-[100vh] relative">
              <img
                src={`${backendUrl}/public/images/placeholder-banner.png`}
                className="d-block w-full h-full object-cover object-top md:object-center"
                alt="Default Banner"
              />
              <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-end md:justify-center text-center text-white p-4">
                <h1 className="fw-bold text-xl sm:text-2xl md:text-3xl drop-shadow-lg mb-2">
                  Welcome to Clothing Shop
                </h1>
                <p className="text-base sm:text-lg md:text-xl drop-shadow-md max-w-2xl">
                  The latest collection is here – Up to 50% off today!
                </p>
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
              <span
                className="carousel-control-prev-icon"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#heroCarousel"
              data-bs-slide="next"
            >
              <span
                className="carousel-control-next-icon"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Next</span>
            </button>
          </>
        )}
      </div>

      {/* 🌟 Featured Collections */}
      <section className="my-12" data-aos="fade-up">
        <div className="max-w-[1280px] mx-auto px-4 text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-8
                  bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent
                  animate-fadeColor inline-block relative uppercase"
          >
            Featured Collections
            <span
              className="block h-1 w-full max-w-xs mx-auto mt-2
                   bg-gradient-to-r from-blue-400 to-sky-400 rounded animate-slideLine"
            ></span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative rounded-3xl overflow-hidden shadow-lg">
              <img
                src="/assets/images/banner-family.png"
                alt="T-shirts for the family"
                className="w-full"
              />
              <div className="absolute inset-0 bg-black/30 flex flex-col justify-end md:justify-center items-center text-white p-4">
                <h3 className="text-xl md:text-2xl font-bold mb-2 uppercase">
                  Family T-Shirts
                </h3>
                <p className="text-sm md:text-base text-center">
                  Discover colorful t-shirt palettes for all ages!
                </p>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-lg">
              <img
                src="/assets/images/banner-vietnam.png"
                alt="Proud of Vietnam"
                className="w-full"
              />
              <div className="absolute inset-0 bg-black/30 flex flex-col justify-end md:justify-center items-center text-white p-4">
                <h3 className="text-xl md:text-2xl font-bold mb-2 uppercase">
                  Proud of Vietnam
                </h3>
                <p className="text-sm md:text-base text-center">
                  Wear the national colors – honoring the spirit with meaningful
                  designs, spreading love to every heart.
                </p>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-lg">
              <img
                src="/assets/images/banner-homewear.png"
                alt="Homewear"
                className="w-full"
              />
              <div className="absolute inset-0 bg-black/30 flex flex-col justify-end md:justify-center items-center text-white p-4">
                <h3 className="text-xl md:text-2xl font-bold mb-2 uppercase">
                  Homewear
                </h3>
                <p className="text-sm md:text-base text-center">
                  Experience comfort with delicate, soft designs – making every
                  moment at home truly relaxing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Men/Women */}
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
              <p className="text-sm md:text-base">
                Use code COOLNEW: 50K off first order over 299k
              </p>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-lg">
            <img
              src="/assets/images/women-active.png"
              alt="Women Active"
              className="w-full"
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/30 text-white p-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                WOMEN ACTIVE
              </h2>
              <p className="text-sm md:text-base">
                Use code CMVSEAMLESS: 50K off Seamless Collection
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 👕 Lookbook */}
      <section className="my-12" data-aos="fade-up">
        <div className="max-w-[1280px] mx-auto px-4 text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-8
                  bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent
                  animate-fadeColor inline-block relative uppercase"
          >
            Outfit Inspiration Lookbook
            <span
              className="block h-1 w-full max-w-xs mx-auto mt-2
                   bg-gradient-to-r from-blue-400 to-sky-400 rounded animate-slideLine"
            ></span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
            <div className="w-full md:w-[380px] aspect-w-4 aspect-h-6 rounded-3xl overflow-hidden shadow-lg">
              <img
                src="/assets/images/lookbook1.png"
                className="w-full h-full object-cover"
                alt="Look 1"
              />
            </div>
            <div className="w-full md:w-[380px] aspect-w-4 aspect-h-6 rounded-3xl overflow-hidden shadow-lg">
              <img
                src="/assets/images/lookbook2.png"
                className="w-full h-full object-cover"
                alt="Look 2"
              />
            </div>
            <div className="w-full md:w-[380px] aspect-w-4 aspect-h-6 rounded-3xl overflow-hidden shadow-lg">
              <img
                src="/assets/images/lookbook3.png"
                className="w-full h-full object-cover"
                alt="Look 3"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 🎁 Offers Policy */}
      <section className="my-12 text-center" data-aos="fade-up">
        <h2
          className="text-3xl md:text-4xl font-bold mb-8
                  bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent
                  animate-fadeColor inline-block relative uppercase"
        >
          Preferential Policy
          <span
            className="block h-1 w-full max-w-xs mx-auto mt-2
                   bg-gradient-to-r from-blue-400 to-sky-400 rounded animate-slideLine"
          ></span>
        </h2>
        <div className="max-w-[1280px] mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h5 className="text-xl font-bold mb-2">🎁 Discounts</h5>
            <p>10% off for new customers</p>
          </div>
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h5 className="text-xl font-bold mb-2">🚚 Free Shipping</h5>
            <p>Free shipping on orders over 500k</p>
          </div>
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h5 className="text-xl font-bold mb-2">🔄 Returns</h5>
            <p>Free returns within 7 days</p>
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
          <a
            href="mailto:support@shopquanao.com"
            className="text-white underline"
          >
            support@shopquanao.com
          </a>
        </p>
        <p className="mb-1">
          🏠 Address:{" "}
          <a
            href="https://www.google.com/maps/search/?api=1&query=Đường+Nam+Kỳ+Khởi+Nghĩa,+Phường+Hòa+Phú,+Thủ+Dầu+Một,+Bình+Dương,+Việt+Nam"
            className="text-white underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Nam Ky Khoi Nghia St, Binh Duong Ward, Ho Chi Minh City
          </a>
        </p>
        <p className="mb-0">
          © {new Date().getFullYear()} Clothing Shop - All Rights Reserved
        </p>
      </footer>
    </div>
  );
}
