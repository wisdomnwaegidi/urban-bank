const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const connectDB = require("./server/database/connection");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const expressLayouts = require("express-ejs-layouts");
const http = require("http");
const { Server } = require("socket.io");
const { initNotification } = require("./server/utils/notification");
const adminRoute = require("./server/routes/adminRoutes");


dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 8081;

const server = http.createServer(app);

// ===== Connect to DB =====
connectDB();

// ===== Socket.io Middleware =====
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

initNotification(io);

// ===== Middleware =====
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(cookieParser());
app.use(morgan("tiny"));

// ===== Static Files =====
app.use("/css", express.static(path.resolve(__dirname, "public/css")));
app.use("/image", express.static(path.resolve(__dirname, "public/image")));
app.use("/js", express.static(path.resolve(__dirname, "public/js")));
app.use("/favicon", express.static(path.resolve(__dirname, "public/favicon")));
app.use("/font", express.static(path.resolve(__dirname, "public/font")));

// ===== View Engine =====
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ===== Middleware to conditionally use layouts =====
const conditionalLayout = (req, res, next) => {
  if (
    req.path.startsWith("/dashboard") ||
    req.path.startsWith("/profile") ||
    req.path.startsWith("/overview") ||
    req.path.startsWith("/accounts") ||
    req.path.startsWith("/cards") ||
    req.path.startsWith("/transfers/local") ||
    req.path.startsWith("/transfers/international") ||
    req.path.startsWith("/transfers/mobile-transfer") ||
    req.path.startsWith("/transfers/history") ||
    req.path.startsWith("/loan/application") ||
    req.path.startsWith("/loan/status") ||
    req.path.startsWith("/analytics") ||
    req.path.startsWith("/security/password") ||
    req.path.startsWith("/security/pin") ||
    req.path.startsWith("/settings")
  ) {
    expressLayouts(req, res, next);
    res.locals.layout = "layout";
  } else {
    next();
  }
};

// Apply conditional layout middleware
app.use(conditionalLayout);

// Public routes
const publicRouter = require("./server/routes/router");
app.use("/", publicRouter);
app.use("/admin", adminRoute);


// Refactor publicRouter to pages without auth
// Refactor publicRouter pages with auth
// Refactor publicRouter protected routes with token

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], 
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
  })
);


// ===== Error handler =====
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).send("Something broke!");
});

// ===== Start Server =====
server.listen(PORT, () => {
  console.log(`🚀 Server running with Socket.IO on http://localhost:${PORT}`);
});

// module.exports = { app, server, io};
