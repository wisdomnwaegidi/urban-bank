// ========================================
// 1. FIXED USER MODEL (userModel.js)
// ========================================
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d+$/, "Phone number must contain only digits"],
    },
    password: { type: String, required: true },

    // 🔐 PIN (hashed)
    pin: {
      type: String,
      minlength: 4,
      maxlength: 1024, // hash length
    },

    // Password Reset Fields
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    // Profile Info
    dob: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    religion: { type: String, trim: true },

    // Address Info
    location: { type: String, trim: true },
    state: { type: String, trim: true },
    city: { type: String, trim: true },
    country: { type: String, trim: true },
    zipcode: {
      type: String,
      match: [/^\d*$/, "Zipcode must contain only digits"],
    },
    address: { type: String, trim: true },

    // Next of Kin
    nokFirstName: {
      type: String,
      trim: true,
      match: [/^[A-Za-z\s]+$/, "First name cannot contain numbers"],
    },
    nokLastName: {
      type: String,
      trim: true,
      match: [/^[A-Za-z\s]+$/, "Last name cannot contain numbers"],
    },
    relationship: {
      type: String,
      trim: true,
      match: [/^[A-Za-z\s]+$/, "Relationship cannot contain numbers"],
    },
    nokAddress: { type: String, trim: true },

    // System Info
    currency: {
      type: String,
      uppercase: true,
      match: [/^[A-Z]{3,}$/, "Currency must be at least 3 uppercase letters"],
    },
    account: {
      type: String,
      match: [/^\d{10}$/, "Account must be exactly 10 digits"],
    },

    // KYC verification
    kyc: {
      idType: { type: String, enum: ["passport", "driver", "national"] },
      idNumber: { type: String, trim: true },
      address: { type: String, trim: true },
      verified: { type: Boolean, default: false },
    },

    // Account Status
    accountBalance: { type: Number, default: 666000 },

    // roles
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // ✅ USE ONLY ONE APPROVAL FIELD
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // Rest of your fields...
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],

    transactionsHistory: [
      {
        date: { type: Date, default: Date.now },
        type: { type: String, enum: ["Credit", "Debit"], required: true },
        amount: { type: Number, required: true },
        status: {
          type: String,
          enum: ["Completed", "Pending", "Failed"],
          default: "Completed",
        },
        description: { type: String, trim: true },
      },
    ],

    settings: {
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
      language: {
        type: String,
        enum: ["en", "fr", "es"],
        default: "en",
      },
    },

    loanApplications: [
      {
        loanAmount: { type: Number, required: true },
        purpose: { type: String, required: true, trim: true },
        term: { type: Number, required: true },
        interest: { type: String, default: "5% per annum" },
        collateral: { type: String, trim: true },
        applicationDate: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["Pending", "Approved", "Rejected"],
          default: "Pending",
        },
      },
    ],
  },
  { timestamps: true }
);

// Pre-save hook
userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }

    if (this.isModified("pin") && this.pin) {
      this.pin = await bcrypt.hash(this.pin, 10);
    }

    if (!this.currency) {
      this.currency = "DOLLAR";
    }

    if (!this.account) {
      let accountNumber;
      let exists = true;

      while (exists) {
        accountNumber = Math.floor(
          1000000000 + Math.random() * 9000000000
        ).toString();

        const existingUser = await mongoose
          .model("Userdb")
          .findOne({ account: accountNumber });
        if (!existingUser) exists = false;
      }

      this.account = accountNumber;
    }

    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePin = async function (enteredPin) {
  if (!this.pin) {
    throw new Error("PIN is not set for this user");
  }
  return await bcrypt.compare(enteredPin, this.pin);
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ resetPasswordExpires: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Userdb", userSchema);
