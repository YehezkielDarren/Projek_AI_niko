const mongoose = require("mongoose");

const cityAliasSchema = new mongoose.Schema({
  // 'alias' , e.g., "jkt", "kota kembang"
  alias: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // pencarian yang konsisten
    index: true, // mempercepat query pencarian
  },

  cityName: {
    type: String,
    required: true,
    lowercase: true,
  },
});

module.exports = mongoose.model("CityAlias", cityAliasSchema);
