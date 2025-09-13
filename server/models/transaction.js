const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Userdb",
      required: true,
    },
    date: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ["Local", "International", "Mobile Transfer"],
      default: "Local",
    },
    description: { type: String, trim: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    balance: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Completed", "Pending", "Failed"],
      default: "Completed",
    },

    // International
    iban: { type: String, trim: true },
    swift: { type: String, trim: true },
    beneficiaryName: { type: String, trim: true },
    beneficiaryBank: { type: String, trim: true },

    // Local transfer fields
    localBeneficiaryName: { type: String, trim: true },
    localBeneficiaryBank: { type: String, trim: true },
    localAccountNumber: { type: String, trim: true },

    // Mobile deposit
    phoneNumber: { type: String, trim: true },
    mobileBeneficiaryName: { type: String, trim: true },

    // optional: store reference to Beneficiary document (if you want)
    beneficiary: { type: mongoose.Schema.Types.ObjectId, ref: "Beneficiary" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);

/* const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Userdb",
      required: true,
    },
    date: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ["Local", "International", "Mobile Deposit"],
      default: "Local",
    },
    description: { type: String, trim: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    balance: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Completed", "Pending", "Failed"],
      default: "Completed",
    },

    // International
    iban: { type: String, trim: true },
    swift: { type: String, trim: true },
    beneficiaryName: { type: String, trim: true },
    beneficiaryBank: { type: String, trim: true },

    // Local Transfer
    localBeneficiaryName: { type: String, trim: true },
    localBeneficiaryBank: { type: String, trim: true },
    localAccountNumber: { type: String, trim: true },

    // Mobile Deposit
    mobileNumber: { type: String, trim: true },
    mobileBeneficiaryName: { type: String, trim: true },
  },
  { timestamps: true }
); */
