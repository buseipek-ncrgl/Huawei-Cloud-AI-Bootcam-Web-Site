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
});

module.exports = mongoose.model("Session", sessionSchema);
