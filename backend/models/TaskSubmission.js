const mongoose = require('mongoose');

const TaskSubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  week: { type: Number, required: true },
  fileUrl: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TaskSubmission', TaskSubmissionSchema);
