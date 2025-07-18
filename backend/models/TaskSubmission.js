const mongoose = require('mongoose');

const TaskSubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fullName: String,   // 👈 ekledik
  email: String,      // 👈 ekledik
  week: Number,
  fileUrl: String,
  taskIndex: Number, // 👈 bu satır
  submittedAt: { type: Date, default: Date.now },
  status: {
  type: String,
  enum: ['pending', 'approved', 'rejected'],
  default: 'pending'
},
feedback: {
  type: String,
  default: ''
},
taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }

});


module.exports = mongoose.model('TaskSubmission', TaskSubmissionSchema);
