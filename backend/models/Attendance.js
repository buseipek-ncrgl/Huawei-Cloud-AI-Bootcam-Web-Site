const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  week: { 
    type: Number, 
    required: true 
  },
  attended: { 
    type: Boolean, 
    default: false 
  },
  timestamp: { 
    type: Date 
  }
}, { 
  timestamps: true 
});

// Aynı kullanıcı ve hafta için tek kayıt garantisi
attendanceSchema.index({ userId: 1, week: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);