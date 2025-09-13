const Userdb = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Transaction = require("../models/transaction");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const {
  generateCardNumber,
  generateCVV,
  generateExpiry,
} = require("../utils/cardGenerator");
const Card = require("../models/cards");
const Beneficiary = require("../models/beneficiaries");
const Support = require("../models/support");
const {
  sendNotification,
  broadcastNewRegistration,
} = require("../utils/notification");

exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { firstName, lastName, email, phone, password, confirmPassword } =
      req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const userExists = await Userdb.findOne({
      $or: [{ email }, { phone }],
    });

    if (userExists) {
      return res.status(400).json({
        message:
          userExists.email === email
            ? "Email already registered"
            : "Phone number already registered",
      });
    }

    // ✅ Create user with pending status
    const user = new Userdb({
      firstName,
      lastName,
      email,
      phone,
      password,
      status: "pending", // This will show in admin dashboard
    });

    const savedUser = await user.save();

    // ✅ Broadcast to all connected admin clients
    broadcastNewRegistration({
      id: savedUser._id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      phone: savedUser.phone,
    });

    // ✅ DON'T set auth cookie for pending users - they can't access dashboard yet
    res.status(201).json({
      message:
        "Registration successful! Please wait for admin approval before you can login.",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error while creating user" });
  }
};

exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, rememberMe } = req.body;

    const user = await Userdb.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    // ✅ Check if user is approved using status field
    if (user.status !== "approved") {
      if (user.status === "pending") {
        return res.status(403).json({
          message: "Account is pending admin approval. Please wait.",
        });
      } else if (user.status === "rejected") {
        return res.status(403).json({
          message: "Account has been rejected. Please contact support.",
        });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: rememberMe ? "7d" : "1d",
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000,
      sameSite: "Strict",
    });

    res.status(200).json({ message: "Login successful!" });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.logout = (req, res) => {
  res.cookie("auth_token", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });
  res.redirect("/login");
};

