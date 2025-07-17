const mongoose = require("mongoose");

const taskSubmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  week: {
    type: Number,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  }
}, { timestamps: true }); // ✅ Bunu ekle

module.exports = mongoose.model("TaskSubmission", taskSubmissionSchema);
