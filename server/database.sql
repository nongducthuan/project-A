DROP DATABASE IF EXISTS shopdb;
CREATE DATABASE shopdb;
USE shopdb;

-- ===============================================================
-- 1. MEMBERSHIPS
-- ===============================================================
CREATE TABLE memberships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  min_spending DECIMAL(10,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0
);

-- ===============================================================
-- 2. USERS
-- ===============================================================
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

-- ===============================================================
-- 3. CATEGORIES (NÂNG CẤP THEO YÊU CẦU)
-- ===============================================================
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  gender ENUM('male','female','unisex') DEFAULT 'unisex',
  image_url VARCHAR(512) NULL
);

-- ===============================================================
-- 4. PRODUCTS
-- ===============================================================
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  sale_percent DECIMAL(5,2) DEFAULT 0 CHECK (sale_percent BETWEEN 0 AND 100),
  image_url VARCHAR(512),
  gender ENUM('male','female','unisex') NOT NULL DEFAULT 'unisex',
  category_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- ===============================================================
-- 5. PRODUCT COLORS
-- ===============================================================
CREATE TABLE product_colors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  color_name VARCHAR(50) NOT NULL,
  color_code VARCHAR(10) DEFAULT NULL,
  image_url VARCHAR(512) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ===============================================================
-- 6. PRODUCT SIZES (STOCK)
-- ===============================================================
CREATE TABLE product_sizes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  color_id INT NOT NULL,
  size ENUM('XS','S','M','L','XL','XXL') NOT NULL,
  stock INT DEFAULT 0 CHECK (stock >= 0),
  extra_price DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (color_id) REFERENCES product_colors(id) ON DELETE CASCADE
);

-- ===============================================================
-- 7. SALES + VOUCHERS
-- ===============================================================
CREATE TABLE sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  discount_percent DECIMAL(5,2) NOT NULL CHECK (discount_percent BETWEEN 0 AND 100),
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
  discount_percent DECIMAL(5,2) CHECK (discount_percent BETWEEN 0 AND 100),
  start_date DATE,
  end_date DATE,
  min_order_value DECIMAL(10,2) DEFAULT 0,
  applicable_category_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (applicable_category_id) REFERENCES categories(id)
);

-- ===============================================================
-- 8. ORDERS
-- ===============================================================
CREATE TABLE orders (
   id INT AUTO_INCREMENT PRIMARY KEY,
   user_id INT DEFAULT NULL,
   voucher_id INT DEFAULT NULL,
   total_price DECIMAL(10,2) DEFAULT 0 CHECK (total_price >= 0),
   address TEXT NOT NULL,
   phone VARCHAR(20),
   name VARCHAR(255),
   status ENUM('Pending','Confirmed','Shipping','Delivered','Cancelled') DEFAULT 'Pending',
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

-- ===============================================================
-- 9. BANNERS
-- ===============================================================
CREATE TABLE banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_url VARCHAR(500) NOT NULL,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================================
-- 10. REVENUE REPORTS
-- ===============================================================
CREATE TABLE revenues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_date DATE NOT NULL UNIQUE,
  total_sales DECIMAL(15,2) DEFAULT 0,
  total_orders INT DEFAULT 0
);


-- ===============================================================
-- 11. SEED CATEGORIES 
-- ===============================================================
INSERT INTO categories (id, name, gender, image_url) VALUES
-- MEN
(1, 'Shirt', 'male', NULL),
(2, 'Trousers/Pants', 'male', NULL),
(3, 'Jacket/Hoodie', 'male', NULL),

-- WOMEN
(4, 'Shirt', 'female', NULL),
(5, 'T-shirt', 'female', NULL),
(6, 'Trousers/Pants', 'female', NULL),

-- UNISEX
(7, 'T-shirt', 'unisex', NULL),
(8, 'Trousers/Pants', 'unisex', NULL),
(9, 'Shorts', 'unisex', NULL);


-- ===============================================================
-- 12. SEED PRODUCTS — FULL (COPY TỪ FILE GỐC CỦA BẠN)
-- ===============================================================

INSERT INTO products (id, name, description, price, image_url, category_id, gender) VALUES

