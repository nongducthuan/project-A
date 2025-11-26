DROP DATABASE IF EXISTS shopdb;
CREATE DATABASE shopdb;
USE shopdb;

-- ==========================================
-- 1. BẢNG NGƯỜI DÙNG & PHÂN QUYỀN
-- ==========================================

CREATE TABLE memberships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  min_spending DECIMAL(10,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password VARCHAR(100) NOT NULL,
  role ENUM('customer','admin') DEFAULT 'customer',
  total_spent DECIMAL(10,2) DEFAULT 0,
  membership_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (membership_id) REFERENCES memberships(id)
);

-- ==========================================
-- 2. BẢNG SẢN PHẨM & DANH MỤC
-- ==========================================

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  sale_percent DECIMAL(5,2) DEFAULT 0 CHECK (sale_percent >= 0 AND sale_percent <= 100),
  image_url VARCHAR(512),
  
  -- Cột giới tính cứng (QUAN TRỌNG CHO SEARCH)
  gender ENUM('male', 'female', 'unisex') NOT NULL DEFAULT 'unisex',
  
  category_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE product_colors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  color_name VARCHAR(50) NOT NULL,
  color_code VARCHAR(10) DEFAULT NULL, 
  image_url VARCHAR(512) NOT NULL,     
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE product_sizes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  color_id INT NOT NULL,
  size ENUM('XS','S','M','L','XL','XXL') NOT NULL,
  stock INT DEFAULT 0 CHECK (stock >= 0), -- Tồn kho nằm ở đây mới chuẩn
  extra_price DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (color_id) REFERENCES product_colors(id) ON DELETE CASCADE
);

-- ==========================================
-- 3. BẢNG ĐẶT HÀNG & KHUYẾN MÃI
-- ==========================================

CREATE TABLE sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  discount_percent DECIMAL(5,2) NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  sale_id INT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
);

CREATE TABLE vouchers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_percent DECIMAL(5,2) CHECK (discount_percent >= 0 AND discount_percent <= 100),
  start_date DATE,
  end_date DATE,
  min_order_value DECIMAL(10,2) DEFAULT 0,
  applicable_category_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (applicable_category_id) REFERENCES categories(id)
);

CREATE TABLE orders (
   id INT AUTO_INCREMENT PRIMARY KEY,
   user_id INT DEFAULT NULL,   
   voucher_id INT DEFAULT NULL,
   total_price DECIMAL(10,2) DEFAULT 0 CHECK (total_price >= 0), 
   address TEXT NOT NULL,
   phone VARCHAR(20),
   name VARCHAR(255),
   status ENUM('Chờ xác nhận','Đã xác nhận','Đang giao hàng','Đã giao hàng','Đã hủy') DEFAULT 'Chờ xác nhận',
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
   FOREIGN KEY (voucher_id) REFERENCES vouchers(id)
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  color_id INT DEFAULT NULL,
  size_id INT DEFAULT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (color_id) REFERENCES product_colors(id),
  FOREIGN KEY (size_id) REFERENCES product_sizes(id)
);

CREATE TABLE banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_url VARCHAR(500) NOT NULL,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE revenues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_date DATE NOT NULL UNIQUE,
  total_sales DECIMAL(15,2) DEFAULT 0,
  total_orders INT DEFAULT 0
);

-- ==========================================
-- 4. DATA SEEDING (DỮ LIỆU MẪU)
-- ==========================================

-- Categories
INSERT INTO categories (id, name) VALUES 
(1, 'Áo sơ mi'), 
(2, 'Quần dài'), 
(3, 'Áo thun'), 
(4, 'Áo khoác/Hoodie'), 
(5, 'Quần Short');

-- Products (ĐÃ BỎ CỘT STOCK, THÊM GENDER)
INSERT INTO products (id, name, description, price, image_url, category_id, gender) VALUES
-- Male
(1, 'Áo sơ mi dễ mặc', 'Dáng ôm, vải chống nhăn, thoải mái suốt ngày', 150000, '/public/images/ao-so-mi-nam-white.png', 1, 'male'),
(2, 'Áo sơ mi nhẹ nhàng', 'Vải chống nhăn, kiểu dáng ôm, phù hợp mọi phong cách', 150000, '/public/images/ao-so-mi-nam-blue.png', 1, 'male'),
(3, 'Áo sơ mi cổ điển', 'Thiết kế ôm vừa, vải chống nhăn', 150000, '/public/images/ao-so-mi-nam-beige.png', 1, 'male'),
(4, 'Áo sơ mi hiện đại', 'Dễ mặc, vải chống nhăn, thoải mái khi di chuyển', 150000, '/public/images/ao-so-mi-nam-black.png', 1, 'male'),