exports.resetPassword = async (req, res) => {
  const { token } = req.query;

  const { newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: "Missing token or new password" });
  }

  try {
    // Find user by reset token and check if the token is still valid
    const user = await Userdb.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Password reset token is invalid or has expired" });
    }

    // Update user's password and clear the reset token fields
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res
      .status(201)
      .json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Userdb.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    console.log(resetToken);
    const resetTokenExpiration = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiration;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send password reset email
    const transporter = nodemailer.createTransport({
      // Configure your transporter here
      service: "Gmail",
      auth: {
        user: String(process.env.EMAIL_USERNAME),
        pass: String(process.env.EMAIL_PASSWORD),
      },
    });

    const mailOptions = {
      from: String(process.env.EMAIL_USERNAME),
      to: email,
      subject: "Password Reset Request",
      text: `You are receiving this email because you (or someone else) has requested a password reset for your account.\n\n
             Please click on the following link or paste it into your browser to complete the process:\n\n
             ${resetUrl}\n\n
             If you did not request this, please ignore this email and your password will remain unchanged.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset link has been sent to your email" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.profileDetails = async (req, res) => {
  const userId = req.params.userId;

  console.log("Received data:", req.body);
  console.log("User ID:", userId);

  const {
    firstName,
    lastName,
    email,
    dob,
    gender,
    religion,
    location,
    state,
    city,
    country,
    zipcode,
    nokFirstName,
    nokLastName,
    relationship,
    nokAddress,
    currency,
    account,
  } = req.body;

  try {
    // Ensure dob is stored as Date
    const parsedDob = dob ? new Date(dob) : null;

    // Build combined address
    const addressParts = [location, city, state, country].filter(
      (part) => part && part.trim()
    );
    const combinedAddress =
      addressParts.length > 0 ? addressParts.join(", ") : "";

    const updatedUser = await Userdb.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        email,
        dob: parsedDob,
        gender,
        religion,
        location,
        state,
        city,
        country,
        zipcode,
        address: combinedAddress,
        nokFirstName,
        nokLastName,
        relationship,
        nokAddress,
        currency,
        account,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

exports.profilePicture = async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("No file uploaded");
    }

    const userId = req.params.userId;

    const user = await Userdb.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    user.profilePicture = req.file.path;

    const updatedUser = await user.save();

    res.status(201).json({
      message: "Profile picture uploaded successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.contactUs = async (req, res) => {
  try {
    const { name, phoneNumber, email, message } = req.body;

    const user = new UserMessage({
      name,
      phoneNumber,
      email,
      message,
    });

    const data = await user.save();

    console.log(data);

    return res.status(200).json({ message: "Message successful" });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: error.message });
  }
};

// POST NEWSLTTER
exports.newsLetter = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("toast", {
      errors: errors.array(),
      data: req.body,
    });
  }

  try {
    const { email } = req.body;

    const user = await Userdb.findById(req.user.id);

    if (!user) {
      return res.status(400).json({ message: "User doesn't exist" });
    }

    const suscribeNewsletter = new Newsletter({
      email,
    });

    const data = await suscribeNewsletter.save();

    res.status(201).json({ message: "Subscribed successfully!" });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//POST KYC
exports.submitKyc = async (req, res) => {
  const { fullname, dob, idType, idNumber, address } = req.body;

  console.log("KYC Data Received:", req.body);

  if (!fullname || !dob || !idType || !idNumber || !address) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const userId = req.user ? req.user._id : null;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // split fullname into firstName + lastName
    const [firstName, ...lastNameParts] = fullname.trim().split(" ");
    const lastName = lastNameParts.join(" ") || "";

    const updatedUser = await Userdb.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        dob: new Date(dob),
        address,
        kyc: {
          idType,
          idNumber,
          address,
          verified: false, // pending by default
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "KYC submitted successfully. Awaiting verification.",
      user: updatedUser,
    });
  } catch (err) {
    console.error("KYC submission error:", err);
    res.status(500).json({ message: "Error submitting KYC" });
  }
};

// POST /transfers/local
exports.localTransfer = async (req, res) => {
  console.log("Transfer Data Received:", req.body);
  try {
    const userId = req.user ? req.user._id : null;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const {
      beneficiaryName,
      beneficiaryAccount,
      beneficiaryBank,
      amount,
      description,
      saveBeneficiary,
    } = req.body;

    const transferAmount = parseFloat(amount);
    if (!transferAmount || transferAmount <= 0) {
      return res.status(400).json({ message: "Invalid transfer amount" });
    }

    // Find user
    const user = await Userdb.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const charges = 7;
    const totalDebit = transferAmount + charges;

    if (user.accountBalance < totalDebit) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    // Deduct balance
    user.accountBalance -= totalDebit;

    // Create new Transaction
    const newTx = await Transaction.create({
      userId,
      type: "Local", // ✅ include type
      date: new Date(),
      description:
        description || `Transfer to ${beneficiaryName} (${beneficiaryBank})`,
      debit: totalDebit,
      credit: 0,
      balance: user.accountBalance,

      // ✅ new fields
      localBeneficiaryName: beneficiaryName,
      localBeneficiaryBank: beneficiaryBank,
      localAccountNumber: beneficiaryAccount,
    });

    // Push to refs + history
    user.transactions.push(newTx._id);
    user.transactionsHistory.push({
      type: "Debit",
      amount: transferAmount,
      status: "Completed",
      description:
        description || `Transfer to ${beneficiaryName} (${beneficiaryBank})`,
    });

    await user.save();

    // ✅ Save beneficiary if requested
    if (saveBeneficiary === "on") {
      const existing = await Beneficiary.findOne({
        userId,
        accountNumber: beneficiaryAccount,
        accountName: beneficiaryName,
        bank: beneficiaryBank,
      });

      if (!existing) {
        await Beneficiary.create({
          userId,
          name: beneficiaryName,
          accountNumber: beneficiaryAccount,
          bank: beneficiaryBank,
        });
      }
    }

    // ✅ Fetch updated beneficiaries list
    const beneficiaries = await Beneficiary.find({ userId }).lean();

    // Socket.io notification
    sendNotification(userId, {
      type: "Local",
      amount: transferAmount,
      timestamp: Date.now(),
    });

    res.status(200).json({
      message: "Transfer successful",
      newBalance: user.accountBalance,
      transactionId: newTx._id,
      beneficiaries, // <-- return updated list
    });
  } catch (err) {
    console.error("Transfer error:", err);
    res.status(500).json({ message: "Error processing transfer" });
  }
};

// GET /transfers/local
exports.getLocalTransfer = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.redirect("/login");

    const user = await Userdb.findById(userId).lean();
    const beneficiaries = await Beneficiary.find({ userId }).lean();

    res.render("transfers-local", {
      layout: "layout",
      title: "Local Transfer",
      user,
      beneficiaries,
      loggedIn: true,
      active: "transfers",
    });
  } catch (err) {
    console.error("Error loading transfer page:", err);
    res.status(500).send("Server Error");
  }
};

// POST /transfers/international
exports.internationalTransfer = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { recipientName, iban, swift, amount, description } = req.body;
    const transferAmount = parseFloat(amount);

    if (!transferAmount || transferAmount <= 0) {
      return res.status(400).json({ message: "Invalid transfer amount" });
    }

    const user = await Userdb.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const charges = 15;
    const totalDebit = transferAmount + charges;

    if (user.accountBalance < totalDebit) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    // Deduct balance
    user.accountBalance -= totalDebit;

    // Create transaction
    const transaction = await Transaction.create({
      userId,
      type: "International",
      beneficiaryName: recipientName,
      iban,
      swift,
      description:
        description ||
        `Intl Transfer to ${recipientName} (IBAN: ${iban}, SWIFT: ${swift})`,
      debit: totalDebit,
      credit: 0,
      balance: user.accountBalance,
      status: "Completed",
    });

    // Add reference to user
    user.transactions.push(transaction._id);
    await user.save();

    // ✅ Send notification with proper values
    sendNotification(userId, {
      type: "International",
      amount: transferAmount,
      timestamp: transaction.createdAt,
    });

    res.status(200).json({
      message: "Transfer successful",
    });
  } catch (err) {
    console.error("Intl Transfer Error:", err);
    res
      .status(500)
      .json({ message: "Error processing international transfer" });
  }
};

// POST /transfers/mobile
exports.mobileTransfer = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const {
      phoneNumber,
      beneficiaryName,
      amount,
      description,
      saveBeneficiary,
    } = req.body;
    const transferAmount = parseFloat(amount);

    if (!transferAmount || transferAmount <= 0) {
      return res.status(400).json({ message: "Invalid transfer amount" });
    }

    // Find user
    const user = await Userdb.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Charges (optional, same as Local)
    const charges = 7;
    const totalDebit = transferAmount + charges;

    if (user.accountBalance < totalDebit) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    // Deduct balance
    user.accountBalance -= totalDebit;

    // Create new Transaction
    const newTx = await Transaction.create({
      userId,
      type: "Mobile Transfer", // ✅ renamed
      phoneNumber,
      mobileBeneficiaryName: beneficiaryName,
      description:
        description || `Mobile transfer to ${beneficiaryName} (${phoneNumber})`,
      debit: totalDebit,
      credit: 0,
      balance: user.accountBalance,
    });

    // Push to refs + history
    user.transactions.push(newTx._id);
    user.transactionsHistory.push({
      type: "Debit",
      amount: transferAmount,
      status: "Completed",
      description:
        description || `Mobile transfer to ${beneficiaryName} (${phoneNumber})`,
    });

    await user.save();

    // ✅ Save beneficiary if requested
    if (saveBeneficiary === "on") {
      const existing = await Beneficiary.findOne({
        userId,
        accountNumber: phoneNumber,
        name: beneficiaryName,
        bank: "Mobile",
      });

      if (!existing) {
        await Beneficiary.create({
          userId,
          name: beneficiaryName,
          accountNumber: phoneNumber,
          bank: "Mobile",
        });
      }
    }

    // Socket.io notification
    sendNotification(userId, {
      type: "Mobile Transfer",
      amount: transferAmount,
      timestamp: Date.now(),
    });

    res.status(200).json({
      message: "Mobile transfer successful",
      newBalance: user.accountBalance,
      transactionId: newTx._id,
    });
  } catch (err) {
    console.error("Mobile transfer error:", err);
    res.status(500).json({ message: "Error processing mobile transfer" });
  }
};

// GET /accounts/statement?page=1&limit=10
exports.getStatement = async (req, res) => {
  try {
    const user = await Userdb.findById(req.user.id);
    if (!user) return res.status(404).send("User not found");

    // Pagination setup
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch transactions with pagination
    const [transactions, totalCount] = await Promise.all([
      Transaction.find({ userId: user._id })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments({ userId: user._id }),
    ]);

    // Totals
    const totalCredits = await Transaction.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: null, credits: { $sum: "$credit" } } },
    ]);
    const totalDebits = await Transaction.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: null, debits: { $sum: "$debit" } } },
    ]);

    const balance = user.accountBalance;

    // Group transactions by month
    const monthlySummary = {};
    transactions.forEach((tx) => {
      const txDate = tx.date || new Date();
      const monthKey = txDate.toISOString().slice(0, 7);

      if (!monthlySummary[monthKey]) {
        monthlySummary[monthKey] = { credits: 0, debits: 0 };
      }
      monthlySummary[monthKey].credits += tx.credit || 0;
      monthlySummary[monthKey].debits += tx.debit || 0;
    });

    res.render("accounts-statement", {
      user,
      transactions,
      totalCredits: totalCredits[0]?.credits || 0,
      totalDebits: totalDebits[0]?.debits || 0,
      balance,
      monthlySummary,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) {
    console.error("Statement Error:", err);
    res.status(500).send("Error loading statement");
  }
};

// GET /accounts/statement/:year/:month
exports.getMonthlyStatement = async (req, res) => {
  try {
    const { year, month } = req.params;

    // populate transactions with details
    const user = await Userdb.findById(req.user.id).populate("transactions");
    if (!user) return res.status(404).json({ message: "User not found" });

    const monthlyTx = (user.transactions || []).filter((tx) => {
      const d = new Date(tx.date);
      return (
        d.getFullYear() === parseInt(year) &&
        d.getMonth() + 1 === parseInt(month)
      );
    });

    // calculate totals
    const totalCredits = monthlyTx.reduce(
      (sum, tx) => sum + (tx.credit || 0),
      0
    );
    const totalDebits = monthlyTx.reduce((sum, tx) => sum + (tx.debit || 0), 0);
    const netBalance = totalCredits - totalDebits;

    res.render("accounts-monthly-statement", {
      user,
      year,
      month,
      transactions: monthlyTx,
      totalCredits,
      totalDebits,
      netBalance,
    });
  } catch (err) {
    console.error("Monthly Statement Error:", err);
    res.status(500).json({ message: "Error generating monthly statement" });
  }
};

// GET Date Range Report
exports.getDateReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    // populate transactions
    const user = await Userdb.findById(req.user.id).populate("transactions");
    if (!user) return res.status(404).json("User not found");

    const reportTx = (user.transactions || []).filter((tx) => {
      const d = new Date(tx.date);
      return d >= new Date(fromDate) && d <= new Date(toDate);
    });

    // ✅ calculate totals
    const totalCredits = reportTx.reduce(
      (sum, tx) => sum + (tx.credit || 0),
      0
    );
    const totalDebits = reportTx.reduce((sum, tx) => sum + (tx.debit || 0), 0);
    const balance = user.accountBalance;

    // ✅ group by month
    const monthlySummary = {};
    reportTx.forEach((tx) => {
      const monthKey = tx.date.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlySummary[monthKey]) {
        monthlySummary[monthKey] = { credits: 0, debits: 0 };
      }
      monthlySummary[monthKey].credits += tx.credit || 0;
      monthlySummary[monthKey].debits += tx.debit || 0;
    });

    res.render("accounts-report", {
      user,
      transactions: reportTx.slice(-50).reverse(),
      totalCredits,
      totalDebits,
      balance,
      monthlySummary,
      fromDate,
      toDate,
    });
  } catch (err) {
    console.error("Date Report Error:", err);
    res.status(500).json("Error generating report");
  }
};

// controllers/transferHistory.js
exports.getTransferHistory = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.redirect("/login");

    // ✅ Fetch all transactions directly from Transaction collection
    const transactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .lean();

    res.render("transfers-history", {
      user: req.user,
      transactions,
    });
  } catch (err) {
    console.error("Error fetching transfer history:", err);
    res.status(500).send("Server Error");
  }
};

// GET /accounts/statement/export/pdf
exports.exportStatementPDF = async (req, res) => {
  try {
    const user = await Userdb.findById(req.user.id);
    if (!user) return res.status(404).send("User not found");

    const transactions = await Transaction.find({ userId: user._id }).sort({
      date: -1,
    });

    // PDF setup
    const doc = new PDFDocument({ margin: 30 });
    res.setHeader("Content-Disposition", "attachment; filename=statement.pdf");
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // Title
    doc.fontSize(18).text("Account Statement", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Name: ${user.firstName} ${user.lastName}`);
    doc.text(`Account: ${user.account}`);
    doc.text(`Balance: $${user.accountBalance.toLocaleString()}`);
    doc.moveDown();

    // Table Header
    doc.fontSize(12).text("Date | Description | Debit | Credit | Balance", {
      underline: true,
    });
    doc.moveDown(0.5);

    // Transactions
    transactions.forEach((tx) => {
      doc.text(
        `${tx.date.toISOString().slice(0, 10)} | ${tx.description} | ${
          tx.debit || "-"
        } | ${tx.credit || "-"} | ${tx.balance}`
      );
    });

    doc.end();
  } catch (err) {
    console.error("PDF Export Error:", err);
    res.status(500).send("Error exporting statement PDF");
  }
};

