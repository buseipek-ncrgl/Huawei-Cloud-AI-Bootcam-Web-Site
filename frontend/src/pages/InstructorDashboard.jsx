import { useEffect, useState } from "react";
import axios from "axios";

const panels = ["Program", "Kaynaklar", "Hafta Oluştur", "Genel Katılım"];
const panelTitles = {
  Program: "📅 Eğitim Programı",
  Kaynaklar: "📚 Video Kaynakları",
  "Hafta Oluştur": "🗓️ Yeni Hafta Oluştur & Detaylar",
  "Genel Katılım": "📊 Genel Katılım Özeti",
};

const InstructorDashboard = () => {
  const [summary, setSummary] = useState([]);
  const [fullName, setFullName] = useState("");
  const [details, setDetails] = useState({ present: [] });
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [generalSummary, setGeneralSummary] = useState([]);
  const [activePanel, setActivePanel] = useState("Program");

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
      alert("Veri alınamadı");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateWeek = async (e) => {
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

  const fetchDetails = async (week) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/attendance/details/${week}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDetails(res.data);
      setSelectedWeek(week);
    } catch {
      alert("Katılımcı detayları alınamadı");
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
      setSelectedWeek(null);
    } catch {
      alert("Genel özet alınamadı");
    }
  };

  return (
    <div className="min-h-screen w-full bg-cover bg-center bg-no-repeat text-white flex"
      style={{ backgroundImage: "url('/background1.png')" }}>
      
      {/* SIDEBAR */}
      <aside className="w-64 h-screen fixed top-0 left-0 bg-black/60 border-r border-white/30 p-4 flex flex-col z-10">
        <div className="text-center text-white mt-2 mb-12">
          <p className="text-xl font-bold text-yellow-300">Merhaba,</p>
          <p className="text-xl font-bold text-yellow-300">{fullName} 👨‍🏫</p>
        </div>
        <nav className="flex flex-col gap-2">
          {panels.map((p) => (
            <button
              key={p}
              onClick={() => setActivePanel(p)}
              className={`text-left px-4 py-2 rounded-lg font-semibold transition-all duration-200 border hover:scale-[1.03] hover:border-yellow-400 ${
                activePanel === p
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "bg-white/5 border-white/10 text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 p-6 w-full overflow-y-auto">
        <div className="text-center mb-6">
          <div className="flex justify-center items-center gap-6 mb-4">
            <img src="/huaweilogo.png" alt="Huawei" className="w-32 sm:w-40" />
            <img src="/hsdlogo.png" alt="HSD" className="w-32 sm:w-40" />
          </div>
          <h1 className="text-3xl font-bold text-yellow-400">Huawei Cloud AI Bootcamp</h1>
        </div>

        <h2 className="text-2xl font-bold text-yellow-400 mb-6">
          {panelTitles[activePanel]}
        </h2>

        {/* PANEL: Program */}
        {activePanel === "Program" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {summary.map((s) => (
              <div key={s.week} className="bg-white/10 p-4 rounded-lg border border-white/20 hover:border-yellow-400 transition hover:scale-[1.015]">
                <h3 className="text-lg font-bold text-yellow-300 mb-2">{s.week}. Hafta</h3>
                {s.topic ? (
                  <ul className="list-disc list-inside text-sm text-white/90">
                    {s.topic.split("\n").map((item, i) => (
                      <li key={i}>{item.trim()}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="italic text-white/50">Konu eklenmemiş</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PANEL: Kaynaklar */}
        {activePanel === "Kaynaklar" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {summary.map((s) => (
              <div key={s.week} className="bg-white/10 p-4 rounded-lg border border-white/20 hover:border-yellow-400 transition hover:scale-[1.015]">
                <h3 className="text-lg font-bold text-yellow-300 mb-2">{s.week}. Hafta</h3>
                {s.videoUrl ? (
                  <a href={s.videoUrl} target="_blank" className="text-blue-400 hover:underline text-sm">
                    🎥 Videoyu İzle
                  </a>
                ) : (
                  <p className="italic text-white/50">Video linki eklenmemiş</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PANEL: Hafta Oluştur & Katılımcı Detay */}
        {activePanel === "Hafta Oluştur" && (
          <>
            <form onSubmit={handleCreateWeek} className="flex flex-col sm:flex-row items-center gap-2 mb-6">
              <input type="number" name="week" placeholder="Yeni hafta numarası" required className="p-2 rounded text-black" />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                Hafta Ekle
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {summary.map((s) => (
                <div key={s.week} className="bg-white/5 p-4 rounded-lg border border-white/20 hover:border-yellow-400 transition hover:scale-[1.015]">
                  <h3 className="text-lg font-bold text-yellow-300 mb-2">{s.week}. Hafta</h3>
                  <p className="text-sm text-white/80 mb-1">Katılım: <strong>{s.attended}/{s.total}</strong></p>
                  <p className="text-sm text-white/80 mb-2">Oran: <span className="text-green-300 font-semibold">{s.rate}%</span></p>
                  {s.active ? (
                    <button onClick={() => handleStop(s.week)} className="w-full bg-red-600 hover:bg-red-700 py-1 rounded mb-2">⛔ Bitir</button>
                  ) : (
                    <button onClick={() => handleStart(s.week)} className="w-full bg-green-600 hover:bg-green-700 py-1 rounded mb-2">✅ Başlat</button>
                  )}
                  <button onClick={() => fetchDetails(s.week)} className="text-blue-300 hover:text-blue-400 underline text-sm">
                    Katılımcı Detayları
                  </button>
                </div>
              ))}
            </div>

            {/* Katılımcı Detay Tablosu */}
            {selectedWeek && details.present.length > 0 && (
              <div className="mt-10 bg-white/10 border border-white/20 rounded-xl p-6 max-w-5xl">
                <h3 className="text-lg font-bold mb-4 text-white text-center">
                  {selectedWeek}. Hafta Katılım Detayları
                </h3>
                <table className="min-w-full text-sm text-left text-white border border-white/20">
                  <thead className="bg-white/10 uppercase text-xs font-bold">
                    <tr>
                      <th className="px-4 py-2">Ad Soyad</th>
                      <th className="px-4 py-2">E-posta</th>
                      <th className="px-4 py-2">Katıldığı / Toplam</th>
                      <th className="px-4 py-2">Oran</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/5">
                    {details.present.map((p) => (
                      <tr key={p.id} className="border-t border-white/10">
                        <td className="px-4 py-2">{p.name}</td>
                        <td className="px-4 py-2">{p.email}</td>
                        <td className="px-4 py-2">{p.attended} / {p.totalWeeks}</td>
                        <td className="px-4 py-2">{p.rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* PANEL: Genel Katılım */}
        {activePanel === "Genel Katılım" && (
          <>
            <button
              onClick={fetchGeneralSummary}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded mb-6"
            >
              📊 Genel Özeti Getir
            </button>

            {generalSummary.length > 0 && (
              <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 text-white text-center">
                  📊 Genel Katılım Özeti - Tüm Katılımcılar
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left text-white border border-white/20">
                    <thead className="bg-white/10 uppercase text-xs font-bold">
                      <tr>
                        <th className="px-4 py-2">Ad Soyad</th>
                        <th className="px-4 py-2">E-posta</th>
                        <th className="px-4 py-2">Katıldığı</th>
                        <th className="px-4 py-2">Toplam</th>
                        <th className="px-4 py-2">Oran</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/5">
                      {generalSummary.map((user) => (
                        <tr key={user.id} className="border-t border-white/10">
                          <td className="px-4 py-2">{user.name}</td>
                          <td className="px-4 py-2">{user.email}</td>
                          <td className="px-4 py-2">{user.attended}</td>
                          <td className="px-4 py-2">{user.totalWeeks}</td>
                          <td className="px-4 py-2">{user.rate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default InstructorDashboard;
