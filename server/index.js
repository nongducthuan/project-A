require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const pool = require('./src/db'); // Đảm bảo đường dẫn đúng tới db.js

// Import các routes
const productsRouter = require('./src/routes/productRoute');
const authRouter = require('./src/routes/authRoute');
const ordersRouter = require('./src/routes/orderRoute');
const adminRouter = require('./src/routes/adminRoute');
const categoryRouter = require('./src/routes/categoryRoute');
const uploadRouter = require('./src/routes/uploadRoute'); // ✅ 1. Import route upload

const app = express();

app.use(cors({
  origin: "http://localhost:5173", // Link frontend của bạn
  credentials: true,
}));
app.use(express.json());

// ✅ 2. Cho phép truy cập thư mục ảnh công khai
app.use('/public', express.static(path.join(__dirname, 'public')));

// ✅ 3. Đăng ký các đường dẫn API
app.use('/products', productsRouter);
app.use('/auth', authRouter);
app.use('/orders', ordersRouter);
app.use('/admin', adminRouter);
app.use('/categories', categoryRouter);
app.use('/upload', uploadRouter); // ✅ Quan trọng: Route này để upload ảnh

// Route test banner (nếu cần)
app.get('/banners', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM banners ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
