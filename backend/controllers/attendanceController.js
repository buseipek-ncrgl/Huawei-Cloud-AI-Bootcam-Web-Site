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


exports.markAttendance = async (req, res) => {
  const { week, day } = req.params;

  if (![1, 2].includes(Number(day))) {
    return res.status(400).json({ error: 'Geçersiz gün numarası' });
  }

  try {
    const session = await Session.findOne({ week });
    if (!session || !session.active) {
      return res.status(400).json({ error: 'Aktif olmayan hafta' });
    }

    const filter = { userId: req.user.id, week, day: Number(day) };

    const existing = await Attendance.findOne(filter);
    if (existing) {
      existing.attended = true;
      existing.timestamp = new Date();
      await existing.save();
    } else {
      await Attendance.create({
        ...filter,
        attended: true,
        timestamp: new Date(),
      });
    }

    res.json({ message: `${week}. hafta, ${day}. gün yoklaması alındı.` });
  } catch (err) {
    console.error("❌ Yoklama hatası:", err);
    res.status(500).json({ error: 'Yoklama alınamadı' });
  }
};
