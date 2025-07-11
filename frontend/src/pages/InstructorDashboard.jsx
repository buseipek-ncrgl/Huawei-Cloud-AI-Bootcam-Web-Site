import { useEffect, useState } from "react";
import axios from "axios";

const panels = ["Program", "Katılım", "Kaynaklar", "Genel Katılım"];
const panelTitles = {
  Program: "📅 Eğitim Programı",
  Katılım: "📝 Katılım Yönetimi",
  Kaynaklar: "📚 Eğitim Kaynakları",
  "Genel Katılım": "📊 Genel Katılım Özeti",
};

const InstructorDashboard = () => {
  const [activePanel, setActivePanel] = useState("Program");
  const [summary, setSummary] = useState([]);
  const [fullName, setFullName] = useState("");
  const [details, setDetails] = useState({ present: [] });
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [generalSummary, setGeneralSummary] = useState([]);
  const [tempTopics, setTempTopics] = useState({});
  const [tempVideos, setTempVideos] = useState({});
  const [tempMediums, setTempMediums] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      const [summaryRes, profileRes, generalRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/attendance/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/attendance/general-summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setSummary(summaryRes.data);
      setFullName(profileRes.data.fullName);
      setGeneralSummary(generalRes.data);

      const topicState = {};
      const videoState = {};
      const mediumState = {};
      summaryRes.data.forEach((s) => {
        topicState[s.week] = s.topic || "";
        videoState[s.week] = s.videoUrl || "";
        mediumState[s.week] = s.mediumUrl || "";
      });
      setTempTopics(topicState);
      setTempVideos(videoState);
      setTempMediums(mediumState); 
    } catch (err) {
      alert("Veriler alınamadı");
    }
  };

  const fetchDetails = async (week) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/attendance/details/${week}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedWeek(week);
      setDetails(res.data);
    } catch {
      alert("Katılım detayları alınamadı");
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
      alert("Başlatılamadı ❌");
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
      alert("Durdurulamadı ❌");
    }
  };

  const handleUpdate = async (week, field) => {
    const token = localStorage.getItem("token");
    const data = {
      topic: tempTopics[week] ?? "",
      videoUrl: tempVideos[week] ?? "",
      mediumUrl: tempMediums[week] ?? "",
    };

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/sessions/${week}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Güncelleme başarılı ✅");
      fetchData();
    } catch {
      alert("Güncellenemedi ❌");
    }
  };

  const handlePanelChange = (panel) => {
    setActivePanel(panel);
    setSelectedWeek(null);
    setSidebarOpen(false); // Mobilde menü seçildikten sonra kapat
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-cover bg-center bg-no-repeat text-white" style={{ backgroundImage: "url('/background1.png')" }}>

      
      {/* MOBILE HEADER */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-black/60 border-b border-white/30">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-yellow-400">Eğitmen Paneli</h1>
        <div className="w-8"></div>
      </div>

      {/* SIDEBAR */}
      <aside className={`w-72 fixed top-0 left-0 h-full w-64 bg-black/80 backdrop-blur-sm border-r border-white/30 p-4 flex flex-col z-50 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:bg-black/60`}>
        
        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center text-white mt-8 lg:mt-2 mb-8 lg:mb-12">
          <p className="text-lg lg:text-xl font-bold text-yellow-300">Merhaba,</p>
          <p className="text-lg lg:text-xl font-bold text-yellow-300">{fullName} 👨‍🏫</p>
        </div>
        
        <nav className="flex flex-col gap-2">
          {panels.map((panel) => (
            <button
              key={panel}
              onClick={() => handlePanelChange(panel)}
              className={`text-left px-4 py-3 rounded-lg font-semibold transition-all duration-200 border hover:scale-[1.03] hover:border-yellow-400 ${
                activePanel === panel
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "bg-white/5 border-white/10 text-white"
              }`}
            >
              {panelTitles[panel]}
            </button>
          ))}
        </nav>
      </aside>

      {/* OVERLAY for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* MAIN */}
      <main className="ml-72 p-6 w-full min-h-screen transition-all">
        {/* Üst Başlık - Hidden on mobile */}
        <div className="hidden lg:block text-center mb-6">
          <div className="flex justify-center items-center gap-6 mb-4">
            <img src="/huaweilogo.png" alt="Huawei" className="w-32 sm:w-40" />
            <img src="/hsdlogo.png" alt="Partner" className="w-32 sm:w-40" />
          </div>
          <h1 className="text-3xl font-bold text-yellow-400">Huawei Cloud AI Bootcamp</h1>
        </div>

        {/* PANEL İÇERİĞİ */}
        <h2 className="text-xl lg:text-2xl font-bold text-yellow-400 mb-4 lg:mb-6">
          {panelTitles[activePanel]}
        </h2>

        {/* PROGRAM PANELİ */}
        {activePanel === "Program" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {summary.map((s) => (
              <div
                key={s.week}
                className="bg-white/10 border border-white/20 p-4 rounded-lg transition hover:scale-[1.015] hover:border-yellow-400"
              >
                <h3 className="text-lg font-bold text-yellow-300 mb-2">{s.week}. Hafta</h3>

                {s.topic?.trim() ? (
                  <>
                    <p className="text-sm font-semibold text-white mb-1">📌 Konular:</p>
                    <ul className="list-disc list-inside text-sm text-white/90 mb-2">
                      {s.topic.split("\n").map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-gray-400 italic text-sm">Henüz konu girilmedi.</p>
                )}

                {/* Güncelleme Alanı */}
                <div>
                  <label className="block font-semibold text-white mb-1 text-sm">📋 Konuları Güncelle</label>
                  <textarea
                    rows={3}
                    className="w-full p-2 rounded bg-white/10 border border-white/30 text-white placeholder-white/50 backdrop-blur-sm text-sm"
                    placeholder="Her satıra bir konu yazın"
                    value={tempTopics[s.week] ?? ""}
                    onChange={(e) =>
                      setTempTopics((prev) => ({ ...prev, [s.week]: e.target.value }))
                    }
                  />
                  <button
                    onClick={() => handleUpdate(s.week)}
                    className="mt-2 w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 rounded text-sm"
                  >
                    💾 Kaydet
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* KAYNAKLAR PANELİ */}
        {activePanel === "Kaynaklar" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {summary.map((s) => (
              <div
                key={s.week}
                className="bg-white/10 border border-white/20 p-4 rounded-lg transition hover:scale-[1.015] hover:border-yellow-400"
              >
                <h3 className="text-lg font-bold text-yellow-300 mb-3">{s.week}. Hafta Kaynakları</h3>

                {/* Mevcut Kaynaklar */}
                <div className="mb-4 space-y-2">
                  {s.videoUrl?.trim() ? (
                    <div className="flex items-center justify-between bg-white/5 p-2 rounded">
                      <span className="text-sm text-white">🎥 Video</span>
                      <a
                        href={s.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-semibold"
                      >
                        İzle
                      </a>
                    </div>
                  ) : (
                    <div className="bg-white/5 p-2 rounded">
                      <span className="text-sm text-gray-400">🎥 Video linki yok</span>
                    </div>
                  )}
                  
                  {s.mediumUrl?.trim() ? (
                    <div className="flex items-center justify-between bg-white/5 p-2 rounded">
                      <span className="text-sm text-white">📝 Medium</span>
                      <a
                        href={s.mediumUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-semibold"
                      >
                        Oku
                      </a>
                    </div>
                  ) : (
                    <div className="bg-white/5 p-2 rounded">
                      <span className="text-sm text-gray-400">📝 Medium linki yok</span>
                    </div>
                  )}
                </div>

                {/* Güncelleme Alanı */}
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-white text-sm mb-1">🔗 Video Linki</label>
                    <input
                      type="text"
                      className="w-full p-2 rounded bg-white/10 border border-white/30 text-white placeholder-white/50 backdrop-blur-sm text-sm"
                      placeholder="https://..."
                      value={tempVideos[s.week] ?? ""}
                      onChange={(e) =>
                        setTempVideos((prev) => ({ ...prev, [s.week]: e.target.value }))
                      }
                    />
                  </div>
                  
                  <div>
                    <label className="block font-semibold text-white text-sm mb-1">✍️ Medium Linki</label>
                    <input
                      type="text"
                      className="w-full p-2 rounded bg-white/10 border border-white/30 text-white placeholder-white/50 backdrop-blur-sm text-sm"
                      placeholder="https://medium.com/..."
                      value={tempMediums[s.week] ?? ""}
                      onChange={(e) =>
                        setTempMediums((prev) => ({ ...prev, [s.week]: e.target.value }))
                      }
                    />
                  </div>
                  
                  <button
                    onClick={() => handleUpdate(s.week)}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 rounded text-sm"
                  >
                    💾 Kaydet
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* KATILIM PANELİ */}
        {activePanel === "Katılım" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {summary.map((s) => (
              <div key={s.week} className="bg-white/10 border border-white/20 p-4 rounded-lg hover:scale-[1.015] hover:border-yellow-400 transition flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-yellow-300 mb-2">{s.week}. Hafta</h3>
                  <div className="text-sm space-y-1 mb-3">
                    <p>Katılım: <span className="font-semibold">{s.attended}/{s.total}</span></p>
                    <p>
                      Oran:{" "}
                      <span className={`font-semibold ${
                        s.rate >= 75 ? "text-green-400" : s.rate >= 50 ? "text-yellow-300" : "text-red-400"
                      }`}>
                        %{s.rate}
                      </span>
                    </p>
                  </div>
                  
                  {s.active ? (
                    <button
                      onClick={() => handleStop(s.week)}
                      className="bg-red-600 hover:bg-red-700 text-white w-full rounded py-2 mb-2 text-sm font-semibold"
                    >
                      ⛔ Yoklamayı Bitir
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStart(s.week)}
                      className="bg-green-600 hover:bg-green-700 text-white w-full rounded py-2 mb-2 text-sm font-semibold"
                    >
                      ✅ Yoklamayı Başlat
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => fetchDetails(s.week)}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full rounded py-2 text-sm font-semibold"
                >
                  📊 Detayları Gör
                </button>
              </div>
            ))}
          </div>
        )}

        {/* HAFTA DETAYI */}
        {selectedWeek && details.present.length > 0 && (
          <div className="mt-6 bg-white/10 border border-white/20 rounded-xl p-4 lg:p-6">
            <h3 className="text-lg font-bold mb-4 text-white text-center">
              {selectedWeek}. Hafta Katılım Detayları
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-white border border-white/20">
                <thead className="bg-white/10">
                  <tr>
                    <th className="text-left px-2 lg:px-4 py-2 font-bold">Ad Soyad</th>
                    <th className="text-left px-2 lg:px-4 py-2 font-bold">E-posta</th>
                    <th className="text-left px-2 lg:px-4 py-2 font-bold">Katılım</th>
                    <th className="text-left px-2 lg:px-4 py-2 font-bold">Oran</th>
                  </tr>
                </thead>
                <tbody className="bg-white/5">
                  {details.present.map((p) => (
                    <tr key={p.id} className="border-t border-white/10">
                      <td className="px-2 lg:px-4 py-2">{p.name}</td>
                      <td className="px-2 lg:px-4 py-2 text-xs lg:text-sm">{p.email}</td>
                      <td className="px-2 lg:px-4 py-2">{p.attended}/{p.totalWeeks}</td>
                      <td className="px-2 lg:px-4 py-2">
                        <span className={`font-semibold ${
                          p.rate >= 75 ? "text-green-400" : p.rate >= 50 ? "text-yellow-300" : "text-red-400"
                        }`}>
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

        {/* GENEL KATILIM */}
        {activePanel === "Genel Katılım" && generalSummary.length > 0 && (
          <div className="bg-white/10 border border-white/20 rounded-xl p-4 lg:p-6">
            <h3 className="text-lg font-bold mb-4 text-white text-center">📊 Tüm Katılımcı Özeti</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-white border border-white/20">
                <thead className="bg-white/10">
                  <tr>
                    <th className="text-left px-2 lg:px-4 py-2 font-bold">Ad Soyad</th>
                    <th className="text-left px-2 lg:px-4 py-2 font-bold">E-posta</th>
                    <th className="text-left px-2 lg:px-4 py-2 font-bold">Katılım</th>
                    <th className="text-left px-2 lg:px-4 py-2 font-bold">Oran</th>
                    <th className="text-left px-2 lg:px-4 py-2 font-bold">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {generalSummary.map((user) => (
                    <tr key={user.id} className="border-t border-white/10">
                      <td className="px-2 lg:px-4 py-2">{user.name}</td>
                      <td className="px-2 lg:px-4 py-2 text-xs lg:text-sm">{user.email}</td>
                      <td className="px-2 lg:px-4 py-2">{user.attended}/{user.totalWeeks}</td>
                      <td className="px-2 lg:px-4 py-2">
                        <span className={`font-semibold ${
                          user.rate >= 75 ? "text-green-400" : user.rate >= 50 ? "text-yellow-300" : "text-red-400"
                        }`}>
                          %{user.rate}
                        </span>
                      </td>
                      <td className="px-2 lg:px-4 py-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          user.rate >= 75
                            ? "bg-green-600"
                            : user.rate >= 50
                            ? "bg-yellow-600"
                            : "bg-red-600"
                        } text-white`}>
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
      </main>
    </div>
  );
};

export default InstructorDashboard;