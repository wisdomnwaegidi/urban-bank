const mongoose = require("mongoose");

const beneficiarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Userdb",
      required: true,
    },
    name: { type: String, required: true },
    accountNumber: { type: String, required: true },
    bank: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Beneficiary", beneficiarySchema);
