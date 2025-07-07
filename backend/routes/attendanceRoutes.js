// routes/attendanceRoutes.js

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Session = require('../models/Session');

// ----------------------------
// Katılımcı için oturum bilgilerini getir
// ----------------------------
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const sessions = await Session.find().sort({ week: 1 });

    // Yalnızca oturum açmış kullanıcıya ait kayıtlar
    const attendanceRecords = await Attendance.find({ userId: req.user.id });

    // Her hafta için o kullanıcıya ait katılım var mı diye bak
    const sessionsWithAttendance = sessions.map((session) => {
      const attended = attendanceRecords.some(
        record =>
          Number(record.week) === Number(session.week) &&
          record.attended === true
      );
      return {
        week: session.week,
        active: session.active,
        attended
      };
    });

    return res.json({
      success: true,
      fullName: req.user.fullName,
      sessions: sessionsWithAttendance
    });
  } catch (err) {
    console.error('❌ Oturum bilgileri alınamadı:', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası' });
  }
});

// ----------------------------
// Katılım işaretleme endpoint'i (Katılımcı)
// ----------------------------
router.post('/:week', authenticate, async (req, res) => {
  try {
    const weekNum = Number(req.params.week);

    // Bu hafta aktif mi?
    const activeSession = await Session.findOne({ week: weekNum, active: true });
    if (!activeSession && req.user.role === 'participant') {
      return res.status(400).json({ success: false, error: 'Bu hafta için yoklama alınmıyor' });
    }

    // Upsert: sadece bu kullanıcı/haftaya ait kaydı ekle/güncelle
    const attendance = await Attendance.findOneAndUpdate(
      { userId: req.user.id, week: weekNum },
      {
        $set: {
          userId: req.user.id,
          week: weekNum,
          attended: true,
          timestamp: new Date()
        }
      },
      { upsert: true, new: true }
    );

    return res.json({
      success: true,
      message: `${weekNum}. hafta katılımı kaydedildi`,
      attendance
    });
  } catch (err) {
    console.error('❌ Katılım kaydedilemedi:', err);
    return res.status(500).json({ success: false, error: 'Katılım kaydedilemedi' });
  }
});

// ----------------------------
// Eğitmen rotaları – tümü authenticate altında
// ----------------------------
router.use(authenticate);

// Haftalık özet verileri
router.get('/summary', async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }
    const sessions = await Session.find().sort({ week: 1 });
    const participants = await User.countDocuments({ role: 'participant' });

    const summaryData = await Promise.all(
      sessions.map(async session => {
        const attended = await Attendance.countDocuments({
          week: session.week,
          attended: true
        });
        return {
          week: session.week,
          attended,
          total: participants,
          rate: participants > 0 ? Math.round((attended / participants) * 100) : 0,
          active: session.active
        };
      })
    );
    res.json(summaryData);
  } catch (err) {
    console.error('❌ Özet alınamadı:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Haftalık detayları getir
router.get('/details/:week', async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }
    const weekNum = Number(req.params.week);
    const totalWeeks = await Session.countDocuments();
    const participants = await User.find({ role: 'participant' }).select('_id fullName email');
    const attendanceRecords = await Attendance.find({ attended: true });

    const present = participants
      .filter(p =>
        attendanceRecords.some(r =>
          r.week === weekNum &&
          r.userId.toString() === p._id.toString() &&
          r.attended === true
        )
      )
      .map(p => {
        const attendedWeeks = attendanceRecords.filter(r =>
          r.userId.toString() === p._id.toString() && r.attended === true
        ).length;
        const rate = totalWeeks > 0 ? Math.round((attendedWeeks / totalWeeks) * 100) : 0;
        return {
          id: p._id,
          name: p.fullName,
          email: p.email,
          attended: attendedWeeks,
          totalWeeks,
          rate
        };
      });

    res.json({ present });
  } catch (err) {
    console.error('❌ Detaylar alınamadı:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Yoklamayı başlat
router.post('/:week/start', async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }
    const weekNum = Number(req.params.week);
    await Session.updateMany({}, { active: false });
    await Session.findOneAndUpdate({ week: weekNum }, { active: true }, { upsert: true });
    res.json({ success: true, message: `${weekNum}. hafta yoklaması başlatıldı` });
  } catch (err) {
    console.error('❌ Başlatma başarısız:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Yoklamayı durdur
router.post('/:week/stop', async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }
    const weekNum = Number(req.params.week);
    await Session.findOneAndUpdate({ week: weekNum }, { active: false });
    res.json({ success: true, message: `${weekNum}. hafta yoklaması durduruldu` });
  } catch (err) {
    console.error('❌ Durdurma başarısız:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Katılımcıların genel katılım oranları
router.get('/participants-summary', async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }
    const totalWeeks = await Session.countDocuments();
    const participants = await User.find({ role: 'participant' }).select('_id fullName');
    const allAttendance = await Attendance.find({ attended: true });

    const result = participants.map(p => {
      const attendedCount = allAttendance.filter(a =>
        a.userId.toString() === p._id.toString()
      ).length;
      const rate = totalWeeks > 0 ? Math.round((attendedCount / totalWeeks) * 100) : 0;
      return {
        name: p.fullName,
        attended: attendedCount,
        totalWeeks,
        rate
      };
    });
    res.json(result);
  } catch (err) {
    console.error('❌ Katılım oranları alınamadı:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Genel katılım özeti - tüm kullanıcılar
router.get('/general-summary', authenticate, async (req, res) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ error: 'Yetkisiz erişim' });
  }

  try {
    const users = await User.find({ role: 'participant' });
    const sessions = await Session.find();
    
    const generalSummary = await Promise.all(
      users.map(async (user) => {
        const attendances = await Attendance.find({ userId: user._id, attended: true });
        const attendedWeeks = attendances.length;
        const totalWeeks = sessions.length;
        const rate = totalWeeks > 0 ? Math.round((attendedWeeks / totalWeeks) * 100) : 0;
        
        return {
          id: user._id,
          name: user.fullName,
          email: user.email,
          attended: attendedWeeks,
          totalWeeks,
          rate
        };
      })
    );

    generalSummary.sort((a, b) => b.rate - a.rate);

    res.json(generalSummary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
