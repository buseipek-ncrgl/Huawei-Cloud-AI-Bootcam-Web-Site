// models/Session.js
const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  week: {
    type: Number,
    required: true,
    unique: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
  topic: {
    type: String,
    default: "", // Boş olabilir, sonra instructor tarafından eklenir
  },
  videoUrl: {
    type: String,
    default: "", // Boş olabilir, sonra instructor tarafından eklenir
  }
});

module.exports = mongoose.model("Session", sessionSchema);
