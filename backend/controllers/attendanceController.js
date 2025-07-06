const Attendance = require('../models/Attendance');
const Session = require('../models/Session');

exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find().sort({ week: 1 });
    const attendance = await Attendance.find({ userId: req.user.id });

    const enriched = sessions.map((session) => {
      const attended = attendance.some((a) => a.week === session.week && a.attended);
      return {
        week: session.week,
        active: session.active,
        attended,
      };
    });

    // Katılım yüzdesi hesaplama
    const totalWeeks = sessions.length;
    const attendedWeeks = enriched.filter((s) => s.attended).length;
    const rate = totalWeeks > 0 ? Math.round((attendedWeeks / totalWeeks) * 100) : 0;

    res.json({ 
      sessions: enriched, 
      fullName: req.user.fullName,
      attendanceRate: rate // ✅ yeni eklenen alan
    });
  } catch (err) {
    res.status(500).json({ error: 'Oturumlar yüklenemedi' });
  }
};


exports.markAttendance = async (req, res) => {
  const { week } = req.params;
  try {
    const session = await Session.findOne({ week });
    if (!session || !session.active) {
      return res.status(400).json({ error: 'Aktif olmayan hafta' });
    }

    let record = await Attendance.findOne({ userId: req.user.id, week });
    if (record) {
      record.attended = true;
      record.timestamp = new Date();
      await record.save();
    } else {
      await Attendance.create({
        userId: req.user.id,
        week,
        attended: true,
        timestamp: new Date(),
      });
    }

    res.json({ message: `Hafta ${week} yoklaması alındı.` });
  } catch (err) {
    res.status(500).json({ error: 'Yoklama alınamadı' });
  }
};
