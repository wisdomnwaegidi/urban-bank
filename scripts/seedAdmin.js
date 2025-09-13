// seedAdmin.js
const Userdb = require("../server/models/userModel");
const bcrypt = require("bcryptjs");

(async () => {
  const exists = await Userdb.findOne({ email: "admin@bank.com" });
  if (!exists) {
    const password = await bcrypt.hash("Admin123!", 10);
    await Userdb.create({
      firstName: "Super",
      lastName: "Admin",
      email: "admin@bank.com",
      phone: "08012345678",
      password,
      role: "admin",
      accountBalance: 0,
    });
    console.log("✅ Admin created");
  } else {
    console.log("⚡ Admin already exists");
  }
  process.exit();
})();
