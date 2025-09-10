const express = require("express");
const {
  registerUserValidator,
  loginUserValidator,
} = require("../validators/useValidator");
const verifyToken = require("../middleware/verifyToken");
const NotificationService = require("../services/notificationService");
const {
  registerUser,
  loginUser,
  logout,
  resetPassword,
  forgotPassword,
  profileDetails,
  profilePicture,
  contactUs,
  submitKyc,
  localTransfer,
  getStatement,
  getMonthlyStatement,
  getDateReport,
  getReport,
  getTransferHistory,
  getOverview,
  internationalTransfer,
  applyForLoan,
  getLoanStatus,
  mobileDeposit,
  updatePassword,
  updatePin,
  updateSettings,
  exportStatementPDF,
  exportStatementExcel,
} = require("../controller/userController");
const upload = require("../middleware/multer");
const router = express.Router();

/* ===========================
   PUBLIC ROUTES (NO LAYOUT)
=========================== */
router.get("/", (req, res) => {
  res.render("index", {
    layout: false, // Explicitly disable layout
    loggedIn: res.locals.loggedIn,
    user: res.locals.user || null,
    errors: [],
    data: {},
  });
});

router.get("/about", (req, res) => res.render("about", { layout: false }));

router.get("/bank-special-offers", (req, res) =>
  res.render("bank-special-offers", { layout: false })
);

router.get("/blog-detail-1", (req, res) =>
  res.render("blog-detail-1", { layout: false })
);

router.get("/blog-detail-2", (req, res) =>
  res.render("blog-detail-2", { layout: false })
);

router.get("/blog-grid-1", (req, res) =>
  res.render("blog-grid-1", { layout: false })
);

router.get("/blog-grid-2", (req, res) =>
  res.render("blog-grid-2", { layout: false })
);

router.get("/blog-grid-3", (req, res) =>
  res.render("blog-grid-3", { layout: false })
);

router.get("/career", (req, res) => res.render("careeer", { layout: false }));

router.get("/contact", (req, res) => res.render("contact", { layout: false }));

router.get("/error", (req, res) => res.render("error", { layout: false }));

router.get("/faq-2", (req, res) => res.render("faq-2", { layout: false }));

router.get("/faq", (req, res) => res.render("faq", { layout: false }));

router.get("/feature-detail", (req, res) =>
  res.render("feature-detail", { layout: false })
);

router.get("/feature", (req, res) => res.render("feature", { layout: false }));

router.get("/login", (req, res) =>
  res.render("login", {
    layout: false,
    errors: [],
    data: {},
  })
);

router.post("/login", loginUserValidator, loginUser);

router.get("/register", (req, res) =>
  res.render("register", {
    layout: false,
    errors: [],
    data: {},
  })
);

router.post("/register", registerUserValidator, registerUser);

router.get("/pricing", (req, res) =>
  res.render("pricing", {
    layout: false,
    errors: [],
    data: {},
  })
);

router.get("/forgot-password", async (req, res) =>
  res.render("forgot-password", { layout: false })
);

router.post("/forgot-password", forgotPassword);

router.get("/reset-password", async (req, res) =>
  res.render("reset-password", { layout: false })
);

router.post("/reset-password", resetPassword);

router.post("/security/password", verifyToken, updatePassword);

router.post("/contact-us", contactUs);

/* ===========================
   PROTECTED ROUTES (WITH LAYOUT)
=========================== */

// Dashboard - Redirect to overview as main page
router.get("/dashboard", verifyToken, (req, res) => {
  res.redirect("/overview");
});

router.get("/overview", verifyToken, getOverview);

// Accounts - KYC
router.get("/accounts/kyc", verifyToken, async (req, res) => {
  res.render("accounts-kyc", {
    layout: "layout",
    title: "KYC Verification",
    user: req.user,
    loggedIn: true,
    active: "accounts",
  });
});

// POST /accounts/kyc
router.post("/accounts/kyc", verifyToken, submitKyc);

// Accounts - Statement Data API
router.get("/accounts/statement", verifyToken, getStatement);

router.get("/statement/export/pdf", verifyToken, exportStatementPDF);

router.get("/statement/export/excel", verifyToken, exportStatementExcel);

// fix this
router.get(
  "/accounts/statement/:year/:month",
  verifyToken,
  getMonthlyStatement
);

router.get("/accounts/report", verifyToken, getDateReport);

router.get("/accounts/report", verifyToken, getReport);
//End Accounts - Statement Data API

