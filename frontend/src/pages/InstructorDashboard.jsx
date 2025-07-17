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
  const [newWeek, setNewWeek] = useState("");
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
  topicState[s.week] = {
    day1: s.topic?.day1 ?? "",
    day2: s.topic?.day2 ?? ""
  };
  videoState[s.week] = s.videoUrl ?? "";
  mediumState[s.week] = s.mediumUrl ?? "";
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

  const handleStart = async (week, day) => {
  const token = localStorage.getItem("token");
  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/attendance/${week}/day/${day}/start`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert(`${week}. hafta ${day}. gün başlatıldı ✅`);
    fetchData(); // yenile
  } catch {
    alert("Başlatılamadı ❌");
  }
};


  const handleStop = async (week, day) => {
  const token = localStorage.getItem("token");
  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/attendance/${week}/day/${day}/stop`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert(`${week}. hafta ${day}. gün durduruldu ⛔`);
    fetchData();
  } catch {
    alert("Durdurulamadı ❌");
  }
};


 const handleUpdate = async (week) => {
  const token = localStorage.getItem("token");
  const data = {
  topic: {
    day1: tempTopics[week]?.day1 ?? "",
    day2: tempTopics[week]?.day2 ?? ""
  },
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


 const handleCreateWeek = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/sessions/create`, {
      week: newWeek
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.data.success) throw new Error(res.data.error || "Hafta eklenemedi");

    alert(`✅ ${newWeek}. hafta eklendi!`);
    fetchData(); // ✅ fetchSummary yerine fetchData çünkü özet+konu+video hepsini çekiyor
    setNewWeek("");
  } catch (err) {
    alert(err.response?.data?.error || err.message);
  }
};


 return (
  <div className="flex flex-col lg:flex-row min-h-screen w-full bg-cover bg-center bg-no-repeat text-white" style={{ backgroundImage: "url('/background1.png')" }}>
    
    {/* MOBILE HEADER */}
    <div className="lg:hidden flex items-center justify-between p-4 bg-black/70 border-b border-white/30 backdrop-blur-sm">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="text-white p-2 hover:bg-white/20 rounded-lg transition"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 className="text-lg font-bold text-yellow-400">Eğitmen Paneli</h1>
      <div className="w-8"></div>
    </div>

    {/* SIDEBAR */}
    <aside
  className={`fixed top-0 left-0 h-screen w-72 bg-black/30 backdrop-blur-md border-r border-white/20 flex flex-col z-50 transform transition-all duration-300 ease-in-out
    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    lg:translate-x-0 lg:static lg:min-h-screen lg:h-auto`}
>

      
      {/* Mobile close button */}
      <button
        onClick={() => setSidebarOpen(false)}
        className="lg:hidden absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full transition"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* User Info */}
      <div className="text-center text-white pt-8 pb-6 px-4 border-b border-white/10">
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4 mb-2 backdrop-blur-sm">
          <p className="text-lg font-semibold text-yellow-300">Merhaba,</p>
          <p className="text-xl font-bold text-yellow-300">{fullName} 👨‍🏫</p>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex flex-col gap-3 p-4 flex-grow">
        {panels.map((panel) => (
          <button
            key={panel}
            onClick={() => handlePanelChange(panel)}
            className={`text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] ${
              activePanel === panel
                ? "bg-yellow-400 text-black shadow-lg border-yellow-500"
                : "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-yellow-400"
            }`}
          >
            {panelTitles[panel]}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 text-center text-xs text-white/50">
        Huawei Cloud AI Bootcamp © 2025
      </div>
    </aside>

    {/* OVERLAY for mobile */}
    {sidebarOpen && (
      <div
        className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        onClick={() => setSidebarOpen(false)}
      ></div>
    )}

    {/* MAIN CONTENT */}
    <main className="flex-1 lg:ml-0 p-4 lg:p-6 min-h-screen transition-all overflow-auto">
      {/* Desktop Header */}
      <div className="hidden lg:block text-center mb-8">
        <div className="flex justify-center items-center gap-8 mb-4">
          <img src="/huaweilogo.png" alt="Huawei" className="h-20 object-contain" />
          <img src="/hsdlogo.png" alt="Partner" className="h-40 object-contain" />
        </div><h1 className="text-4xl font-bold text-yellow-400">Huawei Cloud AI Bootcamp</h1>
      </div>

      {/* Panel Title */}
      <h2 className="text-xl lg:text-2xl font-bold text-yellow-400 mb-6 lg:mb-8 flex items-center gap-2">
        {panelTitles[activePanel]}
      </h2>

      {/* PROGRAM PANELİ */}
      {activePanel === "Program" && (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
    {summary.map((s) => (
      <div
        key={s.week}
        className="bg-white/10 border border-white/20 p-5 rounded-xl transition hover:scale-[1.02] hover:border-yellow-400 backdrop-blur-sm"
      >
        <h3 className="text-lg font-bold text-yellow-300 mb-3 flex items-center gap-2">
          <span className="bg-yellow-400/20 border border-yellow-400/30 rounded-lg px-3 py-1">
            {s.week}. Hafta
          </span>
        </h3>

        {/* 1. Gün */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-white mb-1">📅 1. Gün Konuları</p>
          {s.topic?.day1 ? (
            <ul className="list-disc list-inside text-sm text-white/90 mb-2 space-y-1">
              {s.topic.day1.split("\n").map((line, i) => (
                <li key={`d1-${i}`}>{line}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic text-sm mb-2">Henüz konu girilmedi.</p>
          )}

          <textarea
            rows={3}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/30 text-white placeholder-white/50 backdrop-blur-sm text-sm focus:border-yellow-400 focus:outline-none transition"
            value={tempTopics[s.week]?.day1 ?? ""}
            onChange={(e) =>
              setTempTopics((prev) => ({
                ...prev,
                [s.week]: { ...prev[s.week], day1: e.target.value },
              }))
            }
          />
          <button
            onClick={() => handleUpdate(s.week)}
            className="mt-2 w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 rounded-lg text-sm transition flex items-center justify-center gap-2"
          >
            💾 1. Gün Kaydet
          </button>
        </div>

        {/* 2. Gün */}
        <div>
          <p className="text-sm font-semibold text-white mb-1">📅 2. Gün Konuları</p>
          {s.topic?.day2 ? (
            <ul className="list-disc list-inside text-sm text-white/90 mb-2 space-y-1">
              {s.topic.day2.split("\n").map((line, i) => (
                <li key={`d2-${i}`}>{line}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic text-sm mb-2">Henüz konu girilmedi.</p>
          )}

          <textarea
            rows={3}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/30 text-white placeholder-white/50 backdrop-blur-sm text-sm focus:border-yellow-400 focus:outline-none transition"
            value={tempTopics[s.week]?.day2 ?? ""}
            onChange={(e) =>
              setTempTopics((prev) => ({
                ...prev,
                [s.week]: { ...prev[s.week], day2: e.target.value },
              }))
            }
          />
          <button
            onClick={() => handleUpdate(s.week)}
            className="mt-2 w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 rounded-lg text-sm transition flex items-center justify-center gap-2"
          >
            💾 2. Gün Kaydet
          </button>
        </div>
      </div>
    ))}
  </div>
)}


      {/* KAYNAKLAR PANELİ */}
      {activePanel === "Kaynaklar" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {summary.map((s) => (
            <div
              key={s.week}
              className="bg-white/10 border border-white/20 p-5 rounded-xl transition hover:scale-[1.02] hover:border-yellow-400 backdrop-blur-sm"
            >
              <h3 className="text-lg font-bold text-yellow-300 mb-3 flex items-center gap-2">
                <span className="bg-yellow-400/20 border border-yellow-400/30 rounded-lg px-3 py-1">
                  {s.week}. Hafta
                </span>
              </h3>

              {/* Mevcut Kaynaklar */}
              <div className="mb-5 space-y-3">
                <p className="text-sm font-semibold text-white">📚 Mevcut Kaynaklar</p>
                {s.videoUrl?.trim() ? (
                  <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                    <span className="text-sm text-white flex items-center gap-2">
                      <span className="bg-blue-500/20 p-1.5 rounded-lg">🎥</span>
                      Video
                    </span>
                    <a
                      href={s.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      İzle
                    </a>
                  </div>
                ) : (
                  <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                    <span className="text-sm text-gray-400 flex items-center gap-2">
                      <span className="bg-gray-500/20 p-1.5 rounded-lg">🎥</span>
                      Video linki yok
                    </span>
                  </div>
                )}
                
                {s.mediumUrl?.trim() ? (
                  <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                    <span className="text-sm text-white flex items-center gap-2">
                      <span className="bg-green-500/20 p-1.5 rounded-lg">📝</span>
                      Medium
                    </span>
                    <a
                      href={s.mediumUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      Oku
                    </a>
                  </div>
                ) : (
                  <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                    <span className="text-sm text-gray-400 flex items-center gap-2">
                      <span className="bg-gray-500/20 p-1.5 rounded-lg">📝</span>
                      Medium linki yok
                    </span>
                  </div>
                )}
              </div>

              {/* Güncelleme Alanı */}
              <div className="space-y-4">
                <p className="text-sm font-semibold text-white">🔄 Kaynak Güncelle</p>
                <div>
                  <label className="block font-semibold text-white text-sm mb-2">🔗 Video Linki</label>
                  <input
                    type="text"
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 backdrop-blur-sm text-sm focus:border-yellow-400 focus:outline-none transition"
                    placeholder="https://..."
                    value={tempVideos[s.week] ?? ""}
                    onChange={(e) =>
                      setTempVideos((prev) => ({ ...prev, [s.week]: e.target.value }))
                    }
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-white text-sm mb-2">✍️ Medium Linki</label>
                  <input
                    type="text"
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 backdrop-blur-sm text-sm focus:border-yellow-400 focus:outline-none transition"
                    placeholder="https://medium.com/..."
                    value={tempMediums[s.week] ?? ""}
                    onChange={(e) =>
                      setTempMediums((prev) => ({ ...prev, [s.week]: e.target.value }))
                    }
                  />
                </div>
                
                <button
                  onClick={() => handleUpdate(s.week)}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2"
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
  <div className="space-y-6">
    {/* Yeni Hafta Ekle Bölümü */}
    <div className="flex justify-center">
      <div className="bg-white/5 border border-dashed border-yellow-400 p-3 rounded-lg flex items-center gap-3 hover:bg-white/10 transition backdrop-blur-sm">
        <span className="text-yellow-400 font-semibold text-sm">➕ Yeni Hafta Ekle:</span>
        <input
          type="number"
          min="1"
          placeholder="Hafta"
          value={newWeek}
          onChange={(e) => setNewWeek(Number(e.target.value))}
          className="w-16 px-2 py-1 rounded bg-black/30 border border-white/20 text-white text-sm placeholder-white/50 focus:outline-none focus:border-yellow-400"
        />
        <button
          onClick={handleCreateWeek}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-sm px-2 py-1 rounded transition"
        >
          ➕
        </button>
      </div>
    </div>

    {/* Hafta Panelleri */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
  {summary.map((s) => (
    <div
      key={s.week}
      className="relative bg-white/10 border border-white/20 p-5 rounded-xl hover:scale-[1.02] hover:border-yellow-400 transition backdrop-blur-sm"
    >
      <div>
        <h3 className="text-lg font-bold text-yellow-300 mb-4 flex items-center gap-2">
          <span className="bg-yellow-400/20 border border-yellow-400/30 rounded-lg px-3 py-1">
            {s.week}. Hafta
          </span>
        </h3>

        {/* 1. ve 2. GÜN KUTULARI */}
        {[1, 2].map((day) => (
          <div key={day} className="mb-4 bg-white/5 rounded-lg p-3 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
  <span className="text-white text-sm font-semibold">📅 {day}. Gün</span>
  <div className="flex items-center gap-2">
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
      s[`day${day}Active`] ? "bg-green-600 text-white" : "bg-gray-600 text-white/70"
    }`}>
      {s[`day${day}Active`] ? "Aktif" : "Pasif"}
    </span>
    <span
      className={`w-3 h-3 rounded-full ${
        s[`day${day}Active`] ? "bg-green-400" : "bg-red-400"
      }`}
      title={s[`day${day}Active`] ? "Aktif" : "Pasif"}
    ></span>
  </div>
