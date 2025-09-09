// server/models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "withdrawal",
        "deposit",
        "transfer",
        "payment",
        "security",
        "general",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      default: null,
    },
    transactionId: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    severity: {
      type: String,
      enum: ["info", "warning", "error", "success"],
      default: "info",
    },
    metadata: {
      accountNumber: String,
      location: String,
      method: String,
      timestamp: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
