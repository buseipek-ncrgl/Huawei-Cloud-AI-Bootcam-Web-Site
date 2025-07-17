const mongoose = require("mongoose");

const taskSubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  week: { type: Number, required: true },
  fileUrl: { type: String, default: "" },  // Google Drive, GitHub, PDF vs.
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("TaskSubmission", taskSubmissionSchema);
