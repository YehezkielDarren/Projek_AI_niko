const mongoose = require("mongoose");

const conditionSchema = new mongoose.Schema({
  alias: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },

  cityName: {
    type: String,
    required: true,
    lowercase: true,
  },
});

module.exports = mongoose.model("Condition", conditionSchema);