</div>


            <div className="flex justify-between items-center bg-black/10 px-3 py-2 rounded-lg">
              <span className="text-sm text-white">Katılım</span>
              <span className="font-semibold">
                {s[`day${day}Attended`] ?? 0}/{s.total}
              </span>
            </div>

            <div className="flex justify-between items-center bg-black/10 px-3 py-2 rounded-lg">
              <span className="text-sm text-white">Oran</span>
              <span className={`font-semibold ${
                s[`day${day}Rate`] >= 75
                  ? "text-green-400"
                  : s[`day${day}Rate`] >= 50
                  ? "text-yellow-300"
                  : "text-red-400"
              }`}>
                %{s[`day${day}Rate`] ?? 0}
              </span>
            </div>

            <button
              onClick={() =>
                s[`day${day}Active`] ? handleStop(s.week, day) : handleStart(s.week, day)
              }
              className={`w-full text-sm font-semibold rounded-lg py-2.5 transition flex items-center justify-center gap-2 ${
                s[`day${day}Active`]
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {s[`day${day}Active`] ? "⛔ Yoklamayı Bitir" : "✅ Yoklamayı Başlat"}
            </button>
          </div>
        ))}

        <button
          onClick={() => fetchDetails(s.week)}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full rounded-lg py-2.5 text-sm font-semibold transition flex items-center justify-center gap-2"
        >
          📊 Detayları Gör
        </button>
      </div>
    </div>
  ))}
</div>

  </div>
)}

      {/* HAFTA DETAYI */}
{selectedWeek && details.present && (
  <div className="mt-8 bg-white/10 border border-white/20 rounded-xl p-5 lg:p-6 backdrop-blur-sm">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-bold text-white">
        {selectedWeek}. Hafta Katılım Detayları
      </h3>
      <button
        onClick={() => setSelectedWeek(null)}
        className="text-white/70 hover:text-white transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    {[1, 2].map((day) => (
      <div key={day} className="mb-8">
        <h4 className="text-white text-lg font-bold mb-2">📅 {day}. Gün Katılım Listesi</h4>
        {details.present[day]?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-white mb-4">
              <thead className="bg-white/10">
                <tr>
                  <th className="text-left px-4 py-3 font-bold rounded-tl-lg">Ad Soyad</th>
                  <th className="text-left px-4 py-3 font-bold">E-posta</th>
                  <th className="text-left px-4 py-3 font-bold">Katılım</th>
                  <th className="text-left px-4 py-3 font-bold rounded-tr-lg">Oran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {details.present[day].map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition">
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3">{p.email}</td>
                    <td className="px-4 py-3">{p.attended}/{p.totalWeeks}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${
                        p.rate >= 75
                          ? "text-green-400"
                          : p.rate >= 50
                          ? "text-yellow-300"
                          : "text-red-400"
                      }`}>
                        %{p.rate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-white/60 italic">Bu gün için katılım yok.</p>
        )}
      </div>
    ))}
  </div>
)}


      {/* GENEL KATILIM */}
      {activePanel === "Genel Katılım" && generalSummary.length > 0 && (
        <div className="bg-white/10 border border-white/20 rounded-xl p-5 lg:p-6 backdrop-blur-sm">
          <h3 className="text-lg font-bold mb-5 text-white">📊 Tüm Katılımcı Özeti</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-white">
              <thead className="bg-white/10">
                <tr>
                  <th className="text-left px-4 py-3 font-bold rounded-tl-lg">Ad Soyad</th>
                  <th className="text-left px-4 py-3 font-bold">E-posta</th>
                  <th className="text-left px-4 py-3 font-bold">Katılım</th>
                  <th className="text-left px-4 py-3 font-bold">Oran</th>
                  <th className="text-left px-4 py-3 font-bold rounded-tr-lg">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {generalSummary.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition">
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.attended}/{user.totalWeeks}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${
                        user.rate >= 75 ? "text-green-400" : user.rate >= 50 ? "text-yellow-300" : "text-red-400"
                      }`}>
                        %{user.rate}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        user.rate >= 75
                          ? "bg-green-600/20 text-green-400"
                          : user.rate >= 50
                          ? "bg-yellow-600/20 text-yellow-400"
                          : "bg-red-600/20 text-red-400"
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
    </main>
  </div>
)};
export default InstructorDashboard;