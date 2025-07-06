const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api', require('./routes/authRoutes'));


app.get('/', (req, res) => res.send('API Çalışıyor'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Bağlandı'))
  .catch((err) => console.error('❌ MongoDB Hatası:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Sunucu ${PORT} portunda çalışıyor`));