-- =========================
-- MEN (male)
-- category_id = 1 (Shirt)
-- =========================
(1, 'Easy-Wear Shirt', 'Slim fit, wrinkle-resistant fabric, comfortable all day long', 150000, '/public/images/ao-so-mi-nam-white.png', 1, 'male'),
(2, 'Lightweight Shirt', 'Wrinkle-resistant fabric, slim fit, suitable for all styles', 150000, '/public/images/ao-so-mi-nam-blue.png', 1, 'male'),
(3, 'Classic Shirt', 'Regular fit design, wrinkle-resistant fabric', 150000, '/public/images/ao-so-mi-nam-beige.png', 1, 'male'),
(4, 'Modern Shirt', 'Easy to wear, wrinkle-resistant fabric, comfortable for movement', 150000, '/public/images/ao-so-mi-nam-black.png', 1, 'male'),

-- category_id = 2 (Trousers/Pants)
(5, 'Active Chino Pants', 'Light stretch khaki fabric, cool and comfortable', 320000, '/public/images/quan-chino-nam-beige.png', 2, 'male'),
(6, 'Youthful Chino Pants', 'Light stretch, comfortable for all activities', 320000, '/public/images/quan-chino-nam-blue.png', 2, 'male'),
(7, 'Classic Jeans', 'Cool fabric, style suitable for all seasons', 320000, '/public/images/quan-jean-nam-dark-gray.png', 2, 'male'),
(8, 'Comfortable Jeans', 'Designed to fit well, comfortable for the whole day', 320000, '/public/images/quan-jean-nam-light-blue.png', 2, 'male'),

-- category_id = 3 (Jacket/Hoodie)
(9, 'Warm Hoodie', 'Soft fleece, provides good warmth in all weather', 150000, '/public/images/ao-hoodie-nam-red.png', 3, 'male'),
(10, 'Stylish Hoodie', 'Super soft fleece, comfortable, easy to mix and match', 150000, '/public/images/ao-hoodie-nam-green.png', 3, 'male'),
(11, 'Active Hooded Windbreaker', 'Light warming, windproof material', 150000, '/public/images/ao-khoac-nam-blue.png', 3, 'male'),
(12, 'Youthful Hooded Windbreaker', 'Windproof material, comfortable for all activities', 150000, '/public/images/ao-khoac-nam-yellow.png', 3, 'male'),

-- =========================
-- WOMEN (female)
-- =========================
-- category_id = 4 (Shirt)
(13, 'Lightweight Shirt', 'Cool linen fabric, comfortable all day long', 280000, '/public/images/ao-so-mi-nu-white.png', 4, 'female'),
(14, 'Elegant Shirt', 'Cool linen fabric, elegant design', 280000, '/public/images/ao-so-mi-nu-green.png', 4, 'female'),
(15, 'Breathable Shirt', 'Cool linen fabric, easy to mix and match', 280000, '/public/images/ao-so-mi-nu-ke-soc-white.png', 4, 'female'),
(16, 'Easy-Wear Shirt', 'Cool linen fabric, suitable for all styles', 280000, '/public/images/ao-so-mi-nu-ke-soc-blue.png', 4, 'female'),

-- category_id = 5 (T-shirt)
(17, 'Active Crew Neck T-shirt', 'Slightly fitted, breathable material', 280000, '/public/images/ao-thun-co-tron-nu-blue.png', 5, 'female'),
(18, 'Youthful Crew Neck T-shirt', 'Slightly fitted, provides comfort all day long', 280000, '/public/images/ao-thun-co-tron-nu-navy.png', 5, 'female'),
(19, 'Simple Cotton T-shirt', 'Slightly fitted style, easy to pair with various outfits', 280000, '/public/images/ao-thun-vai-cotton-nu-white.png', 5, 'female'),
(20, 'Elegant Cotton T-shirt', 'Regular fit, soft and comfortable material', 280000, '/public/images/ao-thun-vai-cotton-nu-black.png', 5, 'female'),

-- category_id = 6 (Trousers/Pants)
(21, 'Modern Gear Pants', 'Thin, light fabric, active design for all activities', 450000, '/public/images/quan-dai-gear-nu-beige.png', 6, 'female'),
(22, 'Comfortable Gear Pants', 'Light fabric material, suitable for outings', 450000, '/public/images/quan-dai-gear-nu-green.png', 6, 'female'),
(23, 'Feminine Knit Pants', 'Thin, light fabric, comfortable design, suitable for all situations', 450000, '/public/images/quan-det-kim-nu-gray.png', 6, 'female'),
(24, 'Elegant Knit Pants', 'Thin, light fabric, active design, suitable for various styles', 450000, '/public/images/quan-det-kim-nu-khaki.png', 6, 'female'),

