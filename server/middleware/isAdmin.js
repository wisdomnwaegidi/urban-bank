// middleware/isAdmin.js
const Userdb = require("../models/userModel");

module.exports = async function isAdmin(req, res, next) {
  try {
    const user = await Userdb.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    next(); // ✅ allow request to proceed
  } catch (err) {
    console.error("Admin middleware error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
