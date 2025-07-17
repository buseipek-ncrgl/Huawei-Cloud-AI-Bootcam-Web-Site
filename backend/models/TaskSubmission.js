const mongoose = require('mongoose');

const TaskSubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  week: Number,
  fileUrl: String,
  submittedAt: { type: Date, default: Date.now } // 🔧 Bunu ekle
});

module.exports = mongoose.model('TaskSubmission', TaskSubmissionSchema);