-- =========================
-- UNISEX
-- =========================
-- category_id = 7 (T-shirt)
(25, 'Basic Short Sleeve T-shirt', '100% cotton fabric, sweat-absorbent, comfortable all day', 200000, '/public/images/ao-thun-tay-ngan-unisex-gray.png', 7, 'unisex'),
(26, 'Active Short Sleeve T-shirt', '100% cotton, breathable and good absorption', 200000, '/public/images/ao-thun-tay-ngan-unisex-dark-gray.png', 7, 'unisex'),
(27, 'Comfortable Long Sleeve T-shirt', '100% cotton material, soft and fast-absorbing', 200000, '/public/images/ao-thun-tay-dai-unisex-blue.png', 7, 'unisex'),
(28, 'Basic Long Sleeve T-shirt', '100% cotton, simple design, cool and breathable', 200000, '/public/images/ao-thun-tay-dai-unisex-green.png', 7, 'unisex'),

-- category_id = 8 (Trousers/Pants)
(29, 'Practical Wide Leg Pants', 'Soft fabric, comfortable for all genders', 250000, '/public/images/quan-dai-unisex-beige.png', 8, 'unisex'),
(30, 'Active Wide Leg Pants', 'Comfortable material, suitable for all activities', 250000, '/public/images/quan-dai-unisex-green.png', 8, 'unisex'),
(31, 'Easy-Wear Jeans', 'Comfortable design, suitable for all styles', 250000, '/public/images/quan-jean-unisex-blue.png', 8, 'unisex'),
(32, 'Comfortable Jeans', 'Soft fabric, comfortable anytime, anywhere', 250000, '/public/images/quan-jean-unisex-black.png', 8, 'unisex'),

-- category_id = 9 (Shorts)
(33, 'Comfortable Shorts', 'Soft elastic waistband, cool for summer', 250000, '/public/images/quan-short-unisex-gray.png', 9, 'unisex'),
(34, 'Easy-Wear Shorts', 'Comfortable elastic waistband, durable material', 250000, '/public/images/quan-short-unisex-white.png', 9, 'unisex'),
(35, 'Stylish Shorts', 'Well-fitted elastic waistband, breathable material', 250000, '/public/images/quan-short-unisex-green.png', 9, 'unisex'),
(36, 'Active Shorts', 'Comfortable elastic waistband, pleasant material', 250000, '/public/images/quan-short-unisex-navy.png', 9, 'unisex');

-- Check pagination
INSERT INTO products (id, name, description, price, image_url, category_id, gender) VALUES
(37, 'Striped Shirt', 'Sophisticated striped pattern, modern office style', 150000, '/public/images/ao-so-mi-nam-stripe.png', 1, 'male'),
(38, 'Smoky Gray Shirt', 'Neutral gray color, easy to pair with dress pants', 150000, '/public/images/ao-so-mi-nam-grey.png', 1, 'male'),
(39, 'Navy Blue Shirt', 'Masculine navy blue color, absorbent cotton fabric', 150000, '/public/images/ao-so-mi-nam-navy.png', 1, 'male'),
(40, 'Linen Fabric Shirt', 'Cool linen material, suitable for summer', 150000, '/public/images/ao-so-mi-nam-linen.png', 1, 'male'),
(41, 'Short Sleeve Shirt', 'Active and youthful short-sleeve design', 150000, '/public/images/ao-so-mi-nam-short.png', 1, 'male'),
(42, 'Denim Shirt', 'Dusty style, personal and strong character', 150000, '/public/images/ao-so-mi-nam-denim.png', 1, 'male');

-- ===============================================================
-- 13. SEED PRODUCT COLORS (FULL)
-- ===============================================================

INSERT INTO product_colors (product_id, color_name, color_code, image_url) VALUES
(1, 'White', '#FFFFFF', '/public/images/ao-so-mi-nam-white.png'),
(1, 'Sky Blue', '#87CEEB', '/public/images/ao-so-mi-nam-blue.png'),

(2, 'White', '#FFFFFF', '/public/images/ao-so-mi-nam-white.png'),
(2, 'Sky Blue', '#87CEEB', '/public/images/ao-so-mi-nam-blue.png'),

(3, 'Beige', '#C3B091', '/public/images/ao-so-mi-nam-beige.png'),
(3, 'Black', '#000000', '/public/images/ao-so-mi-nam-black.png'),

