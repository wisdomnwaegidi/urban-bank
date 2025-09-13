require("dotenv").config();

const mongoose = require("mongoose");
const Userdb = require("../server/models/userModel");


(async () => {
  try {
    // ✅ Connect to Mongo
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bankapp",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("📡 Connected to MongoDB");

    // ✅ Check if admin exists
    const exists = await Userdb.findOne({ email: "admin@bank.com" });
    if (!exists) {
      // ✅ Let the User model pre-save hook handle password hashing
      await Userdb.create({
        firstName: "Super",
        lastName: "Admin",
        email: "admin@bank.com",
        phone: "08012345678",
        password: "333", // Raw password - will be hashed by pre-save hook
        role: "admin",
        accountBalance: 20000000,
      });
      console.log("✅ Admin created with password: 333");
    } else {
      console.log("⚡ Admin already exists");
    }

    process.exit();
  } catch (err) {
    console.error("❌ Error seeding admin:", err);
    process.exit(1);
  }
})();
