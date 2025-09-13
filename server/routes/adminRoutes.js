//========================================
// 2. FIXED ADMIN ROUTES (admin.js)
// ========================================
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Userdb = require("../models/userModel");
const Transaction = require("../models/transaction");
const isAdmin = require("../middleware/isAdmin");
const { broadcastUserApproved } = require("../utils/notification");

// Admin Login Page
router.get("/login", (req, res) => {
  res.render("admin/login", { title: "Admin Login" });
});

// Admin Login POST
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Userdb.findOne({ email, role: "admin" });
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized: Not an admin" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("adminToken", token, { httpOnly: true });
    res.status(200).json({ message: "Admin login successful!" });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ FIXED Admin Dashboard - Show pending registrations
router.get("/dashboard", isAdmin, async (req, res) => {
  const pendingUsers = await Userdb.find({ status: "pending", role: "user" });
  res.render("admin/dashboard", {
    user: req.user,
    title: "Admin Dashboard",
    requests: pendingUsers,
  });
});

// ✅ FIXED Approve user registration
router.post("/approve-user/:userId", isAdmin, async (req, res) => {
  try {
    const user = await Userdb.findByIdAndUpdate(
      req.params.userId,
      { status: "approved" },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    // Notify all admins that user is approved
    broadcastUserApproved(user._id);

    res.json({ message: "User approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error approving user" });
  }
});

// KYC requests
router.get("/kyc-requests", isAdmin, async (req, res) => {
  const users = await Userdb.find({ "kyc.verified": false });
  res.render("admin/kyc-requests", {
    title: "KYC Requests",
    user: req.user,
    requests: users,
  });
});

router.post("/kyc/:userId/approve", isAdmin, async (req, res) => {
  await Userdb.findByIdAndUpdate(req.params.userId, { "kyc.verified": true });
  broadcastUserApproved(req.params.userId);
  res.json({ message: "KYC approved" });
});

// Load money
router.get("/load-money", isAdmin, (req, res) => {
  res.render("admin/load-money", {
    title: "Load Money",
    user: req.user,
  });
});

router.post("/load-money", isAdmin, async (req, res) => {
  const { userId, amount, description } = req.body;
  const user = await Userdb.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const creditAmount = parseFloat(amount);
  if (!creditAmount || creditAmount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  user.accountBalance += creditAmount;
  await user.save();

  await Transaction.create({
    userId,
    type: "Admin Load",
    description: description || "Admin credited account",
    debit: 0,
    credit: creditAmount,
    balance: user.accountBalance,
  });

  res.json({
    message: "Account funded successfully",
    newBalance: user.accountBalance,
  });
});

router.get("/logout", (req, res) => {
  res.clearCookie("adminToken");
  res.redirect("/admin/login");
});

module.exports = router;