(4, 'Beige', '#C3B091', '/public/images/ao-so-mi-nam-beige.png'),
(4, 'Black', '#000000', '/public/images/ao-so-mi-nam-black.png'),

(5, 'Beige', '#F5F5DC', '/public/images/quan-chino-nam-beige.png'),
(5, 'Blue', '#0000FF', '/public/images/quan-chino-nam-blue.png'),

(6, 'Beige', '#F5F5DC', '/public/images/quan-chino-nam-beige.png'),
(6, 'Blue', '#0000FF', '/public/images/quan-chino-nam-blue.png'),

(7, 'Light Blue', '#e5ecf6', '/public/images/quan-jean-nam-light-blue.png'),
(7, 'Dark Gray', '#232227', '/public/images/quan-jean-nam-dark-gray.png'),

(8, 'Light Blue', '#e5ecf6', '/public/images/quan-jean-nam-light-blue.png'),
(8, 'Dark Gray', '#232227', '/public/images/quan-jean-nam-dark-gray.png'),

(9, 'Green', '#6f7c6b', '/public/images/ao-hoodie-nam-green.png'),
(9, 'Red', '#d74d55', '/public/images/ao-hoodie-nam-red.png'),

(10, 'Green', '#6f7c6b', '/public/images/ao-hoodie-nam-green.png'),
(10, 'Red', '#d74d55', '/public/images/ao-hoodie-nam-red.png'),

(11, 'Blue', '#007bff', '/public/images/ao-khoac-nam-blue.png'),
(11, 'Yellow', '#d4a017', '/public/images/ao-khoac-nam-yellow.png'),

(12, 'Blue', '#007bff', '/public/images/ao-khoac-nam-blue.png'),
(12, 'Yellow', '#d4a017', '/public/images/ao-khoac-nam-yellow.png'),

(13, 'White', '#FFFFFF', '/public/images/ao-so-mi-nu-white.png'),
(13, 'Green', '#A9E5BB', '/public/images/ao-so-mi-nu-green.png'),

(14, 'White', '#FFFFFF', '/public/images/ao-so-mi-nu-white.png'),
(14, 'Green', '#A9E5BB', '/public/images/ao-so-mi-nu-green.png'),

(15, 'White', '#FFFFFF', '/public/images/ao-so-mi-nu-ke-soc-white.png'),
(15, 'Sky Blue', '#87CEEB', '/public/images/ao-so-mi-nu-ke-soc-blue.png'),

(16, 'White', '#FFFFFF', '/public/images/ao-so-mi-nu-ke-soc-white.png'),
(16, 'Sky Blue', '#87CEEB', '/public/images/ao-so-mi-nu-ke-soc-blue.png'),

(17, 'Sky Blue', '#dce2f0', '/public/images/ao-thun-co-tron-nu-blue.png'),
(17, 'Navy', '#2b3b5d', '/public/images/ao-thun-co-tron-nu-navy.png'),

(18, 'Sky Blue', '#dce2f0', '/public/images/ao-thun-co-tron-nu-blue.png'),
(18, 'Navy', '#2b3b5d', '/public/images/ao-thun-co-tron-nu-navy.png'),

(19, 'White', '#FFFFFF', '/public/images/ao-thun-vai-cotton-nu-white.png'),
(19, 'Black', '#000000', '/public/images/ao-thun-vai-cotton-nu-black.png'),

(20, 'White', '#FFFFFF', '/public/images/ao-thun-vai-cotton-nu-white.png'),
(20, 'Black', '#000000', '/public/images/ao-thun-vai-cotton-nu-black.png'),

(21, 'Beige', '#F5F5DC', '/public/images/quan-dai-gear-nu-beige.png'),
(21, 'Dark Green', '#0A3D3B', '/public/images/quan-dai-gear-nu-green.png'),

(22, 'Beige', '#F5F5DC', '/public/images/quan-dai-gear-nu-beige.png'),
(22, 'Dark Green', '#0A3D3B', '/public/images/quan-dai-gear-nu-green.png'),

(23, 'Beige', '#b6a498', '/public/images/quan-det-kim-nu-khaki.png'),
(23, 'Gray', '#515055', '/public/images/quan-det-kim-nu-gray.png'),

(24, 'Beige', '#b6a498', '/public/images/quan-det-kim-nu-khaki.png'),
(24, 'Gray', '#515055', '/public/images/quan-det-kim-nu-gray.png'),

