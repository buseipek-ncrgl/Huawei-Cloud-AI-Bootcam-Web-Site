import { useEffect, useState } from "react";
import axios from "axios";

const InstructorDashboard = () => {
  const [summary, setSummary] = useState([]);
  const [fullName, setFullName] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [details, setDetails] = useState({ present: [] });
  const [showGeneralSummary, setShowGeneralSummary] = useState(false);
  const [generalSummary, setGeneralSummary] = useState([]);
  const [tempTopics, setTempTopics] = useState({});
  const [tempVideos, setTempVideos] = useState({});

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      const [summaryRes, profileRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/attendance/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setSummary(summaryRes.data);
      setFullName(profileRes.data.fullName);
    } catch (err) {
      console.error("❌ Veri alınamadı:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const topicState = {};
    const videoState = {};
    summary.forEach((s) => {
      topicState[s.week] = s.topic || "";
      videoState[s.week] = s.videoUrl || "";
    });
    setTempTopics(topicState);
    setTempVideos(videoState);
  }, [summary]);

  const fetchDetails = async (week) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/attendance/details/${week}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDetails(res.data);
      setSelectedWeek(week);
      setShowGeneralSummary(false);
    } catch (err) {
      console.error("Detaylar alınamadı", err);
    }
  };

  const fetchGeneralSummary = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/attendance/general-summary`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGeneralSummary(res.data);
      setShowGeneralSummary(true);
      setSelectedWeek(null);
    } catch (err) {
      console.error("Genel özet alınamadı", err);
      alert("Genel özet alınamadı");
    }
  };

  const handleStart = async (week) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/sessions/${week}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`${week}. hafta başlatıldı ✅`);
      fetchData();
    } catch {
      alert("Başlatma başarısız");
    }
  };

  const handleStop = async (week) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/sessions/${week}/stop`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`${week}. hafta durduruldu ⛔`);
      fetchData();
    } catch {
      alert("Durdurma başarısız");
    }
  };

  const handleUpdate = async (week) => {
    const token = localStorage.getItem("token");
    const topic = tempTopics[week] ?? "";
    const videoUrl = tempVideos[week] ?? "";

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/sessions/${week}`,
        { topic, videoUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Konu ve video linki güncellendi ✅");
      fetchData();
    } catch (err) {
      console.error("❌ Güncelleme hatası:", err);
      alert(err.response?.data?.error || "Güncelleme hatası ❌");
    }
  };

  return (
    <div className="min-h-screen bg-black bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/background1.png')" }}>
      <div className="min-h-screen bg-black/30 flex flex-col items-center px-4 py-10">
        {/* Başlık */}
        <div className="text-center text-white mb-6">
          <div className="flex justify-center items-center gap-6 mb-4">
            <img src="/huaweilogo.png" alt="Huawei" className="w-32 sm:w-40" />
            <img src="/hsdlogo.png" alt="Partner" className="w-32 sm:w-40" />
          </div>
          <h1 className="text-3xl font-bold text-yellow-400">Huawei Cloud AI Bootcamp</h1>
          <p className="text-white mt-2">Eğitmen: <strong>{fullName}</strong></p>
        </div>

        {/* Hafta ekle formu */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const week = e.target.week.value;
            const token = localStorage.getItem("token");
            try {
              await axios.post(`${import.meta.env.VITE_API_URL}/api/sessions/create`, { week }, {
                headers: { Authorization: `Bearer ${token}` }
              });
              alert(`${week}. hafta oluşturuldu ✅`);
              e.target.reset();
              fetchData();
            } catch (err) {
              alert(err.response?.data?.error || "Hafta oluşturulamadı");
            }
          }}
          className="flex flex-col sm:flex-row items-center gap-2 mb-8"
        >
          <input type="number" name="week" placeholder="Yeni hafta numarası" required className="p-2 rounded text-black" />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Hafta Ekle</button>
        </form>

        {/* Genel özet butonu */}
        <button
          onClick={fetchGeneralSummary}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded mb-8"
        >
          📊 Genel Katılım Özeti
        </button>

        {/* Haftalık kartlar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
  {summary.map((s) => (
    <div
  key={s.week}
  className="relative bg-white/5 border border-white/20 rounded-xl p-5 text-white backdrop-blur-md shadow-md transition hover:scale-[1.015] hover:border-yellow-400"
>
  {s.active && (
    <span className="absolute top-2 right-2 text-green-400 font-bold text-lg">
      ✅ Aktif
    </span>
  )}
  <div className="mb-4">
    <h3 className="text-xl font-bold mb-3 text-yellow-300">{s.week}. Hafta</h3>
    <p className="text-sm text-white/80 mb-1">Katılım: <strong>{s.attended}/{s.total}</strong></p>
    <p className="text-sm text-white/80 mb-4">Oran: <span className="font-semibold text-green-300">{s.rate}%</span></p>

    {s.active ? (
      <button
        onClick={() => handleStop(s.week)}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-4 rounded mb-3"
      >
        ⛔ Yoklamayı Bitir
      </button>
    ) : (
      <button
        onClick={() => handleStart(s.week)}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-4 rounded mb-3"
      >
        ✅ Yoklamayı Başlat
      </button>
    )}

    <button
      onClick={() => fetchDetails(s.week)}
      className="text-sm text-blue-300 underline hover:text-blue-400 mb-3"
    >
      Katılımcı Detayları
    </button>
  </div>
{/* 🎯 Kaydedilmiş Konuların Listesi */}
  {s.topic?.trim() && (
    <div className="text-white text-sm mb-4">
      <p className="font-semibold mb-1">📌 Konular:</p>
      <ul className="list-disc list-inside space-y-1">
        {s.topic
          .split("\n")
          .filter((line) => line.trim() !== "")
          .map((item, idx) => (
            <li key={idx} className="text-white/90">{item}</li>
          ))}
      </ul>
    </div>
  )}

  {/* 🎥 Video Link */}
  {s.videoUrl?.trim() && (
    <div className="text-white text-sm mb-4">
      <p className="font-semibold">🎥 Video Link:</p>
      <a
        href={s.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-300 underline break-all"
      >
        {s.videoUrl}
      </a>
    </div>
  )}
  <div className="text-white text-sm space-y-2 mb-3">
    <label className="block font-semibold text-white">📋 Konuları Güncelle</label>
    <textarea
      rows={2}
      className="w-full p-2 rounded bg-white/10 border border-white/30 text-white placeholder-white/50 backdrop-blur-sm"
      placeholder="Her satıra bir konu yazın"
      value={tempTopics[s.week] ?? s.topic}
      onChange={(e) =>
        setTempTopics((prev) => ({ ...prev, [s.week]: e.target.value }))
      }
    />

    <label className="block font-semibold text-white">🔗 Video Linki Güncelle</label>
    <input
      type="text"
      className="w-full p-2 rounded bg-white/10 border border-white/30 text-white placeholder-white/50 backdrop-blur-sm"
      placeholder="https://..."
      value={tempVideos[s.week] ?? s.videoUrl}
      onChange={(e) =>
        setTempVideos((prev) => ({ ...prev, [s.week]: e.target.value }))
      }
    />
  </div>

  <button
    onClick={() => handleUpdate(s.week)}
    className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-1 mt-2 rounded w-full"
  >
    💾 Kaydet
  </button>
</div>
  ))}
</div>

        {/* YENİ: GENEL ÖZET TABLOSU */}
        {showGeneralSummary && generalSummary.length > 0 && (
          <div className="mt-10 bg-white/10 border border-white/20 rounded-xl p-6 w-full max-w-7xl">
            <h3 className="text-lg font-bold mb-4 text-white text-center">
              📊 Genel Katılım Özeti - Tüm Katılımcılar
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-white border border-white/20">
                <thead className="bg-white/10 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-4 py-2">Ad Soyad</th>
                    <th className="px-4 py-2">E-posta</th>
                    <th className="px-4 py-2">Katıldığı Hafta</th>
                    <th className="px-4 py-2">Toplam Hafta</th>
                    <th className="px-4 py-2">Katılım Oranı</th>
                    <th className="px-4 py-2">Durum</th>
                  </tr>
                </thead>
                <tbody className="bg-white/5">
                  {generalSummary.map((user) => (
                    <tr key={user.id} className="border-t border-white/10">
                      <td className="px-4 py-2">{user.name}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">{user.attended}</td>
                      <td className="px-4 py-2">{user.totalWeeks}</td>
                      <td className="px-4 py-2">
                        <span className={`${
                          user.rate >= 75
                            ? "text-green-400"
                            : user.rate >= 50
                            ? "text-yellow-300"
                            : "text-red-400"
                        } font-semibold`}>
                          %{user.rate}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.rate >= 75
                            ? "bg-green-600 text-white"
                            : user.rate >= 50
                            ? "bg-yellow-600 text-white"
                            : "bg-red-600 text-white"
                        }`}>
                          {user.rate >= 75 ? "Başarılı" : user.rate >= 50 ? "Orta" : "Düşük"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* HAFTALIK DETAY TABLOSU */}
        {selectedWeek && details.present.length > 0 && (
          <div className="mt-10 bg-white/10 border border-white/20 rounded-xl p-6 w-full max-w-5xl">
            <h3 className="text-lg font-bold mb-4 text-white text-center">
              {selectedWeek}. Hafta Katılım Detayları
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-white border border-white/20">
                <thead className="bg-white/10 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-4 py-2">Ad Soyad</th>
                    <th className="px-4 py-2">E-posta</th>
                    <th className="px-4 py-2">Katıldığı Hafta</th>
                    <th className="px-4 py-2">Katılım Oranı</th>
                  </tr>
                </thead>
                <tbody className="bg-white/5">
                  {details.present.map((p) => (
                    <tr key={p.id} className="border-t border-white/10">
                      <td className="px-4 py-2">{p.name}</td>
                      <td className="px-4 py-2">{p.email}</td>
                      <td className="px-4 py-2">{p.attended} / {p.totalWeeks}</td>
                      <td className="px-4 py-2">
                        <span className={`${
                          p.rate >= 75
                            ? "text-green-400"
                            : p.rate >= 50
                            ? "text-yellow-300"
                            : "text-red-400"
                        } font-semibold`}>
                          %{p.rate}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;