const Session = require('../models/Session');

// Tüm oturumları getir
exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find().sort({ week: 1 });
    res.json(sessions);
  } catch (err) {
    console.error('❌ Oturumlar getirilemedi:', err);
    res.status(500).json({ error: 'Oturumlar yüklenemedi' });
  }
};

// Yeni hafta oluştur (eğitmen)
exports.createSession = async (req, res) => {
  const { week } = req.body;

  if (!week || isNaN(week)) {
    return res.status(400).json({ error: 'Geçerli bir hafta numarası giriniz' });
  }

  try {
    const exists = await Session.findOne({ week });
    if (exists) {
      return res.status(400).json({ error: 'Bu hafta zaten mevcut' });
    }

    const session = await Session.create({ week, active: false });
    res.json({ success: true, message: `${week}. hafta başarıyla oluşturuldu`, session });

  } catch (err) {
    console.error('❌ Hafta oluşturulamadı:', err);
    res.status(500).json({ error: 'Hafta oluşturulamadı' });
  }
};

// Hafta başlat (sadece eğitmen)
exports.startSession = async (req, res) => {
  const { week } = req.params;
  try {
    await Session.updateMany({}, { active: false }); // diğer tüm haftaları pasif yap
    const session = await Session.findOneAndUpdate(
      { week },
      { active: true },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Hafta bulunamadı' });
    }

    res.json({ message: `${week}. hafta yoklaması başlatıldı`, session });
  } catch (err) {
    console.error('❌ Hafta başlatılamadı:', err);
    res.status(500).json({ error: 'Hafta başlatılamadı' });
  }
};

// Hafta durdur (sadece eğitmen)
exports.stopSession = async (req, res) => {
  const { week } = req.params;
  try {
    const session = await Session.findOneAndUpdate(
      { week },
      { active: false },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Hafta bulunamadı' });
    }

    res.json({ message: `${week}. hafta yoklaması durduruldu`, session });
  } catch (err) {
    console.error('❌ Hafta durdurulamadı:', err);
    res.status(500).json({ error: 'Hafta durdurulamadı' });
  }
};

exports.updateSessionContent = async (req, res) => {
  const { week } = req.params;
  const { topic, videoUrl, mediumUrl } = req.body;

  try {
    const session = await Session.findOneAndUpdate(
      { week },
      { topic, videoUrl, mediumUrl },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Hafta bulunamadı' });
    }

    res.json({ message: 'Hafta içeriği güncellendi', session });
  } catch (err) {
    console.error('❌ İçerik güncelleme hatası:', err);
    res.status(500).json({ error: 'İçerik güncellenemedi' });
  }
};
