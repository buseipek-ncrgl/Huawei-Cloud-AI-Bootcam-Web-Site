const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const {
  getSessions,
  createSession,
  startSession,
  stopSession,
  updateSessionContent 
} = require('../controllers/sessionController');

// Tüm oturumları getir
router.get('/', authenticate, getSessions);

// ✅ Yeni hafta oluştur
router.post('/create', authenticate, createSession);

// Yoklama başlat/durdur
router.post('/:week/start', authenticate, startSession);
router.post('/:week/stop', authenticate, stopSession);

router.put('/:week/update', authenticate, updateSessionContent);
module.exports = router;
