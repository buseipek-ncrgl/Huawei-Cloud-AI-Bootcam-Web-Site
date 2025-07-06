const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['participant', 'instructor'],
    default: 'participant',
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
