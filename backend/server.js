const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();

// ✅ CORS yapılandırması
const allowedOrigins = [
  "https://huawei-cloud-ai-bootcamp.vercel.app", // ✅ Production
];

// ⛔ Geçici olarak localhost'u da ekliyoruz


const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"], // ✅ PATCH eklendi
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// Diğer middleware’ler
app.use(express.json());

// Route'lar
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api', require('./routes/authRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
const certificateRoutes = require("./routes/certificateRoutes");
app.use("/api/certificates", certificateRoutes);
app.use("/api/profile", require("./routes/profileRoutes"));


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
