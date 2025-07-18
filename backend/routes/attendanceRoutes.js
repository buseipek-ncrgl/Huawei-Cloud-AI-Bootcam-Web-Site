// routes/attendanceRoutes.js

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Session = require('../models/Session');
const TaskSubmission = require('../models/TaskSubmission');
const Announcement = require('../models/announcement');


// ----------------------------
// Katılımcı için oturum bilgilerini getir
// ----------------------------
// Katılımcı için oturum bilgilerini getir
// Katılımcı için oturum bilgilerini getir
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const sessions = await Session.find().sort({ week: 1 });

    // Katılımcının kendi yoklama kayıtları
    const attendanceRecords = await Attendance.find({ userId: req.user.id });

    // ✅ Katılımcının tüm görev gönderimlerini çek
    const submissions = await TaskSubmission.find({ userId: req.user.id });

    // Her hafta için verileri oluştur
    const sessionsWithAttendance = sessions.map((session) => {
      const attendedDay1 = attendanceRecords.some(
        record =>
          Number(record.week) === Number(session.week) &&
          record.day === 1 &&
          record.attended === true
      );
      const attendedDay2 = attendanceRecords.some(
        record =>
          Number(record.week) === Number(session.week) &&
          record.day === 2 &&
          record.attended === true
      );

      // ✅ Bu haftaya ait gönderilen görevleri filtrele
     const weekSubmissions = submissions
  .filter(s => Number(s.week) === Number(session.week))
  .map(s => ({
    id: s._id,
    fileUrl: s.fileUrl,
    submittedAt: s.createdAt,
    status: s.status,             // 👈 Bunu ekle
    feedback: s.feedback || "",   // 👈 Geri bildirim de gösterilsin
  }));


      return {
        week: session.week,
        topic: session.topic || { day1: "", day2: "" },
        videoUrl: session.videoUrl || { day1: "", day2: "" },
        mediumUrl: session.mediumUrl || { day1: "", day2: "" },
        activeDay1: session.activeDays?.day1 || false,
        activeDay2: session.activeDays?.day2 || false,
        attendedDay1,
        attendedDay2,
        tasks: session.tasks || [],
        taskActive: session.taskActive || false,
        submissions: weekSubmissions  // ✅ Yeni alan
      };
    });

    return res.json({
      success: true,
      fullName: req.user.fullName,
      email: req.user.email,  // 👈 bunu ekle
      sessions: sessionsWithAttendance
    });
  } catch (err) {
    console.error('❌ Oturum bilgileri alınamadı:', err);
    return res.status(500).json({ success: false, error: 'Sunucu hatası' });
  }
});