// GET /accounts/statement/export/excel
exports.exportStatementExcel = async (req, res) => {
  try {
    const user = await Userdb.findById(req.user.id);
    if (!user) return res.status(404).send("User not found");

    const transactions = await Transaction.find({ userId: user._id }).sort({
      date: -1,
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Statement");

    // Headers
    sheet.addRow(["Date", "Description", "Debit", "Credit", "Balance"]);

    // Transactions
    transactions.forEach((tx) => {
      sheet.addRow([
        tx.date.toISOString().slice(0, 10),
        tx.description,
        tx.debit || 0,
        tx.credit || 0,
        tx.balance || user.accountBalance,
      ]);
    });

    res.setHeader("Content-Disposition", "attachment; filename=statement.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Excel Export Error:", err);
    res.status(500).send("Error exporting statement Excel");
  }
};

// Overview hardcoded data and API integration
// In your userController.js - getOverview function
// This version works with your current verifyToken middleware

exports.getOverview = async (req, res) => {
  try {
    // ✅ Check if user is authenticated
    if (!req.user) {
      console.log("User not authenticated, redirecting to login");
      return res.redirect("/login");
    }

    // ✅ Check if user is approved
    if (req.user.status !== "approved") {
      console.log("User not approved, status:", req.user.status);
      return res.render("pending-approval", {
        title: "Account Pending Approval",
        message: "Your account is pending admin approval. Please wait."
      });
    }

    const userId = req.user._id;
    console.log("Getting overview for user:", userId);

    // Get recent transactions
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Mock data for tickers and indices (you can replace with real data)
    const tickers = [
      { name: "EUR/USD", value: "1.0523" },
      { name: "GBP/USD", value: "1.2145" },
      { name: "USD/JPY", value: "149.85" },
      { name: "AUD/USD", value: "0.6523" }
    ];

    const indices = [
      { label: "USD/EUR", value: "0.9503" },
      { label: "USD/GBP", value: "0.8233" },
      { label: "USD/JPY", value: "149.85" }
    ];

    const currentIndices = [
      { EUR: "1.0523", USD: "1.0000", GBP: "1.2145", CAD: "1.3456", CNY: "7.2345" }
    ];

    // Render the overview page
    res.render("overview", {
      title: "Account Overview",
      user: req.user,
      transactions: transactions || [],
      tickers: tickers,
      indices: indices,
      currentIndices: currentIndices
    });

  } catch (error) {
    console.error("Error in getOverview:", error);
    res.status(500).render("error", { 
      title: "Error",
      message: "Error loading overview",
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// POST /loan/application controller
exports.applyForLoan = async (req, res) => {
  try {
    const user = await Userdb.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { loanAmount, purpose, term, collateral } = req.body;

    const application = {
      loanAmount,
      purpose,
      term,
      collateral,
      interest: "5% per annum",
      status: "Pending",
      applicationDate: new Date(),
    };

    // Attach loan application to user (or create Loan model if needed)
    user.loanApplications = user.loanApplications || [];
    user.loanApplications.push(application);
    await user.save();

    res
      .status(200)
      .json({ message: "Loan application submitted", application });
  } catch (err) {
    console.error("Loan application error:", err);
    res.status(500).json({ message: "Error processing loan application" });
  }
};

// GET /loan/status con
exports.getLoanStatus = async (req, res) => {
  try {
    const user = await Userdb.findById(req.user.id);

    if (!user) {
      return res.status(404).render("loan-status", {
        loans: [],
        message: "User not found",
      });
    }

    // Map loanApplications into the format the view expects
    const loans = (user.loanApplications || []).map((loan, index) => ({
      id: index + 1, // Or loan._id if you prefer Mongo ID
      amount: loan.loanAmount,
      term: loan.term,
      status: loan.status,
      date: loan.applicationDate.toLocaleDateString(),
    }));

    res.render("loan-status", { loans });
  } catch (err) {
    console.error("Loan status error:", err);
    res.status(500).render("loan-status", { loans: [] });
  }
};

// Update Password
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    const userId = req.user ? req.user._id : null;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    const user = await Userdb.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;

    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ message: "Error updating password" });
  }
};

// Update PIN
exports.updatePin = async (req, res) => {
  try {
    const { currentPin, newPin, confirmPin } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!currentPin || !newPin || !confirmPin) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPin !== confirmPin) {
      return res.status(400).json({ message: "New pins do not match" });
    }

    if (newPin.length < 4) {
      return res
        .status(400)
        .json({ message: "PIN should be at least 4 digits" });
    }

    const user = await Userdb.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare current PIN with stored hashed PIN
    const isMatch = await bcrypt.compare(currentPin, user.pin || "");
    if (!isMatch) {
      return res.status(400).json({ message: "Current PIN is incorrect" });
    }

    if (await bcrypt.compare(newPin, user.pin)) {
      return res
        .status(400)
        .json({ message: "New PIN must be different from current PIN" });
    }

    // Assign new PIN (it will be hashed by pre-save hook)
    user.pin = newPin;
    await user.save();

    res.status(200).json({ message: "PIN updated successfully" });
  } catch (err) {
    console.error("Error updating PIN:", err);
    res.status(500).json({ message: "Error updating PIN" });
  }
};

