import { useEffect, useState } from "react";

const panels = ["Program", "Katılım", "Kaynaklar", "Genel Katılım"];
const panelTitles = {
  Program: "📅 Eğitim Programı",
  Katılım: "📝 Katılım Yönetimi",
  Kaynaklar: "📚 Eğitim Kaynakları",
  "Genel Katılım": "📊 Genel Katılım Özeti",
};

const InstructorDashboard = () => {
  const [activePanel, setActivePanel] = useState("Program");
  const [summary, setSummary] = useState([
    { week: 1, topic: "React Temelleri\nComponent Yapısı", attended: 15, total: 20, rate: 75, active: false, videoUrl: "", mediumUrl: "" },
    { week: 2, topic: "State ve Props\nEvent Handling", attended: 18, total: 20, rate: 90, active: true, videoUrl: "https://youtube.com/watch?v=example", mediumUrl: "" },
    { week: 3, topic: "", attended: 12, total: 20, rate: 60, active: false, videoUrl: "", mediumUrl: "https://medium.com/example" },
  ]);
  const [fullName, setFullName] = useState("Ahmet Yılmaz");
  const [details, setDetails] = useState({ present: [] });
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [generalSummary, setGeneralSummary] = useState([
    { id: 1, name: "Ali Veli", email: "ali@example.com", attended: 2, totalWeeks: 3, rate: 67 },
    { id: 2, name: "Ayşe Demir", email: "ayse@example.com", attended: 3, totalWeeks: 3, rate: 100 },
    { id: 3, name: "Mehmet Kaya", email: "mehmet@example.com", attended: 1, totalWeeks: 3, rate: 33 },
  ]);
  const [tempTopics, setTempTopics] = useState({});
  const [tempVideos, setTempVideos] = useState({});
  const [tempMediums, setTempMediums] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchDetails = (week) => {
    const mockDetails = {
      present: [
        { id: 1, name: "Ali Veli", email: "ali@example.com", attended: 2, totalWeeks: 3, rate: 67 },
        { id: 2, name: "Ayşe Demir", email: "ayse@example.com", attended: 3, totalWeeks: 3, rate: 100 },
        { id: 3, name: "Mehmet Kaya", email: "mehmet@example.com", attended: 1, totalWeeks: 3, rate: 33 },
      ]
    };
    setSelectedWeek(week);
    setDetails(mockDetails);
  };

  const handleStart = (week) => {
    alert(`${week}. hafta başlatıldı ✅`);
  };

  const handleStop = (week) => {
    alert(`${week}. hafta durduruldu ⛔`);
  };

  const handleUpdate = (week) => {
    alert("Güncelleme başarılı ✅");
  };

  const handlePanelChange = (panel) => {
    setActivePanel(panel);
    setSelectedWeek(null);
    setSidebarOpen(false);
  };

  useEffect(() => {
    const topicState = {};
    const videoState = {};
    const mediumState = {};
    summary.forEach((s) => {
      topicState[s.week] = s.topic || "";
      videoState[s.week] = s.videoUrl || "";
      mediumState[s.week] = s.mediumUrl || "";
    });
    setTempTopics(topicState);
    setTempVideos(videoState);
    setTempMediums(mediumState);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      
      {/* MOBILE HEADER */}
      <div className="lg:hidden flex items-center justify-between p-3 bg-black/70 border-b border-white/20">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white p-2 hover:bg-white/10 rounded"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-base font-bold text-yellow-400">Eğitmen Paneli</h1>
        <div className="w-9"></div>
      </div>

      {/* SIDEBAR */}
      <aside className={`fixed top-0 left-0 h-full w-full sm:w-80 lg:w-72 bg-black/85 backdrop-blur-sm border-r border-white/20 flex flex-col z-50 transform transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:bg-black/60`}>
        
        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-3 right-3 text-white/80 hover:text-white p-2 hover:bg-white/10 rounded"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* User Info */}
        <div className="text-center text-white pt-6 pb-4 px-4 lg:pt-4 lg:pb-6">
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4 mb-2">
            <p className="text-sm lg:text-base font-semibold text-yellow-300">Merhaba,</p>
            <p className="text-base lg:text-lg font-bold text-yellow-300">{fullName} 👨‍🏫</p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex flex-col gap-2 px-4 pb-4">
          {panels.map((panel) => (
            <button
              key={panel}
              onClick={() => handlePanelChange(panel)}
              className={`text-left px-3 py-3 rounded-lg font-semibold transition-all duration-200 border text-sm lg:text-base hover:scale-[1.02] hover:border-yellow-400 ${
                activePanel === panel
                  ? "bg-yellow-400 text-black border-yellow-400 shadow-lg"
                  : "bg-white/5 border-white/10 text-white hover:bg-white/10"
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
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:ml-0 p-4 lg:p-6 min-h-screen transition-all">
        {/* Desktop Header */}
        <div className="hidden lg:block text-center mb-6">
          <div className="flex justify-center items-center gap-6 mb-4">
            <div className="w-32 h-16 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">HUAWEI</span>
            </div>
            <div className="w-32 h-16 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">HSD</span>
            </div>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-yellow-400">Huawei Cloud AI Bootcamp</h1>
        </div>

        {/* Panel Title */}
        <h2 className="text-lg lg:text-2xl font-bold text-yellow-400 mb-4 lg:mb-6">
          {panelTitles[activePanel]}
        </h2>

        {/* PROGRAM PANELİ */}
        {activePanel === "Program" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {summary.map((s) => (
              <div
                key={s.week}
                className="bg-white/10 border border-white/20 p-4 rounded-lg transition hover:scale-[1.02] hover:border-yellow-400"
              >
                <h3 className="text-lg font-bold text-yellow-300 mb-3">{s.week}. Hafta</h3>

                {s.topic?.trim() ? (
                  <>
                    <p className="text-sm font-semibold text-white mb-2">📌 Konular:</p>
                    <ul className="list-disc list-inside text-sm text-white/90 mb-3">
                      {s.topic.split("\n").map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-gray-400 italic text-sm mb-3">Henüz konu girilmedi.</p>
                )}

                {/* Güncelleme Alanı */}
                <div>
                  <label className="block font-semibold text-white mb-2 text-sm">📋 Konuları Güncelle</label>
                  <textarea
                    rows={3}
                    className="w-full p-2 rounded bg-white/10 border border-white/30 text-white placeholder-white/50 backdrop-blur-sm text-sm focus:border-yellow-400 focus:outline-none"
                    placeholder="Her satıra bir konu yazın"
                    value={tempTopics[s.week] ?? ""}
                    onChange={(e) =>
                      setTempTopics((prev) => ({ ...prev, [s.week]: e.target.value }))
                    }
                  />
                  <button
                    onClick={() => handleUpdate(s.week)}
                    className="mt-3 w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 rounded text-sm transition"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {summary.map((s) => (
              <div
                key={s.week}
                className="bg-white/10 border border-white/20 p-4 rounded-lg transition hover:scale-[1.02] hover:border-yellow-400"
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
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-semibold transition"
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
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-semibold transition"
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
                      className="w-full p-2 rounded bg-white/10 border border-white/30 text-white placeholder-white/50 backdrop-blur-sm text-sm focus:border-yellow-400 focus:outline-none"
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
                      className="w-full p-2 rounded bg-white/10 border border-white/30 text-white placeholder-white/50 backdrop-blur-sm text-sm focus:border-yellow-400 focus:outline-none"
                      placeholder="https://medium.com/..."
                      value={tempMediums[s.week] ?? ""}
                      onChange={(e) =>
                        setTempMediums((prev) => ({ ...prev, [s.week]: e.target.value }))
                      }
                    />
                  </div>
                  
                  <button
                    onClick={() => handleUpdate(s.week)}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 rounded text-sm transition"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {summary.map((s) => (
              <div key={s.week} className="bg-white/10 border border-white/20 p-4 rounded-lg hover:scale-[1.02] hover:border-yellow-400 transition flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-yellow-300 mb-3">{s.week}. Hafta</h3>
                  <div className="text-sm space-y-2 mb-4">
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
                      className="bg-red-600 hover:bg-red-700 text-white w-full rounded py-2 mb-3 text-sm font-semibold transition"
                    >
                      ⛔ Yoklamayı Bitir
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStart(s.week)}
                      className="bg-green-600 hover:bg-green-700 text-white w-full rounded py-2 mb-3 text-sm font-semibold transition"
                    >
                      ✅ Yoklamayı Başlat
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => fetchDetails(s.week)}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full rounded py-2 text-sm font-semibold transition"
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