(5, 'Quần chino năng động', 'Vải kaki co giãn nhẹ, thoáng mát và thoải mái', 320000, '/public/images/quan-chino-nam-beige.png', 2, 'male'),
(6, 'Quần chino trẻ trung', 'Co giãn nhẹ, thoải mái cho mọi hoạt động', 320000, '/public/images/quan-chino-nam-blue.png', 2, 'male'),
(7, 'Quần jean cổ điển', 'Chất vải thoáng mát, kiểu dáng phù hợp cho mọi mùa', 320000, '/public/images/quan-jean-nam-dark-gray.png', 2, 'male'),
(8, 'Quần jean thoải mái', 'Được thiết kế vừa vặn, dễ chịu cho cả ngày dài', 320000, '/public/images/quan-jean-nam-light-blue.png', 2, 'male'),

(9, 'Áo hoodie ấm áp', 'Nỉ bông mềm, giữ ấm tốt trong mọi thời tiết', 150000, '/public/images/ao-hoodie-nam-red.png', 4, 'male'),
(10, 'Áo hoodie phong cách', 'Nỉ bông siêu mềm, thoải mái, dễ dàng phối đồ', 150000, '/public/images/ao-hoodie-nam-green.png', 4, 'male'),
(11, 'Áo khoác gió có mũ năng động', 'Giữ ấm nhẹ nhàng, chất liệu chống gió', 150000, '/public/images/ao-khoac-nam-blue.png', 4, 'male'),
(12, 'Áo khoác gió có mũ trẻ trung', 'Chất liệu chống gió, dễ chịu cho mọi hoạt động', 150000, '/public/images/ao-khoac-nam-yellow.png', 4, 'male'),

-- Female
(13, 'Áo sơ mi nhẹ nhàng', 'Vải linen thoáng mát, dễ chịu suốt ngày dài', 280000, '/public/images/ao-so-mi-nu-white.png', 1, 'female'),
(14, 'Áo sơ mi tinh tế', 'Chất vải linen mát mẻ, thiết kế thanh lịch', 280000, '/public/images/ao-so-mi-nu-green.png', 1, 'female'),
(15, 'Áo sơ mi thoáng khí', 'Vải linen thoáng mát, dễ dàng mix đồ', 280000, '/public/images/ao-so-mi-nu-ke-soc-white.png', 1, 'female'),
(16, 'Áo sơ mi dễ mặc', 'Vải linen thoáng mát, phù hợp với mọi phong cách', 280000, '/public/images/ao-so-mi-nu-ke-soc-blue.png', 1, 'female'),

(17, 'Áo thun cổ tròn năng động', 'Dáng ôm nhẹ, chất liệu thoáng mát', 280000, '/public/images/ao-thun-co-tron-nu-blue.png', 3, 'female'),
(18, 'Áo thun cổ tròn trẻ trung', 'Dáng ôm nhẹ, mang lại sự thoải mái cả ngày', 280000, '/public/images/ao-thun-co-tron-nu-navy.png', 3, 'female'),
(19, 'Áo thun vải cotton đơn giản', 'Kiểu dáng ôm nhẹ, dễ dàng phối với nhiều trang phục', 280000, '/public/images/ao-thun-vai-cotton-nu-white.png', 3, 'female'),
(20, 'Áo thun vải cotton thanh lịch', 'Dáng ôm vừa, chất liệu mềm mại và thoải mái', 280000, '/public/images/ao-thun-vai-cotton-nu-black.png', 3, 'female'),

(21, 'Quần dài gear hiện đại', 'Vải mỏng nhẹ, thiết kế năng động cho mọi hoạt động', 450000, '/public/images/quan-dai-gear-nu-beige.png', 2, 'female'),
(22, 'Quần dài gear thoải mái', 'Chất liệu vải nhẹ, thích hợp cho những buổi dạo phố', 450000, '/public/images/quan-dai-gear-nu-green.png', 2, 'female'),
(23, 'Quần dệt kim nữ tính', 'Vải mỏng nhẹ, thiết kế thoải mái, phù hợp mọi tình huống', 450000, '/public/images/quan-det-kim-nu-gray.png', 2, 'female'),
(24, 'Quần dệt kim thanh lịch', 'Vải mỏng nhẹ, thiết kế năng động, phù hợp với nhiều phong cách', 450000, '/public/images/quan-det-kim-nu-khaki.png', 2, 'female'),

