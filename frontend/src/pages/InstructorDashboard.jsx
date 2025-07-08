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
        {summary.map((s) => (
  <div
    key={s.week}
    className="bg-white/10 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white/20 hover:scale-[1.02] transition duration-200"
  >
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-xl font-bold text-yellow-400">{s.week}. Hafta</h3>
      {s.active && <span className="text-green-400 font-semibold text-sm">AKTİF ✅</span>}
    </div>

    <p className="text-white mb-1">👥 Katılım: <span className="font-semibold">{s.attended}/{s.total}</span></p>
    <p className="text-white mb-3">📊 Oran: <span className="text-green-300 font-semibold">{s.rate}%</span></p>

    {/* Konu listesi */}
    {tempTopics[s.week]?.trim() && (
      <div className="text-white text-sm mb-3">
        <p className="font-semibold mb-1">📌 Konular:</p>
        <ul className="list-disc list-inside space-y-1 text-white/90">
          {tempTopics[s.week].split("\n").map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    )}

    {/* Video URL */}
    {tempVideos[s.week]?.trim() && (
      <div className="mb-3 text-sm text-blue-300">
        🎥 <a href={tempVideos[s.week]} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400">
          Videoyu Aç
        </a>
      </div>
    )}

    {/* Girişler */}
    <textarea
      rows={3}
      placeholder="Konu başlıkları (her satıra bir)"
      className="w-full mt-1 mb-2 p-2 rounded text-black"
      value={tempTopics[s.week] ?? s.topic}
      onChange={(e) =>
        setTempTopics((prev) => ({ ...prev, [s.week]: e.target.value }))
      }
    />
    <input
      type="text"
      placeholder="Video bağlantısı"
      className="w-full p-2 rounded text-black mb-3"
      value={tempVideos[s.week] ?? s.videoUrl}
      onChange={(e) =>
        setTempVideos((prev) => ({ ...prev, [s.week]: e.target.value }))
      }
    />

    {/* Butonlar */}
    <div className="flex flex-wrap gap-2 justify-between">
      <button
        onClick={() => handleUpdate(s.week)}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded"
      >
        💾 Kaydet
      </button>
      {s.active ? (
        <button
          onClick={() => handleStop(s.week)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
        >
          ⛔ Durdur
        </button>
      ) : (
        <button
          onClick={() => handleStart(s.week)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
        >
          ✅ Başlat
        </button>
      )}
      <button
        onClick={() => fetchDetails(s.week)}
        className="underline text-blue-300 hover:text-blue-400 text-sm"
      >
        Katılımcı Detayları
      </button>
    </div>
  </div>
))}

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