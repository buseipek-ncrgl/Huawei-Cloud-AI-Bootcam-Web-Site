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
// Katılımcı için oturum bilgilerini getir
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const sessions = await Session.find().sort({ week: 1 });

    // Katılımcının kendi yoklama kayıtları
    const attendanceRecords = await Attendance.find({ userId: req.user.id });

    // Her hafta için verileri oluştur
    const sessionsWithAttendance = sessions.map((session) => {
      const attended = attendanceRecords.some(
        record =>
          Number(record.week) === Number(session.week) &&
          record.attended === true
      );

      return {
        week: session.week,
        active: session.active,
        attended,
        topic: session.topic || "",       // 💡 Konu ekleniyor
        videoUrl: session.videoUrl || "",  // 💡 Video linki ekleniyor
        mediumUrl: session.mediumUrl || ""
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
// Katılım işaretleme endpoint'i (Katılımcı) – GÜN destekli
router.post('/:week', authenticate, async (req, res) => {
  try {
    const weekNum = Number(req.params.week);
    const dayNum = Number(req.body.day); // 👈 Gün bilgisi body’den alınıyor

    if (![1, 2].includes(dayNum)) {
      return res.status(400).json({ success: false, error: 'Gün 1 veya 2 olmalı' });
    }

    // Bu hafta aktif mi?
    const activeSession = await Session.findOne({ week: weekNum, active: true });
    if (!activeSession && req.user.role === 'participant') {
      return res.status(400).json({ success: false, error: 'Bu hafta için yoklama alınmıyor' });
    }

    // Upsert: kullanıcı + hafta + gün için
    const attendance = await Attendance.findOneAndUpdate(
      { userId: req.user.id, week: weekNum, day: dayNum },
      {
        $set: {
          userId: req.user.id,
          week: weekNum,
          day: dayNum,
          attended: true,
          timestamp: new Date()
        }
      },
      { upsert: true, new: true }
    );

    return res.json({
      success: true,
      message: `${weekNum}. hafta ${dayNum}. gün katılımı kaydedildi`,
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
    const attendedRecords = await Attendance.find({
      week: session.week,
      attended: true
    });

    const total = participants;
    const day1Attended = attendedRecords.filter(a => a.day === 1).length;
    const day2Attended = attendedRecords.filter(a => a.day === 2).length;

    return {
      week: session.week,
      total,
      // 👇 Günlere göre katılım oranları
      day1Attended,
      day2Attended,
      day1Rate: total > 0 ? Math.round((day1Attended / total) * 100) : 0,
      day2Rate: total > 0 ? Math.round((day2Attended / total) * 100) : 0,
      // 👇 Aktiflik bilgileri (EN KRİTİK NOKTA)
      day1Active: session.activeDays?.day1 || false,
      day2Active: session.activeDays?.day2 || false,
      // Diğer bilgiler
      topic: session.topic || "",
      videoUrl: session.videoUrl || "",
      mediumUrl: session.mediumUrl || ""
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
    const attendanceRecords = await Attendance.find({ attended: true, week: weekNum });

    // Gün bazlı ayır
    const result = { 1: [], 2: [] };

    for (const p of participants) {
      for (const day of [1, 2]) {
        const attended = attendanceRecords.some(
          r => r.userId.toString() === p._id.toString() && r.day === day
        );
        if (attended) {
          const userAllWeeks = await Attendance.find({
            userId: p._id,
            attended: true
          });
          const rate = totalWeeks > 0 ? Math.round((userAllWeeks.length / (totalWeeks * 2)) * 100) : 0;

          result[day].push({
            id: p._id,
            name: p.fullName,
            email: p.email,
            attended: userAllWeeks.length,
            totalWeeks: totalWeeks * 2,
            rate
          });
        }
      }
    }

    res.json({ present: result });
  } catch (err) {
    console.error('❌ Detaylar alınamadı:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Yoklamayı başlat
router.post('/:week/day/:day/start', async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    const { week, day } = req.params;
    if (!['1', '2'].includes(day)) {
      return res.status(400).json({ error: 'Gün 1 ya da 2 olmalı' });
    }

    const field = `activeDays.day${day}`;
    const update = { [field]: true };

    const session = await Session.findOneAndUpdate(
      { week: Number(week) },
      { $set: update },
      { new: true }
    );

    if (!session) return res.status(404).json({ error: 'Hafta bulunamadı' });

    res.json({ success: true, message: `${week}. hafta ${day}. gün başlatıldı` });
  } catch (err) {
    console.error("❌ Gün başlatılamadı:", err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});


// Yoklamayı durdur
router.post('/:week/day/:day/stop', async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    const { week, day } = req.params;
    if (!['1', '2'].includes(day)) {
      return res.status(400).json({ error: 'Gün 1 ya da 2 olmalı' });
    }

    const field = `activeDays.day${day}`;
    const update = { [field]: false };

    const session = await Session.findOneAndUpdate(
      { week: Number(week) },
      { $set: update },
      { new: true }
    );

    if (!session) return res.status(404).json({ error: 'Hafta bulunamadı' });

    res.json({ success: true, message: `${week}. hafta ${day}. gün durduruldu` });
  } catch (err) {
    console.error("❌ Gün durdurulamadı:", err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});


router.get('/participants-summary', async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    const sessions = await Session.find();
    const totalPossibleAttendances = sessions.length * 2; // Her hafta 2 gün

    const participants = await User.find({ role: 'participant' }).select('_id fullName');
    const allAttendance = await Attendance.find({ attended: true });

    const result = participants.map(p => {
      const attendedCount = allAttendance.filter(a =>
        a.userId.toString() === p._id.toString()
      ).length;

      const rate = totalPossibleAttendances > 0
        ? Math.round((attendedCount / totalPossibleAttendances) * 100)
        : 0;

      return {
        name: p.fullName,
        attended: attendedCount,
        totalPossible: totalPossibleAttendances,
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

router.put('/session/:week', authenticate, async (req, res) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ error: 'Yetkisiz erişim' });
  }

  const weekNum = Number(req.params.week);
  const { topic, videoUrl, mediumUrl } = req.body;

  // topic: { day1: "...", day2: "..." } şeklinde gelmeli
  if (!topic || typeof topic !== 'object') {
    return res.status(400).json({ error: "Geçersiz topic verisi" });
  }

  try {
    const session = await Session.findOneAndUpdate(
      { week: weekNum },
      {
        topic: {
          day1: topic.day1 || "",
          day2: topic.day2 || ""
        },
        videoUrl: videoUrl || "",
        mediumUrl: mediumUrl || ""
      },
      { new: true, upsert: true }
    );

    res.json({ message: "Haftalık içerik güncellendi", session });
  } catch (err) {
    console.error("❌ İçerik güncelleme hatası:", err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});