// Katılım işaretleme endpoint'i (Katılımcı) – GÜN destekli
router.post('/:week', authenticate, async (req, res) => {
  try {
    const weekNum = Number(req.params.week);
    const dayNum = Number(req.body.day);

    if (![1, 2].includes(dayNum)) {
      return res.status(400).json({ success: false, error: 'Gün 1 veya 2 olmalı' });
    }

    // Aktif gün kontrolü
    const activeSession = await Session.findOne({ week: weekNum });

    if (
      !activeSession ||
      !activeSession.activeDays ||
      !activeSession.activeDays[`day${dayNum}`]
    ) {
      return res.status(400).json({ success: false, error: 'Bu gün için yoklama alınmıyor' });
    }

    // ❗ Yalnızca güncellenecek alanları set ediyoruz (unique alanları değil!)
   const attendance = await Attendance.findOneAndUpdate(
  { userId: req.user.id, week: weekNum, day: dayNum },
  {
    $set: {
      attended: true,
      timestamp: new Date()
    }
  },
  {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  }
);



    return res.json({
      success: true,
      message: `${weekNum}. hafta ${dayNum}. gün katılımı kaydedildi`,
      attendance
    });
  } catch (err) {
    console.error('❌ Katılım kaydedilemedi:', err.message);
    console.error(err.stack);
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

    // 👇 EKLE — eksik olan bu!
    // summary endpoint içi
const weekSubmissions = await TaskSubmission.find({ week: session.week })
  .populate("userId", "fullName email"); // 🧩 BU SATIRI EKLE

return {
  week: session.week,
  total,
  day1Attended,
  day2Attended,
  day1Rate: total > 0 ? Math.round((day1Attended / total) * 100) : 0,
  day2Rate: total > 0 ? Math.round((day2Attended / total) * 100) : 0,
  day1Active: session.activeDays?.day1 || false,
  day2Active: session.activeDays?.day2 || false,
  topic: session.topic || "",
  videoUrl: session.videoUrl || "",
  mediumUrl: session.mediumUrl || "",
  tasks: session.tasks || [],
  taskActive: session.taskActive || false,
  submissions: weekSubmissions.map(s => ({
  id: s._id,
  fileUrl: s.fileUrl,
  submittedAt: s.createdAt,
  name: s.userId?.fullName || "—",
  email: s.userId?.email || "—",
  status: s.status || "pending" // 🔧 BURASI EKLENİYOR
}))

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
    // 🔽 Ek: Bu haftaya ait tüm görev gönderimlerini al
const taskSubmissions = await TaskSubmission.find({ week: weekNum }).populate("userId", "fullName email");


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

    res.json({
  present: result,
  taskSubmissions: taskSubmissions.map(s => ({
    id: s._id,
    fileUrl: s.fileUrl,
    submittedAt: s.createdAt,
    name: s.userId.fullName,
    email: s.userId.email
  }))
});
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

    // 👇 Toplam açılan görev sayısı (her hafta tanımlı görevler sayılır)
    const totalTasksAssigned = sessions.reduce((acc, session) => {
      return acc + (Array.isArray(session.tasks) ? session.tasks.length : 0);
    }, 0);

    const generalSummary = await Promise.all(
      users.map(async (user) => {
        const attendances = await Attendance.find({ userId: user._id, attended: true });

        const taskCount = await TaskSubmission.countDocuments({
          userId: user._id,
          status: 'approved' // ✅ sadece onaylananlar
        });

        const attendedCount = attendances.length;
        const totalWeeks = sessions.length;

        const taskRate = totalTasksAssigned > 0
          ? Math.round((taskCount / totalTasksAssigned) * 100)
          : 0;

        const attendanceRate = totalWeeks > 0
          ? Math.round((attendedCount / (totalWeeks * 2)) * 100)
          : 0;

        return {
          id: user._id,
          name: user.fullName,
          email: user.email,
          attended: attendedCount,
          totalWeeks: totalWeeks * 2,
          rate: attendanceRate,
          taskSubmissions: taskCount,
          totalTasks: totalTasksAssigned,
          taskRate
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

  // Doğrulama
  if (!topic || typeof topic !== 'object') {
    return res.status(400).json({ error: "Geçersiz topic verisi" });
  }

  if (!videoUrl || typeof videoUrl !== 'object') {
    return res.status(400).json({ error: "Geçersiz videoUrl verisi" });
  }

  if (!mediumUrl || typeof mediumUrl !== 'object') {
    return res.status(400).json({ error: "Geçersiz mediumUrl verisi" });
  }

  try {
    const session = await Session.findOneAndUpdate(
      { week: weekNum },
      {
        topic: {
          day1: topic.day1 || "",
          day2: topic.day2 || ""
        },
        videoUrl: {
          day1: videoUrl.day1 || "",
          day2: videoUrl.day2 || ""
        },
        mediumUrl: {
          day1: mediumUrl.day1 || "",
          day2: mediumUrl.day2 || ""
        }
      },
      { new: true, upsert: true }
    );

    res.json({ message: "Haftalık içerik güncellendi", session });
  } catch (err) {
    console.error("❌ İçerik güncelleme hatası:", err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.put('/session/:week/tasks', authenticate, async (req, res) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ error: 'Yetkisiz erişim' });
  }

  const weekNum = Number(req.params.week);
  const { list } = req.body;

  if (!Array.isArray(list)) {
    return res.status(400).json({ error: "Görev listesi dizi olmalı" });
  }

  try {
    const session = await Session.findOneAndUpdate(
  { week: weekNum },
  { $set: { tasks: list } },  // ✅ 'tasks.list' değil, doğrudan 'tasks'
  { new: true }
);


    res.json({ success: true, session });
  } catch (err) {
    console.error("❌ Görevler güncellenemedi:", err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.post('/session/:week/task/start', authenticate, async (req, res) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ error: 'Yetkisiz erişim' });
  }

  const { week } = req.params;
  try {
    const session = await Session.findOneAndUpdate(
      { week: Number(week) },
      { $set: { taskActive: true } },
      { new: true }
    );
    if (!session) return res.status(404).json({ error: 'Hafta bulunamadı' });

    res.json({ success: true, message: "Görev başlatıldı" });
  } catch {
    res.status(500).json({ error: 'Görev başlatılamadı' });
  }
});

router.post('/session/:week/task/stop', authenticate, async (req, res) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ error: 'Yetkisiz erişim' });
  }

  const { week } = req.params;
  try {
    const session = await Session.findOneAndUpdate(
      { week: Number(week) },
      { $set: { taskActive: false } },
      { new: true }
    );
    if (!session) return res.status(404).json({ error: 'Hafta bulunamadı' });

    res.json({ success: true, message: "Görev durduruldu" });
  } catch {
    res.status(500).json({ error: 'Görev durdurulamadı' });
  }
});

// Görev gönderimi (katılımcı)
router.post('/session/:week/task', authenticate, async (req, res) => {
  const { fileUrl, taskIndex } = req.body;  // 🟢 taskIndex formdan alınmalı
  const week = Number(req.params.week);

  if (!fileUrl || typeof taskIndex !== 'number') {
    return res.status(400).json({ error: 'Dosya bağlantısı ve görev numarası zorunludur' });
  }

  try {
    const newSubmission = new TaskSubmission({
      userId: req.user.id,
      fullName: req.user.fullName,
      email: req.user.email,
      week,
      fileUrl,
      taskIndex, // ✅ burada kayıt ediliyor
    });

    await newSubmission.save();

    res.json({ success: true, submission: newSubmission });
  } catch (err) {
    console.error("❌ Görev gönderilemedi:", err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.get('/task-submissions', authenticate, async (req, res) => {
  try {
    const submissions = await TaskSubmission.find({ userId: req.user.id }).sort({ submittedAt: -1 });
    res.json({ success: true, submissions });
  } catch (err) {
    console.error("❌ Görevler getirilemedi:", err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.delete('/task-submissions/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  try {
    const submission = await TaskSubmission.findById(id);

    if (!submission) return res.status(404).json({ error: 'Gönderim bulunamadı' });
    if (submission.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Bu gönderimi silemezsiniz' });
    }

    await TaskSubmission.findByIdAndDelete(id);
    res.json({ success: true, message: 'Görev gönderimi silindi' });
  } catch (err) {
    console.error("❌ Silme hatası:", err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// GET /api/announcements - Katılımcılar için
router.get("/announcements", authenticate, async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({ success: true, announcements });
  } catch (err) {
    console.error("Duyurular alınamadı ❌", err);
    res.status(500).json({ success: false, error: "Sunucu hatası" });
  }
});

// Eğitmen görevi onaylar veya reddeder
router.patch('/task-submissions/:id/status', authenticate, async (req, res) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ error: 'Yetkisiz erişim' });
  }

  const { id } = req.params;
  const { status, feedback } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Geçersiz durum' });
  }

  try {
    const submission = await TaskSubmission.findByIdAndUpdate(
      id,
      { status, feedback },
      { new: true }
    );

    if (!submission) return res.status(404).json({ error: 'Görev gönderimi bulunamadı' });

    res.json({ success: true, updated: submission });
  } catch (err) {
    console.error('Görev durumu güncellenemedi:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
