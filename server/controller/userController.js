const Userdb = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const NotificationService = require("../services/notificationService");
const Transaction = require("../models/Transaction");

exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { firstName, lastName, email, phone, password, confirmPassword } =
      req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check for existing user
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new Userdb({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
    });

    const savedUser = await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: savedUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    // Set cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 86400000,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error while creating user" });
  }
};

exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("login", {
      errors: errors.array(),
      data: req.body,
    });
  }

  try {
    const { email, password } = req.body;

    const user = await Userdb.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Incorrect email or username" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.error("Incorrect password for email:", email);
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000,
      sameSite: "Strict",
    });

    res.status(200).json({ message: "User loggedin successfully" });
  } catch (error) {
    // console.error("Error logging in:", error.message);
    // console.error(error.stack);
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

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password and clear the reset token fields
    user.password = hashedPassword;
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

exports.submitKyc = async (req, res) => {
  const { fullname, dob, idType, idNumber, address } = req.body;

  console.log("KYC Data Received:", req.body);

  if (!fullname || !dob || !idType || !idNumber || !address) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Store KYC info inside user (assuming you attach userId via session/JWT)
    const userId = req.user ? req.user._id : null;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updatedUser = await Userdb.findByIdAndUpdate(
      userId,
      {
        fullname,
        dob: new Date(dob),
        kyc: {
          idType,
          idNumber,
          address,
          verified: false, // default
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
    const userId = req.user ? req.user._id : null; // from JWT
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { beneficiaryName, beneficiaryBank, amount, description } = req.body;
    const transferAmount = parseFloat(amount);

    if (!transferAmount || transferAmount <= 0) {
      return res.status(400).json({ message: "Invalid transfer amount" });
    }

    const user = await Userdb.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const charges = 7;
    const totalDebit = transferAmount + charges;

    if (user.accountBalance < totalDebit) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    // Deduct balance
    user.accountBalance -= totalDebit;

    // Push transaction to user.transactions
    const transaction = {
      date: new Date(),
      description:
        description || `Transfer to ${beneficiaryName} (${beneficiaryBank})`,
      debit: totalDebit,
      credit: 0,
      balance: user.accountBalance,
    };
    user.transactions.push(transaction);

    // Save user with updated balance + transactions
    await user.save();

    // (Optional) Save to a separate Transaction collection too
    await Transaction.create({
      userId,
      ...transaction,
    });

    res.status(200).json({
      message: "Transfer successful",
      newBalance: user.accountBalance,
    });
  } catch (err) {
    console.error("Transfer error:", err);
    res.status(500).json({ message: "Error processing transfer" });
  }
};

// GET Account Statement
exports.getStatement = async (req, res) => {
  try {
    const user = await Userdb.findById(req.user.id); // JWT middleware gives req.user.id
    if (!user) return res.status(404).send("User not found");

    const totalCredits = user.transactions.reduce(
      (sum, tx) => sum + tx.credit,
      0
    );
    const totalDebits = user.transactions.reduce(
      (sum, tx) => sum + tx.debit,
      0
    );
    const balance = user.accountBalance;

    // Group transactions by month
    const monthlySummary = {};
    user.transactions.forEach((tx) => {
      const monthKey = tx.date.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlySummary[monthKey]) {
        monthlySummary[monthKey] = { credits: 0, debits: 0 };
      }
      monthlySummary[monthKey].credits += tx.credit;
      monthlySummary[monthKey].debits += tx.debit;
    });

    res.render("accounts-statement", {
      user,
      transactions: user.transactions.slice(-10).reverse(), // last 10 transactions
      totalCredits,
      totalDebits,
      balance,
      monthlySummary,
      transactions: user.transactions.slice(-10).reverse(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading statement");
  }
};

// GET Monthly Statement
exports.getMonthlyStatement = async (req, res) => {
  try {
    const { year, month } = req.params;
    const user = await Userdb.findById(req.user.id);
    if (!user) return res.status(404).send("User not found");

    const monthlyTx = user.transactions.filter((tx) => {
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

    // pass them into the EJS
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
    res.status(500).send("Error loading monthly statement");
  }
};

// GET Date Range Report
exports.getDateReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const user = await Userdb.findById(req.user.id);
    if (!user) return res.status(404).send("User not found");

    const reportTx = user.transactions.filter((tx) => {
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
    res.status(500).send("Error generating report");
  }
};

// GET /accounts/report
exports.getReport = async (req, res) => {
  try {
    const user = await Userdb.findById(req.user.id);
    if (!user) return res.status(404).send("User not found");

    // Read filter dates
    const { fromDate, toDate } = req.query;

    let transactions = user.transactions;

    // Filter by date range if provided
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      transactions = transactions.filter((tx) => {
        const txDate = new Date(tx.date);
        return txDate >= from && txDate <= to;
      });
    }

    // Calculate totals
    const totalCredits = transactions.reduce(
      (sum, tx) => sum + (tx.credit || 0),
      0
    );
    const totalDebits = transactions.reduce(
      (sum, tx) => sum + (tx.debit || 0),
      0
    );
    const balance = user.accountBalance;

    // Group by month
    const monthlySummary = {};
    transactions.forEach((tx) => {
      const monthKey = tx.date.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlySummary[monthKey]) {
        monthlySummary[monthKey] = { credits: 0, debits: 0 };
      }
      monthlySummary[monthKey].credits += tx.credit || 0;
      monthlySummary[monthKey].debits += tx.debit || 0;
    });

    res.render("accounts-report", {
      user,
      transactions: transactions.slice(-50).reverse(), // last 50 filtered tx
      totalCredits,
      totalDebits,
      balance,
      monthlySummary,
      fromDate,
      toDate,
    });
  } catch (err) {
    console.error("Report Error:", err);
    res.status(500).send("Error loading report");
  }
};

// controllers/transferController.js
exports.getTransferHistory = async (req, res) => {
  try {
    const user = await Userdb.findById(req.user.id); // req.user comes from JWT middleware
    if (!user) return res.status(404).send("User not found");

    // Get last 50 transactions (most recent first)
    const transactions = user.transactions.slice(-50).reverse();

    res.render("transfers-history", {
      user,
      transactions,
    });
  } catch (err) {
    console.error("Error fetching transfer history:", err);
    res.status(500).send("Error loading transfer history");
  }
};

// Overview hardcoded data and API integration
exports.getOverview = async (req, res) => {
  try {
    const user = await Userdb.findById(req.user.id);

    // Last 5 transactions
    const transactions = user.transactions.slice(-5).reverse();

    // Dummy data for now (replace with API or DB later)
    const tickers = [
      { name: "EUR to USD", value: "1.16486", change: "+0.01%" },
      { name: "Bitcoin", value: "110,859", change: "-0.81%" },
    ];

    const rates = [{ label: "USD/NGN", value: "1500" }];

    const indices = [
      { EUR: "-0.01%", USD: "0.01%", GBP: "0.01%", CAD: "0.01%", CNY: "0%" },
      {
        EUR: "0.01%",
        USD: "0.01%",
        GBP: "-0.01%",
        CAD: "-0.01%",
        CNY: "-0.01%",
      },
    ];

    res.render("overview", {
      user,
      transactions,
      tickers,
      rates,
      indices,
    });
  } catch (err) {
    console.error("Error loading overview:", err);
    res.status(500).send("Error loading overview");
  }
};

const axios = require("axios");
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY; 

async function fetchForexRate(from, to) {
  const res = await axios.get("https://www.alphavantage.co/query", {
    params: {
      function: "CURRENCY_EXCHANGE_RATE",
      from_currency: from,
      to_currency: to,
      apikey: API_KEY,
    },
  });
  return (
    res.data["Realtime Currency Exchange Rate"]?.["5. Exchange Rate"] || "--"
  );
}

async function fetchCryptoPrice(symbol) {
  const res = await axios.get("https://www.alphavantage.co/query", {
    params: {
      function: "CURRENCY_EXCHANGE_RATE",
      from_currency: symbol,
      to_currency: "USD",
      apikey: API_KEY,
    },
  });
  return (
    res.data["Realtime Currency Exchange Rate"]?.["5. Exchange Rate"] || "--"
  );
}

async function fetchStockIndex(ticker) {
  const res = await axios.get("https://www.alphavantage.co/query", {
    params: {
      function: "GLOBAL_QUOTE",
      symbol: ticker,
      apikey: API_KEY,
    },
  });
  return res.data["Global Quote"]?.["05. price"] || "--";
}

exports.getOverview = async (req, res) => {
  try {
    const user = await Userdb.findById(req.user.id);
    const transactions = user.transactions?.slice(-5).reverse() || [];

    const tickers = [
      { name: "EUR/USD", value: await fetchForexRate("EUR", "USD") },
      { name: "BTC/USD", value: await fetchCryptoPrice("BTC") },
      { name: "ETH/USD", value: await fetchCryptoPrice("ETH") },
    ];

    const indices = [
      { label: "S&P 500", value: await fetchStockIndex("SPY") },
      { label: "Dow Jones", value: await fetchStockIndex("^DJI") },
      { label: "NASDAQ", value: await fetchStockIndex("^IXIC") },
    ];

    res.render("overview", { user, transactions, tickers, indices });
  } catch (err) {
    console.error("Error fetching overview:", err);
    res.status(500).send("Error loading overview");
  }
};
// End Overview hardcoded data and API integration

// ===========================
// server/controller/transactionController.js (Example usage)
// ===========================

const processWithdrawal = async (req, res) => {
  try {
    const { userId, amount, accountNumber, location, method } = req.body;

    // Process the actual withdrawal logic here
    // ... your withdrawal processing code ...

    const transactionId = generateTransactionId(); // Your transaction ID logic

    // Create withdrawal notification
    await NotificationService.createWithdrawalNotification(userId, {
      amount,
      accountNumber,
      location: location || req.ip, // Use IP if location not provided
      method: method || "ATM",
      transactionId,
    });

    res.json({
      success: true,
      message: "Withdrawal processed successfully",
      transactionId,
    });
  } catch (error) {
    console.error("Withdrawal processing error:", error);
    res.status(500).json({
      success: false,
      message: "Withdrawal processing failed",
    });
  }
};
