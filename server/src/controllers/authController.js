const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const userData = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (
      typeof name !== "string" || typeof email !== "string" ||
      typeof password !== "string" || !name.trim() ||
      !email.trim() || password.length < 6
    ) {
      return res.status(400).json({
        message: "Name, email and a password of at least 6 characters are required",
      });
    }
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password });
    res.status(201).json({ token: signToken(user), user: userData(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({ token: signToken(user), user: userData(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMe = (req, res) => {
  res.json({ user: userData(req.user) });
};