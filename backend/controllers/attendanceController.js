const Attendance = require('../models/Attendance');
const Session = require('../models/Session');

exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find().sort({ week: 1 });
    const attendance = await Attendance.find({ userId: req.user.id });

    const enriched = sessions.map((session) => {
      const day1 = attendance.some((a) => a.week === session.week && a.day === 1 && a.attended);
      const day2 = attendance.some((a) => a.week === session.week && a.day === 2 && a.attended);

      return {
        week: session.week,
        active: session.active,
        day1Attended: day1,
        day2Attended: day2,
      };
    });

    const totalDays = sessions.length * 2;
    const attendedDays = enriched.filter((s) => s.day1Attended).length + enriched.filter((s) => s.day2Attended).length;
    const rate = totalDays > 0 ? Math.round((attendedDays / totalDays) * 100) : 0;

    res.json({
      sessions: enriched,
      fullName: req.user.fullName,
      attendanceRate: rate,
    });
  } catch (err) {
    console.error("❌ Oturumlar getirilemedi:", err);
    res.status(500).json({ error: 'Oturumlar yüklenemedi' });
  }
};

console.log("📩 Gelen veri:", req.params, req.body);

exports.markAttendance = async (req, res) => {
  const { week } = req.params;
  const { day } = req.body;

  if (![1, 2].includes(Number(day))) {
    return res.status(400).json({ error: 'Geçersiz gün numarası' });
  }

  try {
    const session = await Session.findOne({ week });

    if (!session) {
      return res.status(404).json({ error: 'Hafta bulunamadı' });
    }

    const active = session.activeDays?.[`day${day}`];
    if (!active) {
      return res.status(400).json({ error: 'Bu gün aktif değil' });
    }

    const filter = { userId: req.user.id, week: Number(week), day: Number(day) };
    const update = {
      $set: {
        attended: true,
        timestamp: new Date(),
      },
    };

    await Attendance.updateOne(filter, update, { upsert: true }); // ✅ Eğer varsa güncelle, yoksa oluştur

    res.json({ success: true, message: `${week}. hafta ${day}. gün katılım alındı.` });
  } catch (err) {
    console.error("❌ Yoklama hatası:", err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};
