const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  week: {
    type: Number,
    required: true,
    unique: true,
  },
  activeDays: {
    day1: {
      type: Boolean,
      default: false
    },
    day2: {
      type: Boolean,
      default: false
    }
  },
  topic: {
    day1: {
      type: String,
      default: ""
    },
    day2: {
      type: String,
      default: ""
    }
  },
  videoUrl: {
    type: String,
    default: ""
  },
  mediumUrl: {
    type: String,
    default: ""
  }
});

module.exports = mongoose.model("Session", sessionSchema);