// settings
exports.updateSettings = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null; // from JWT middleware
    const { theme, language } = req.body;

    const user = await Userdb.findByIdAndUpdate(
      userId,
      {
        $set: {
          "settings.theme": theme,
          "settings.language": language,
        },
      },
      { new: true, runValidators: true }
    );

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({
      success: true,
      message: "Settings updated",
      settings: user.settings,
    });
  } catch (err) {
    console.error("Update Settings Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Error updating settings" });
  }
};

// POST /cards/apply
exports.cards = async (req, res) => {
  try {
    const { network, type } = req.body;

    console.log(req.body);

    const userId = req.user ? req.user._id : null;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 🔹 Check if card already exists for this network + type
    let card = await Card.findOne({ userId, network, type });
    if (card) {
      return res.json({ success: true, card, message: "Card already exists" });
    }

    // Otherwise, create new card
    const number = generateCardNumber();
    const cvv = generateCVV();
    const expiry = generateExpiry();

    card = new Card({ userId, network, type, number, cvv, expiry });
    await card.save();

    res.status(201).json({ success: true, card });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET cards
exports.getCards = async (req, res) => {
  try {
    const userId = req.user._id;
    const card = await Card.findOne({ userId }).lean(); // get card for this user

    res.render("cards", {
      layout: "layout",
      title: "Cards",
      user: req.user,
      card,
      loggedIn: true,
      active: "cards",
    });
  } catch (err) {
    console.error("Error loading cards:", err);
    res.status(500).send("Server error");
  }
};

// support controller
exports.support = async (req, res) => {
  try {
    const user = await Userdb.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { email, issue } = req.body;

    if (!email || !issue) {
      return res.status(400).json({ message: "All fields required" });
    }

    const support = new Support({
      userId: user._id,
      email,
      issue,
    });
    await support.save();

    res.status(201).json({ message: "Support request submitted" });
  } catch (err) {
    console.error("Support error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
