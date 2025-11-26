const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// 1. Đã thêm updateUserPhone vào đây
const { createUser, findUserByIdentifier, updateUserPhone } = require("../models/userModel");
const pool = require("../db");

async function register(req, res) {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const [existingEmail] = await pool.query(
      "SELECT id FROM users WHERE email = ?",[email]
    );
    if (existingEmail.length > 0) {
      return res.status(400).json({ message: "Email đã được đăng ký" });
    }

    const [existingPhone] = await pool.query(
      "SELECT id FROM users WHERE phone = ?",[phone]
    );
    if (existingPhone.length > 0) {
      return res.status(400).json({ message: "Số điện thoại đã được sử dụng" });
    }

    const userId = await createUser(name, email, phone, password, "customer");

    res.status(201).json({
      message: "Đăng ký thành công",
      id: userId,
      email,
    });
  } catch (err) {
    console.error("❌ Lỗi khi đăng ký:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Vui lòng nhập email/sđt và mật khẩu" });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return res.status(401).json({ message: "Tài khoản hoặc mật khẩu không đúng" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Tài khoản hoặc mật khẩu không đúng" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Đăng nhập thành công",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("❌ Lỗi khi đăng nhập:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

const updateProfile = async (req, res) => {
  const { phone } = req.body;
  const userId = req.user.id;

  try {
    if (!phone) {
      return res.status(400).json({ message: "Vui lòng nhập số điện thoại" });
    }

    // 2. Gọi hàm trực tiếp (không dùng User.)
    await updateUserPhone(userId, phone);

    res.status(200).json({
      message: "Cập nhật thông tin thành công!",
      user: {
        ...req.user,
        phone: phone
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi cập nhật profile" });
  }
};

module.exports = {
  register,
  login,
  updateProfile
};
