// middleware/isAdmin.js
const Userdb = require("../models/userModel");
const jwt = require("jsonwebtoken");

module.exports = async function (req, res, next) {
  try {
    const token = req.cookies.adminToken;
    if (!token) return res.redirect("/admin/login");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Userdb.findById(decoded.id);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("isAdmin middleware error:", err);
    res.redirect("/admin/login");
  }
};

