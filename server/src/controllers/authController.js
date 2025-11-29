const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// 1. Added updateUserPhone here
const {
  createUser,
  findUserByIdentifier,
  updateUserPhone,
} = require("../models/userModel");
const pool = require("../db");

async function register(req, res) {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Please enter all required information" }); // Changed
    }

    const [existingEmail] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existingEmail.length > 0) {
      return res.status(400).json({ message: "Email is already registered" }); // Changed
    }

    const [existingPhone] = await pool.query(
      "SELECT id FROM users WHERE phone = ?",
      [phone]
    );
    if (existingPhone.length > 0) {
      return res.status(400).json({ message: "Phone number is already in use" }); // Changed
    }

    const userId = await createUser(name, email, phone, password, "customer");

    res.status(201).json({
      message: "Registration successful", // Changed
      id: userId,
      email,
    });
  } catch (err) {
    console.error("❌ Error during registration:", err); // Changed
    res.status(500).json({ message: "Server error" }); // Changed
  }
}

async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Please enter email/phone and password" }); // Changed
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return res
        .status(401)
        .json({ message: "Incorrect account or password" }); // Changed
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Incorrect account or password" }); // Changed
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
      message: "Login successful", // Changed
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
    console.error("❌ Error during login:", err); // Changed
    res.status(500).json({ message: "Server error" }); // Changed
  }
}

const updateProfile = async (req, res) => {
  const { phone } = req.body;
  const userId = req.user.id;

  try {
    if (!phone) {
      return res.status(400).json({ message: "Please enter phone number" }); // Changed
    }

    // 2. Call the function directly (no User. prefix)
    await updateUserPhone(userId, phone);

    res.status(200).json({
      message: "Profile updated successfully!", // Changed
      user: {
        ...req.user,
        phone: phone,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error when updating profile" }); // Changed
  }
};

module.exports = {
  register,
  login,
  updateProfile,
};