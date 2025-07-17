const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();

// ✅ CORS yapılandırması
const corsOptions = {
  origin: "https://huawei-cloud-ai-bootcamp.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};
app.use(cors(corsOptions));

// Diğer middleware’ler
app.use(express.json());

// Route'lar
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api', require('./routes/authRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));

app.get('/', (req, res) => res.send('API Çalışıyor'));

// DB bağlantısı
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('✅ MongoDB Bağlandı'))
  .catch((err) => console.error('❌ MongoDB Hatası:', err));

// Sunucu başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Sunucu ${PORT} portunda çalışıyor`));
