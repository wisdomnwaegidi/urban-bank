const mongoose = require("mongoose");

const supportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Userdb",
      required: true,
    },
    email: { type: String, required: true },
    issue: { type: String, required: true },
    status: { type: String, default: "Pending" }, // Pending, In Progress, Resolved
  },
  { timestamps: true }
);

module.exports = mongoose.model("Support", supportSchema);
