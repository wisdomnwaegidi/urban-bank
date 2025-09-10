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
      match: [/^\d{6,12}$/, "Account must be 6-12 digits"],
    },

    // KYC verification
    kyc: {
      idType: { type: String, enum: ["passport", "driver", "national"] },
      idNumber: { type: String, trim: true },
      address: { type: String, trim: true },
      verified: { type: Boolean, default: false },
    },

    // Account Status
    accountBalance: { type: Number, default: 40000 },

    // Transactions history
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

    // User Settings
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

    // Loan Applications
    loanApplications: [
      {
        loanAmount: { type: Number, required: true },
        purpose: { type: String, required: true, trim: true },
        term: { type: Number, required: true }, // months
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

// 🔒 Pre-save hook for password and pin
userSchema.pre("save", async function (next) {
  try {
    // Hash password if modified
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }

    // Hash pin if modified
    if (this.isModified("pin") && this.pin) {
      this.pin = await bcrypt.hash(this.pin, 10);
    }

    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare PIN
userSchema.methods.comparePin = async function (enteredPin) {
  return await bcrypt.compare(enteredPin, this.pin);
};

module.exports = mongoose.model("Userdb", userSchema);