-- Unisex
(25, 'Áo thun tay ngắn basic', 'Chất cotton 100%, thấm hút mồ hôi, thoải mái cả ngày', 200000, '/public/images/ao-thun-tay-ngan-unisex-gray.png', 3, 'unisex'),
(26, 'Áo thun tay ngắn năng động', 'Cotton 100%, thoáng khí và thấm hút tốt', 200000, '/public/images/ao-thun-tay-ngan-unisex-dark-gray.png', 3, 'unisex'),
(27, 'Áo thun tay dài thoải mái', 'Chất liệu cotton 100%, mềm mại và thấm hút nhanh', 200000, '/public/images/ao-thun-tay-dai-unisex-blue.png', 3, 'unisex'),
(28, 'Áo thun tay dài basic', 'Cotton 100%, thiết kế đơn giản, thoáng mát', 200000, '/public/images/ao-thun-tay-dai-unisex-green.png', 3, 'unisex'),

(29, 'Quần dài ống suông tiện dụng', 'Vải mềm mại, thoải mái cho mọi giới tính', 250000, '/public/images/quan-dai-unisex-beige.png', 2, 'unisex'),
(30, 'Quần dài ống suông năng động', 'Chất liệu thoải mái, phù hợp cho mọi hoạt động', 250000, '/public/images/quan-dai-unisex-green.png', 2, 'unisex'),
(31, 'Quần jean dễ mặc', 'Thiết kế thoải mái, phù hợp cho tất cả các phong cách', 250000, '/public/images/quan-jean-unisex-blue.png', 2, 'unisex'),
(32, 'Quần jean thoải mái', 'Vải mềm, thoải mái cho mọi lúc, mọi nơi', 250000, '/public/images/quan-jean-unisex-black.png', 2, 'unisex'),

(33, 'Quần short thoải mái', 'Lưng thun mềm mại, thoáng mát cho mùa hè', 250000, '/public/images/quan-short-unisex-gray.png', 5, 'unisex'),
(34, 'Quần short dễ chịu', 'Lưng thun thoải mái, chất liệu bền bỉ', 250000, '/public/images/quan-short-unisex-white.png', 5, 'unisex'),
(35, 'Quần short phong cách', 'Lưng thun vừa vặn, chất liệu thoáng mát', 250000, '/public/images/quan-short-unisex-green.png', 5, 'unisex'),
(36, 'Quần short năng động', 'Lưng thun thoải mái, chất liệu dễ chịu', 250000, '/public/images/quan-short-unisex-navy.png', 5, 'unisex');

-- Product Colors
INSERT INTO product_colors (product_id, color_name, color_code, image_url) VALUES
-- Male
(1, 'Trắng', '#FFFFFF', '/public/images/ao-so-mi-nam-white.png'),
(1, 'Xanh da trời', '#87CEEB', '/public/images/ao-so-mi-nam-blue.png'),
(2, 'Trắng', '#FFFFFF', '/public/images/ao-so-mi-nam-white.png'),
(2, 'Xanh da trời', '#87CEEB', '/public/images/ao-so-mi-nam-blue.png'),
(3, 'Be', '#C3B091', '/public/images/ao-so-mi-nam-beige.png'),
(3, 'Đen', '#000000', '/public/images/ao-so-mi-nam-black.png'),
(4, 'Be', '#C3B091', '/public/images/ao-so-mi-nam-beige.png'),
(4, 'Đen', '#000000', '/public/images/ao-so-mi-nam-black.png'),
(5, 'Be', '#F5F5DC', '/public/images/quan-chino-nam-beige.png'),
(5, 'Xanh dương', '#0000FF', '/public/images/quan-chino-nam-blue.png'),
(6, 'Be', '#F5F5DC', '/public/images/quan-chino-nam-beige.png'),
(6, 'Xanh dương', '#0000FF', '/public/images/quan-chino-nam-blue.png'),
(7, 'Xanh trắng', '#e5ecf6', '/public/images/quan-jean-nam-light-blue.png'),
(7, 'Xám đậm', '#232227', '/public/images/quan-jean-nam-dark-gray.png'),
(8, 'Xanh trắng', '#e5ecf6', '/public/images/quan-jean-nam-light-blue.png'),
(8, 'Xám đậm', '#232227', '/public/images/quan-jean-nam-dark-gray.png'),
(9, 'Xanh lá', '#6f7c6b', '/public/images/ao-hoodie-nam-green.png'),
(9, 'Đỏ', '#d74d55', '/public/images/ao-hoodie-nam-red.png'),
(10, 'Xanh lá', '#6f7c6b', '/public/images/ao-hoodie-nam-green.png'),
(10, 'Đỏ', '#d74d55', '/public/images/ao-hoodie-nam-red.png'),
(11, 'Xanh dương', '#007bff', '/public/images/ao-khoac-nam-blue.png'),
(11, 'Vàng', '#d4a017', '/public/images/ao-khoac-nam-yellow.png'),
(12, 'Xanh dương', '#007bff', '/public/images/ao-khoac-nam-blue.png'),
(12, 'Vàng', '#d4a017', '/public/images/ao-khoac-nam-yellow.png'),

