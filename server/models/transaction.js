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
    // Extra fields for international
    iban: { type: String, trim: true },
    swift: { type: String, trim: true },
    beneficiaryName: { type: String, trim: true },
    beneficiaryBank: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