(25, 'Gray', '#c0c8d3', '/public/images/ao-thun-tay-ngan-unisex-gray.png'),
(25, 'Dark Gray', '#474b4e', '/public/images/ao-thun-tay-ngan-unisex-dark-gray.png'),

(26, 'Gray', '#c0c8d3', '/public/images/ao-thun-tay-ngan-unisex-gray.png'),
(26, 'Dark Gray', '#474b4e', '/public/images/ao-thun-tay-ngan-unisex-dark-gray.png'),

(27, 'Dark Blue', '#2c3546', '/public/images/ao-thun-tay-dai-unisex-blue.png'),
(27, 'Light Green', '#b3b6af', '/public/images/ao-thun-tay-dai-unisex-green.png'),

(28, 'Dark Blue', '#2c3546', '/public/images/ao-thun-tay-dai-unisex-blue.png'),
(28, 'Light Green', '#b3b6af', '/public/images/ao-thun-tay-dai-unisex-green.png'),

(29, 'Green', '#5a6151', '/public/images/quan-dai-unisex-green.png'),
(29, 'Beige', '#cab99f', '/public/images/quan-dai-unisex-beige.png'),

(30, 'Green', '#5a6151', '/public/images/quan-dai-unisex-green.png'),
(30, 'Beige', '#cab99f', '/public/images/quan-dai-unisex-beige.png'),

(31, 'Blue', '#1B4F72', '/public/images/quan-jean-unisex-blue.png'),
(31, 'Black', '#333333', '/public/images/quan-jean-unisex-black.png'),

(32, 'Blue', '#1B4F72', '/public/images/quan-jean-unisex-blue.png'),
(32, 'Black', '#333333', '/public/images/quan-jean-unisex-black.png'),

(33, 'White', '#f1f0ee', '/public/images/quan-short-unisex-white.png'),
(33, 'Gray', '#646b7d', '/public/images/quan-short-unisex-gray.png'),

(34, 'White', '#f1f0ee', '/public/images/quan-short-unisex-white.png'),
(34, 'Gray', '#646b7d', '/public/images/quan-short-unisex-gray.png'),

(35, 'Green', '#696C52', '/public/images/quan-short-unisex-green.png'),
(35, 'Navy', '#2C3243', '/public/images/quan-short-unisex-navy.png'),

(36, 'Green', '#696C52', '/public/images/quan-short-unisex-green.png'),
(36, 'Navy', '#2C3243', '/public/images/quan-short-unisex-navy.png');

-- ===============================================================
-- 14. SEED PRODUCT SIZES (FULL)
-- ===============================================================

INSERT INTO product_sizes (color_id, size, stock) VALUES
(1, 'S', 10),(1, 'M', 20),(1, 'L', 15),
(2, 'S', 8),(2, 'M', 18),(2, 'L', 12),

(3, 'S', 10),(3, 'M', 15),(3, 'L', 12),
(4, 'S', 5),(4, 'M', 8),(4, 'L', 10),

(5, 'S', 10),(5, 'M', 8),(5, 'L', 5),
(6, 'S', 12),(6, 'M', 10),(6, 'L', 6),

(7, 'S', 7),(7, 'M', 14),(7, 'L', 9),
(8, 'S', 6),(8, 'M', 12),(8, 'L', 8),

(9, 'S', 15),(9, 'M', 20),(9, 'L', 10),
(10, 'S', 12),(10, 'M', 18),(10, 'L', 10),

(11, 'S', 10),(11, 'M', 15),(11, 'L', 12),
(12, 'S', 8),(12, 'M', 12),(12, 'L', 10),

(13, 'S', 10),(13, 'M', 20),(13, 'L', 15),
(14, 'S', 8),(14, 'M', 18),(14, 'L', 12),

(15, 'S', 8),(15, 'M', 15),(15, 'L', 12),
(16, 'S', 6),(16, 'M', 12),(16, 'L', 10),

(17, 'S', 10),(17, 'M', 15),(17, 'L', 10),
(18, 'S', 8),(18, 'M', 14),(18, 'L', 12),

(19, 'S', 7),(19, 'M', 14),(19, 'L', 10),
(20, 'S', 5),(20, 'M', 10),(20, 'L', 8),

(21, 'S', 10),(21, 'M', 15),(21, 'L', 12),
(22, 'S', 8),(22, 'M', 12),(22, 'L', 10),

(23, 'S', 12),(23, 'M', 10),(23, 'L', 8),
(24, 'S', 10),(24, 'M', 14),(24, 'L', 10),