-- Female
(13, 'Trắng', '#FFFFFF', '/public/images/ao-so-mi-nu-white.png'),
(13, 'Xanh lá', '#A9E5BB', '/public/images/ao-so-mi-nu-green.png'),
(14, 'Trắng', '#FFFFFF', '/public/images/ao-so-mi-nu-white.png'),
(14, 'Xanh lá', '#A9E5BB', '/public/images/ao-so-mi-nu-green.png'),
(15, 'Trắng', '#FFFFFF', '/public/images/ao-so-mi-nu-ke-soc-white.png'),
(15, 'Xanh da trời', '#87CEEB', '/public/images/ao-so-mi-nu-ke-soc-blue.png'),
(16, 'Trắng', '#FFFFFF', '/public/images/ao-so-mi-nu-ke-soc-white.png'),
(16, 'Xanh da trời', '#87CEEB', '/public/images/ao-so-mi-nu-ke-soc-blue.png'),
(17, 'Xanh da trời', '#dce2f0', '/public/images/ao-thun-co-tron-nu-blue.png'),
(17, 'Xanh navy', '#2b3b5d', '/public/images/ao-thun-co-tron-nu-navy.png'),
(18, 'Xanh da trời', '#dce2f0', '/public/images/ao-thun-co-tron-nu-blue.png'),
(18, 'Xanh navy', '#2b3b5d', '/public/images/ao-thun-co-tron-nu-navy.png'),
(19, 'Trắng', '#FFFFFF', '/public/images/ao-thun-vai-cotton-nu-white.png'),
(19, 'Đen', '#000000', '/public/images/ao-thun-vai-cotton-nu-black.png'),
(20, 'Trắng', '#FFFFFF', '/public/images/ao-thun-vai-cotton-nu-white.png'),
(20, 'Đen', '#000000', '/public/images/ao-thun-vai-cotton-nu-black.png'),
(21, 'Be', '#F5F5DC', '/public/images/quan-dai-gear-nu-beige.png'),
(21, 'Xanh đậm', '#0A3D3B', '/public/images/quan-dai-gear-nu-green.png'),
(22, 'Be', '#F5F5DC', '/public/images/quan-dai-gear-nu-beige.png'),
(22, 'Xanh đậm', '#0A3D3B', '/public/images/quan-dai-gear-nu-green.png'),
(23, 'Be', '#b6a498', '/public/images/quan-det-kim-nu-khaki.png'),
(23, 'Xám', '#515055', '/public/images/quan-det-kim-nu-gray.png'),
(24, 'Be', '#b6a498', '/public/images/quan-det-kim-nu-khaki.png'),
(24, 'Xám', '#515055', '/public/images/quan-det-kim-nu-gray.png'),

