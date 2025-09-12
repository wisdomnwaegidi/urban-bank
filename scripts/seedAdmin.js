require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../server/models/userModel"); // adjust path to your Userdb

(async () => {
  try {
    // 1. Connect to DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // 2. Check if admin exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists:", existingAdmin.email);
      process.exit(0);
    }

    // 3. Create admin user
    const admin = new User({
      firstName: "System",
      lastName: "Admin",
      email: "admin@urbanbank.com", // required
      phone: "09031916621", // required (dummy Nigerian number)
      password: "Admin@123", // pre-save hook will hash it
      role: "admin",
      isVerified: true,
    });

    await admin.save();
    console.log("🎉 Admin seeded successfully:", admin.email);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding admin:", err);
    process.exit(1);
  }
})();
