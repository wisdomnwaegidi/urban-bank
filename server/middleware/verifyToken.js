const Userdb = require("../models/userModel");
const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  const token = req.cookies["auth_token"];

  if (!token) {
    res.locals.loggedIn = false;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await Userdb.findById(decoded.userId).select("-password");

    if (!user) {
      res.locals.loggedIn = false;
      return next();
    }

    req.user = user;
    res.locals.loggedIn = true;
    res.locals.user = user;
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);
    res.locals.loggedIn = false;
    next();
  }
};

module.exports = verifyToken;