-- Unisex
(25, 'Xám', '#c0c8d3', '/public/images/ao-thun-tay-ngan-unisex-gray.png'),
(25, 'Xám đậm', '#474b4e', '/public/images/ao-thun-tay-ngan-unisex-dark-gray.png'),
(26, 'Xám', '#c0c8d3', '/public/images/ao-thun-tay-ngan-unisex-gray.png'),
(26, 'Xám đậm', '#474b4e', '/public/images/ao-thun-tay-ngan-unisex-dark-gray.png'),
(27, 'Xanh đen', '#2c3546', '/public/images/ao-thun-tay-dai-unisex-blue.png'),
(27, 'Xanh lá', '#b3b6af', '/public/images/ao-thun-tay-dai-unisex-green.png'),
(28, 'Xanh đen', '#2c3546', '/public/images/ao-thun-tay-dai-unisex-blue.png'),
(28, 'Xanh lá', '#b3b6af', '/public/images/ao-thun-tay-dai-unisex-green.png'),
(29, 'Xanh lá', '#5a6151', '/public/images/quan-dai-unisex-green.png'),
(29, 'Be', '#cab99f', '/public/images/quan-dai-unisex-beige.png'),
(30, 'Xanh lá', '#5a6151', '/public/images/quan-dai-unisex-green.png'),
(30, 'Be', '#cab99f', '/public/images/quan-dai-unisex-beige.png'),
(31, 'Xanh dương', '#1B4F72', '/public/images/quan-jean-unisex-blue.png'),
(31, 'Đen', '#333333', '/public/images/quan-jean-unisex-black.png'),
(32, 'Xanh dương', '#1B4F72', '/public/images/quan-jean-unisex-blue.png'),
(32, 'Đen', '#333333', '/public/images/quan-jean-unisex-black.png'),
(33, 'Trắng', '#f1f0ee', '/public/images/quan-short-unisex-white.png'),
(33, 'Xám', '#646b7d', '/public/images/quan-short-unisex-gray.png'),
(34, 'Trắng', '#f1f0ee', '/public/images/quan-short-unisex-white.png'),
(34, 'Xám', '#646b7d', '/public/images/quan-short-unisex-gray.png'),
(35, 'Xanh lá', '#696C52', '/public/images/quan-short-unisex-green.png'),
(35, 'Xanh navy', '#2C3243', '/public/images/quan-short-unisex-navy.png'),
(36, 'Xanh lá', '#696C52', '/public/images/quan-short-unisex-green.png'),
(36, 'Xanh navy', '#2C3243', '/public/images/quan-short-unisex-navy.png');

