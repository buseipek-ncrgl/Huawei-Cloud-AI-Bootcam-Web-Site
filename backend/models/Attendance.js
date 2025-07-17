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
  day: {
    type: Number,
    enum: [1, 2], // sadece 1 veya 2 olabilir
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

// Aynı kullanıcı, aynı hafta ve aynı gün için tek kayıt garantisi
attendanceSchema.index({ userId: 1, week: 1, day: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