// Cards page
router.get("/cards", verifyToken, (req, res) => {
  res.render("cards", {
    layout: "layout",
    title: "Cards",
    user: req.user,
    loggedIn: true,
    active: "cards",
    card: null,
  });
});

// Transfers page
// Local transfer
router.get("/transfers/local", verifyToken, (req, res) => {
  res.render("transfers-local", {
    layout: "layout",
    title: "Local Transfer",
    user: req.user,
    loggedIn: true,
    active: "transfers",
  });
});

router.post("/transfers/local", verifyToken, localTransfer);

// International transfer
router.get("/transfers/international", verifyToken, (req, res) => {
  res.render("transfers-international", {
    layout: "layout",
    title: "International Transfer",
    user: req.user,
    loggedIn: true,
    active: "transfers",
  });
});

router.post("/transfers/international", verifyToken, internationalTransfer);

// Mobile deposit
router.get("/transfers/mobile-deposit", verifyToken, (req, res) => {
  res.render("transfers-mobile", {
    layout: "layout",
    title: "Mobile Deposit",
    user: req.user,
    loggedIn: true,
    active: "transfers",
  });
});

router.post("/transfers/mobile-deposit", verifyToken, mobileDeposit);

// History
router.get("/transfers/history", verifyToken, getTransferHistory);

// PIN
router.post("/pin", verifyToken, updatePin);



// ==================== LOAN ROUTES ====================

// Loan Application
router.get("/loan/status", verifyToken, getLoanStatus);

// Loan Status
router.get("/loan/status", verifyToken, async (req, res) => {
  res.render("loan-status", {
    layout: "layout",
    title: "Loan Status",
    user: req.user,
    loggedIn: true,
    active: "loan",
    loans: [], //
  });
});

router.get("/loan/application", verifyToken, async (req, res) => {
  res.render("loan-application", {
    layout: "layout",
    title: "Loan Application",
    user: req.user,
    loggedIn: true,
    active: "loan",
    loans: [], //
  });
});

// Apply for a loan
router.post("/loan/application", verifyToken, applyForLoan);

// Analytics page
router.get("/analytics", verifyToken, (req, res) => {
  res.render("analytics", {
    layout: "layout",
    title: "Analytics",
    user: req.user,
    loggedIn: true,
    active: "analytics",
  });
});

// Security page
router.get("/security/:type", verifyToken, async (req, res) => {
  const { type } = req.params;

  // validate only allowed types
  if (!["password", "pin"].includes(type)) {
    return res.status(404).render("404", {
      layout: "layout",
      title: "Page Not Found",
      user: req.user,
      loggedIn: true,
    });
  }

  // Choose title dynamically
  const title =
    type === "password" ? "Security Password Changes" : "Security PIN Changes";

  res.render(`security-${type}`, {
    layout: "layout",
    title,
    user: req.user,
    loggedIn: true,
    active: "security",
    security: { type },
  });
});

// Settings page
router.get("/settings", verifyToken, (req, res) => {
  res.render("settings", {
    layout: "layout",
    title: "Settings",
    user: req.user,
    loggedIn: true,
    active: "settings",
  });
});

// settings
router.post("/settings", verifyToken, updateSettings);

// Profile page
router.get("/profile", verifyToken, (req, res) => {
  res.render("profile", {
    layout: "layout",
    title: "Profile",
    user: req.user,
    loggedIn: true,
    active: "profile",
  });
});

// Logout
router.get("/logout", verifyToken, logout);

// Profile update routes
router.put("/profile/:userId/details", verifyToken, profileDetails);
router.put("/profile/:userId/picture", verifyToken, upload, profilePicture);

/* ===========================
NOTIFICATION ROUTES
=========================== */

// Get user notifications
router.get("/notifications", verifyToken, async (req, res) => {
  try {
    const { page, limit, unreadOnly } = req.query;
    const result = await NotificationService.getUserNotifications(req.user.id, {
      page,
      limit,
      unreadOnly: unreadOnly === "true",
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
});

// Mark notification as read
router.patch("/notifications/:id/read", verifyToken, async (req, res) => {
  try {
    const notification = await NotificationService.markAsRead(
      req.user.id,
      req.params.id
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
});

// Mark all notifications as read
router.patch("/notifications/read-all", verifyToken, async (req, res) => {
  try {
    await NotificationService.markAllAsRead(req.user.id);

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
    });
  }
});

// Delete notification
router.delete("/notifications/:id", verifyToken, async (req, res) => {
  try {
    const notification = await NotificationService.deleteNotification(
      req.user.id,
      req.params.id
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
});

module.exports = router;