-- Product Sizes (ĐÂY LÀ NƠI CHỨA STOCK THỰC TẾ)
INSERT INTO product_sizes (color_id, size, stock) VALUES 
(1, 'S', 10),(1, 'M', 20),(1, 'L', 15),
(2, 'S', 8),(2, 'M', 18),(2, 'L', 12),
(3, 'S', 10),(3, 'M', 15),(3, 'L', 12),
(4, 'S', 5),(4, 'M', 8),(4, 'L', 10),
(5, 'S', 10),(5, 'M', 8),(5, 'L', 5),
(6, 'S', 12),(6, 'M', 10),(6, 'L', 6),
(7, 'S', 7),(7, 'M', 14),(7, 'L', 9),
(8, 'S', 6),(8, 'M', 12),(8, 'L', 8),
(9, 'S', 15), (9, 'M', 20), (9, 'L', 10),
(10, 'S', 12), (10, 'M', 18), (10, 'L', 10), 
(11, 'S', 10), (11, 'M', 15), (11, 'L', 12), 
(12, 'S', 8), (12, 'M', 12), (12, 'L', 10),
(13, 'S', 10), (13, 'M', 20), (13, 'L', 15),
(14, 'S', 8), (14, 'M', 18), (14, 'L', 12),
(15, 'S', 8), (15, 'M', 15), (15, 'L', 12),
(16, 'S', 6), (16, 'M', 12), (16, 'L', 10),
(17, 'S', 10), (17, 'M', 15), (17, 'L', 10),
(18, 'S', 8), (18, 'M', 14), (18, 'L', 12),
(19, 'S', 7), (19, 'M', 14), (19, 'L', 10),
(20, 'S', 5), (20, 'M', 10), (20, 'L', 8),
(21, 'S', 10), (21, 'M', 15), (21, 'L', 12),
(22, 'S', 8), (22, 'M', 12), (22, 'L', 10),
(23, 'S', 12), (23, 'M', 10), (23, 'L', 8),
(24, 'S', 10), (24, 'M', 14), (24, 'L', 10),
(25, 'S', 10),(25, 'M', 20),(25, 'L', 15),
(26, 'S', 8),(26, 'M', 18),(26, 'L', 12),
(27, 'S', 10),(27, 'M', 15),(27, 'L', 12),
(28, 'S', 5),(28, 'M', 8),(28, 'L', 10),
(29, 'S', 10),(29, 'M', 8),(29, 'L', 5),
(30, 'S', 12),(30, 'M', 10),(30, 'L', 6),
(31, 'S', 7),(31, 'M', 14),(31, 'L', 9),
(32, 'S', 6),(32, 'M', 12),(32, 'L', 8),
(33, 'S', 15), (33, 'M', 20), (33, 'L', 10),
(34, 'S', 12), (34, 'M', 18), (34, 'L', 10), 
(35, 'S', 10), (35, 'M', 15), (35, 'L', 12), 
(36, 'S', 8), (36, 'M', 12), (36, 'L', 10),
(37, 'S', 10), (37, 'M', 20), (37, 'L', 15),
(38, 'S', 8), (38, 'M', 18), (38, 'L', 12),
(39, 'S', 10), (39, 'M', 15), (39, 'L', 12),
(40, 'S', 5), (40, 'M', 8), (40, 'L', 10),
(41, 'S', 10), (41, 'M', 8), (41, 'L', 5),
(42, 'S', 12), (42, 'M', 10), (42, 'L', 6),
(43, 'S', 7), (43, 'M', 14), (43, 'L', 9),
(44, 'S', 6), (44, 'M', 12), (44, 'L', 8),
(45, 'S', 15), (45, 'M', 20), (45, 'L', 10),
(46, 'S', 12), (46, 'M', 18), (46, 'L', 10),
(47, 'S', 10), (47, 'M', 15), (47, 'L', 12),
(48, 'S', 8), (48, 'M', 12), (48, 'L', 10),
(49, 'S', 10), (49, 'M', 20), (49, 'L', 15),
(50, 'S', 8), (50, 'M', 18), (50, 'L', 12),
(51, 'S', 8), (51, 'M', 15), (51, 'L', 12),
(52, 'S', 6), (52, 'M', 12), (52, 'L', 10),
(53, 'S', 10), (53, 'M', 15), (53, 'L', 10),
(54, 'S', 8), (54, 'M', 14), (54, 'L', 12),
(55, 'S', 7), (55, 'M', 14), (55, 'L', 10),
(56, 'S', 5), (56, 'M', 10), (56, 'L', 8),
(57, 'S', 10), (57, 'M', 15), (57, 'L', 12),
(58, 'S', 8), (58, 'M', 12), (58, 'L', 10),
(59, 'S', 12), (59, 'M', 10), (59, 'L', 8),
(60, 'S', 10), (60, 'M', 14), (60, 'L', 10),
(61, 'S', 10), (61, 'M', 20), (61, 'L', 15),
(62, 'S', 8), (62, 'M', 18), (62, 'L', 12),
(63, 'S', 10), (63, 'M', 15), (63, 'L', 12),
(64, 'S', 5), (64, 'M', 8), (64, 'L', 10),
(65, 'S', 10), (65, 'M', 8), (65, 'L', 5),
(66, 'S', 12), (66, 'M', 10), (66, 'L', 6),
(67, 'S', 7), (67, 'M', 14), (67, 'L', 9),
(68, 'S', 6), (68, 'M', 12), (68, 'L', 8),
(69, 'S', 15), (69, 'M', 20), (69, 'L', 10),
(70, 'S', 12), (70, 'M', 18), (70, 'L', 10),
(71, 'S', 10), (71, 'M', 15), (71, 'L', 12),
(72, 'S', 8), (72, 'M', 12), (72, 'L', 10);

-- Banners
INSERT INTO banners (image_url, title, subtitle) VALUES
('/public/images/banner1.png', 'Chào mừng đến Clothing Shop', 'Bộ sưu tập mới nhất đã có mặt – Giảm giá đến 50% hôm nay!'),
('/public/images/banner2.png', 'Phong cách mới mỗi ngày', 'Khám phá các mẫu áo quần hot trend'),
('/public/images/banner3.png', 'Hàng mới về mỗi tuần', 'Cập nhật liên tục – đừng bỏ lỡ xu hướng mới nhất'),
('/public/images/banner4.png', 'Ưu đãi đặc biệt cuối tuần', 'Giảm thêm 20% cho đơn hàng đầu tiên – Mua ngay hôm nay!');
