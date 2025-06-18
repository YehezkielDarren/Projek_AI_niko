const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  isUser: { type: Boolean, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
