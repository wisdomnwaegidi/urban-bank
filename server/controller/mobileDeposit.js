// POST /transfers/mobile-deposit
exports.mobileDeposit = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { phoneNumber, amount, description } = req.body;
    const depositAmount = parseFloat(amount);

    if (!depositAmount || depositAmount <= 0) {
      return res.status(400).json({ message: "Invalid deposit amount" });
    }

    // find user
    const user = await Userdb.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // update balance
    user.accountBalance += depositAmount;

    // push to embedded transactionsHistory
    user.transactionsHistory.push({
      date: new Date(),
      type: "Credit", 
      amount: depositAmount,
      status: "Completed",
      description: description || `Mobile deposit from ${phoneNumber}`,
    });

    await user.save();

    // also save to Transaction collection
    await Transaction.create({
      userId,
      type: "Mobile Deposit",
      phoneNumber, // ✅ matches schema
      mobileBeneficiaryName: user.firstName + " " + user.lastName,
      description: description || `Mobile deposit from ${phoneNumber}`,
      debit: 0,
      credit: depositAmount,
      balance: user.accountBalance,
    });


    // Socket.io notification
    sendNotification(userId, {
      type: "Mobile Deposit",
      amount: depositAmount,
      timestamp: Date.now(),
    });

    res.status(200).json({
      message: "Mobile deposit successful",
      newBalance: user.accountBalance,
    });
  } catch (err) {
    console.error("Mobile deposit error:", err);
    res.status(500).json({ message: "Error processing deposit" });
  }
};

// Schema for controller
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

