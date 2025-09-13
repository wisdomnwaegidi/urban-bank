const express = require("express");
const {
  registerUserValidator,
  loginUserValidator,
} = require("../validators/useValidator");
const verifyToken = require("../middleware/verifyToken");
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
  getLocalTransfer,
  getStatement,
  getMonthlyStatement,
  getDateReport,
  getTransferHistory,
  getOverview,
  internationalTransfer,
  applyForLoan,
  getLoanStatus,
  mobileTransfer,
  updatePassword,
  updatePin,
  updateSettings,
  exportStatementPDF,
  exportStatementExcel,
  cards,
  getCards,
  support,
  getSupportRequests,
  updateSupportStatus,
} = require("../controller/userController");
const upload = require("../middleware/multer");
const isAdmin = require("../middleware/isAdmin");

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

router.get("/index-2", (req, res) => {
  res.render("index-2", {
    layout: false,
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

// Cards page
router.post("/cards/apply", verifyToken, cards);

router.get("/cards", verifyToken, getCards);

// Transfers page
// GET route (use controller, not inline render) // Local transfer
router.get("/transfers/local", verifyToken, getLocalTransfer);

// POST route
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

// Mobile transfer
router.get("/transfers/mobile-transfer", verifyToken, (req, res) => {
  res.render("transfers-mobile", {
    layout: "layout",
    title: "Mobile Transfer",
    user: req.user,
    loggedIn: true,
    active: "transfers",
  });
});

router.post("/transfers/mobile-transfer", verifyToken, mobileTransfer);

// History
router.get("/transfers/history", verifyToken, getTransferHistory);

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
    loans: [],
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

// loan route
router.post("/loan/application", verifyToken, applyForLoan);

// Analytics route
router.get("/analytics", verifyToken, (req, res) => {
  res.render("analytics", {
    layout: "layout",
    title: "Analytics",
    user: req.user,
    loggedIn: true,
    active: "analytics",
  });
});

// Security routes
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

// Settings route
router.get("/settings", verifyToken, (req, res) => {
  res.render("settings", {
    layout: "layout",
    title: "Settings",
    user: req.user,
    loggedIn: true,
    active: "settings",
  });
});

// POST settings
router.post("/settings", verifyToken, updateSettings);


router.post("/security/password", verifyToken, updatePassword);

// updatePin;
router.post("/security/pin", verifyToken, updatePin);

// Profile routes
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

// support page
router.post("/support", verifyToken, support);

// Admin support routes
router.get("/admin/support", verifyToken, isAdmin, getSupportRequests);
router.patch("/admin/support/:id", verifyToken, isAdmin, updateSupportStatus);

/* ===========================
NOTIFICATION ROUTES
=========================== */

module.exports = router;