(25, 'S', 10),(25, 'M', 20),(25, 'L', 15),
(26, 'S', 8),(26, 'M', 18),(26, 'L', 12),

(27, 'S', 10),(27, 'M', 15),(27, 'L', 12),
(28, 'S', 5),(28, 'M', 8),(28, 'L', 10),

(29, 'S', 10),(29, 'M', 8),(29, 'L', 5),
(30, 'S', 12),(30, 'M', 10),(30, 'L', 6),

(31, 'S', 7),(31, 'M', 14),(31, 'L', 9),
(32, 'S', 6),(32, 'M', 12),(32, 'L', 8),

(33, 'S', 15),(33, 'M', 20),(33, 'L', 10),
(34, 'S', 12),(34, 'M', 18),(34, 'L', 10),

(35, 'S', 10),(35, 'M', 15),(35, 'L', 12),
(36, 'S', 8),(36, 'M', 12),(36, 'L', 10),

(37, 'S', 10),(37, 'M', 20),(37, 'L', 15),
(38, 'S', 8),(38, 'M', 18),(38, 'L', 12),

(39, 'S', 10),(39, 'M', 15),(39, 'L', 12),
(40, 'S', 5),(40, 'M', 8),(40, 'L', 10),

(41, 'S', 10),(41, 'M', 8),(41, 'L', 5),
(42, 'S', 12),(42, 'M', 10),(42, 'L', 6),

(43, 'S', 7),(43, 'M', 14),(43, 'L', 9),
(44, 'S', 6),(44, 'M', 12),(44, 'L', 8),

(45, 'S', 15),(45, 'M', 20),(45, 'L', 10),
(46, 'S', 12),(46, 'M', 18),(46, 'L', 10),

(47, 'S', 10),(47, 'M', 15),(47, 'L', 12),
(48, 'S', 8),(48, 'M', 12),(48, 'L', 10),

(49, 'S', 10),(49, 'M', 20),(49, 'L', 15),
(50, 'S', 8),(50, 'M', 18),(50, 'L', 12),

(51, 'S', 8),(51, 'M', 15),(51, 'L', 12),
(52, 'S', 6),(52, 'M', 12),(52, 'L', 10),
(53, 'S', 10),(53, 'M', 15),(53, 'L', 10),
(54, 'S', 8),(54, 'M', 14),(54, 'L', 12),

(55, 'S', 7),(55, 'M', 14),(55, 'L', 10),
(56, 'S', 5),(56, 'M', 10),(56, 'L', 8),

(57, 'S', 10),(57, 'M', 15),(57, 'L', 12),
(58, 'S', 8),(58, 'M', 12),(58, 'L', 10),

(59, 'S', 12),(59, 'M', 10),(59, 'L', 8),
(60, 'S', 10),(60, 'M', 14),(60, 'L', 10),

(61, 'S', 10),(61, 'M', 20),(61, 'L', 15),
(62, 'S', 8),(62, 'M', 18),(62, 'L', 12),

(63, 'S', 10),(63, 'M', 15),(63, 'L', 12),
(64, 'S', 5),(64, 'M', 8),(64, 'L', 10),

(65, 'S', 10),(65, 'M', 8),(65, 'L', 5),
(66, 'S', 12),(66, 'M', 10),(66, 'L', 6),

(67, 'S', 7),(67, 'M', 14),(67, 'L', 9),
(68, 'S', 6),(68, 'M', 12),(68, 'L', 8),

(69, 'S', 15),(69, 'M', 20),(69, 'L', 10),
(70, 'S', 12),(70, 'M', 18),(70, 'L', 10),

(71, 'S', 10),(71, 'M', 15),(71, 'L', 12),
(72, 'S', 8),(72, 'M', 12),(72, 'L', 10);

-- ===============================================================
-- 15. SEED BANNERS
-- ===============================================================

INSERT INTO banners (image_url, title, subtitle) VALUES
('/public/images/banner1.png', 'Welcome to Clothing Shop', 'The latest collection is here – Up to 50% off today!'),
('/public/images/banner2.png', 'New Style Every Day', 'Discover the hottest trending clothing models'),
('/public/images/banner3.png', 'New Arrivals Every Week', 'Continuously updated – don\'t miss the latest trends'),
('/public/images/banner4.png', 'Special Weekend Offer', 'Get an extra 20% off your first order – Shop now!');