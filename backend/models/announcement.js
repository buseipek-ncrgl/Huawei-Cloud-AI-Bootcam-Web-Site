const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true  // Başlık boş geçilmesin
  },
  content: {
    type: String,
    required: true  // İçerik boş geçilmesin
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Announcement", announcementSchema);
