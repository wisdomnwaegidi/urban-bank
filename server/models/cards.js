// models/Card.js
const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Userdb",
    required: true,
  },
  network: { type: String, required: true },
  type: { type: String, required: true },
  number: { type: String, required: true },
  cvv: { type: String, required: true },
  expiry: { type: String, required: true },
});

module.exports = mongoose.model("Card", cardSchema);
