const express = require("express");
const router = express.Router();
const Userdb = require("../models/userModel");
const Transaction = require("../models/transaction");
const isAdmin = require("../middleware/isAdmin");

// ✅ Admin Dashboard
router.get("/admin", isAdmin, async (req, res) => {
  const users = await Userdb.find({ "kyc.verified": false }); // pending KYC
  res.render("/admin/dashboard", {
    user: req.user,
    title: "Admin Dashboard",
    requests: users,
  });
});


// ✅ View all pending KYC requests
router.get("/kyc-requests", isAdmin, async (req, res) => {
  const users = await Userdb.find({ "kyc.verified": false });
  res.render("/admin/kyc-requests", {
    title: "KYC Requests",
    user: req.user,
    requests: users,
  });
});

// ✅ Approve a user’s KYC
router.post("/kyc/:userId/approve", isAdmin, async (req, res) => {
  await Userdb.findByIdAndUpdate(req.params.userId, {
    "kyc.verified": true,
  });
  res.json({ message: "KYC approved" });
});

// ✅ Load money into user account
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

module.exports = router;
