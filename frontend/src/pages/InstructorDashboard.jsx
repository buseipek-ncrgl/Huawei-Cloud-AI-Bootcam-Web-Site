import { useEffect, useState } from "react";
import axios from "axios";

const panels = ["Program", "Kaynaklar", "Hafta Oluştur", "Genel Katılım"];
const panelTitles = {
  "Program": "📅 Eğitim Programı",
  "Kaynaklar": "📚 Video Linkleri",
  "Hafta Oluştur": "🗓️ Yeni Hafta Oluştur",
  "Genel Katılım": "📊 Katılımcı Özeti"
};

const InstructorDashboard = () => {
  const [summary, setSummary] = useState([]);
  const [fullName, setFullName] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [details, setDetails] = useState({ present: [] });
  const [generalSummary, setGeneralSummary] = useState([]);
  const [tempTopics, setTempTopics] = useState({});
  const [tempVideos, setTempVideos] = useState({});
  const [activePanel, setActivePanel] = useState("Program");

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

  const fetchDetails = async (week) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/attendance/details/${week}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDetails(res.data);
      setSelectedWeek(week);
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
    } catch (err) {
      alert("Genel özet alınamadı");
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
      alert("Güncellendi ✅");
      fetchData();
    } catch (err) {
      alert("Güncelleme hatası ❌");
    }
  };

  const handleStart = async (week) => {
    const token = localStorage.getItem("token");
    await axios.post(`${import.meta.env.VITE_API_URL}/api/sessions/${week}/start`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchData();
  };

  const handleStop = async (week) => {
    const token = localStorage.getItem("token");
    await axios.post(`${import.meta.env.VITE_API_URL}/api/sessions/${week}/stop`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchData();
  };

  const handleCreateWeek = async (e) => {
    e.preventDefault();
    const week = e.target.week.value;
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/sessions/create`, { week }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      e.target.reset();
    } catch (err) {
      alert("Oluşturulamadı");
    }
  };

  return (
    <div className="min-h-screen w-full bg-cover bg-center bg-no-repeat text-white flex"
         style={{ backgroundImage: "url('/background1.png')" }}>
      {/* Sidebar */}
      <aside className="w-64 h-screen fixed top-0 left-0 bg-black/60 border-r border-white/30 p-4 flex flex-col z-10">
        <div className="text-center mb-8">
          <p className="text-xl font-bold text-yellow-300">Merhaba,</p>
          <p className="text-xl font-bold text-yellow-300">{fullName} 👨‍🏫</p>
        </div>
        {panels.map((p) => (
          <button
            key={p}
            onClick={() => {
              setActivePanel(p);
              if (p === "Genel Katılım") fetchGeneralSummary();
            }}
            className={`text-left px-4 py-2 rounded-lg font-semibold transition-all duration-200 border hover:scale-[1.03] hover:border-yellow-400 ${
              activePanel === p
                ? "bg-yellow-400 text-black border-yellow-400"
                : "bg-white/5 border-white/10 text-white"
            }`}
          >
            {p}
          </button>
        ))}
      </aside>

      {/* İçerik */}
      <main className="ml-64 flex-1 px-6 py-10 overflow-y-auto">
        <div className="flex justify-center items-center gap-6 mb-4">
          <img src="/huaweilogo.png" className="w-32 sm:w-40" />
          <img src="/hsdlogo.png" className="w-32 sm:w-40" />
        </div>
        <h1 className="text-3xl font-bold text-yellow-400 mb-6">{panelTitles[activePanel]}</h1>

        {activePanel === "Program" && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {summary.map((s) => (
              <div key={s.week} className="bg-white/10 border border-white/20 p-4 rounded-lg hover:scale-[1.015] hover:border-yellow-400 transition">
                <h3 className="text-lg font-bold text-yellow-300 mb-2">{s.week}. Hafta</h3>
                {s.topic ? (
                  <ul className="list-disc list-inside text-sm text-gray-200 space-y-1">
                    {s.topic.split("\n").map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">Konu girilmemiş</p>
                )}
              </div>
            ))}
          </div>
        )}

        {activePanel === "Kaynaklar" && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {summary.map((s) => (
              <div key={s.week} className="bg-white/10 border border-white/20 p-4 rounded-lg hover:scale-[1.015] hover:border-yellow-400 transition">
                <h3 className="text-lg font-bold text-yellow-300 mb-2">{s.week}. Hafta</h3>
                {s.videoUrl ? (
                  <a href={s.videoUrl} className="text-blue-400 hover:underline text-sm">🎥 İzle</a>
                ) : (
                  <p className="text-gray-400 italic">Video yok</p>
                )}
              </div>
            ))}
          </div>
        )}

        {activePanel === "Hafta Oluştur" && (
          <>
            <form onSubmit={handleCreateWeek} className="mb-6 flex flex-wrap gap-2">
              <input name="week" type="number" required placeholder="Yeni hafta numarası"
                     className="p-2 text-black rounded" />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                Ekle
              </button>
            </form>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {summary.map((s) => (
                <div key={s.week} className="bg-white/5 border border-white/20 p-4 rounded-lg text-sm space-y-3">
                  <h3 className="text-yellow-300 font-bold text-lg">{s.week}. Hafta</h3>
                  <p>Katılım: {s.attended}/{s.total} (%{s.rate})</p>
                  {s.active ? (
                    <button onClick={() => handleStop(s.week)} className="w-full bg-red-600 text-white py-1 rounded">⛔ Bitir</button>
                  ) : (
                    <button onClick={() => handleStart(s.week)} className="w-full bg-green-600 text-white py-1 rounded">✅ Başlat</button>
                  )}
                  <button onClick={() => fetchDetails(s.week)} className="underline text-blue-300 text-xs">Katılımcı Detayları</button>
                  <textarea
                    rows={2}
                    className="w-full p-2 rounded bg-white/10 border border-white/30 text-white"
                    placeholder="Konular"
                    value={tempTopics[s.week]}
                    onChange={(e) =>
                      setTempTopics((prev) => ({ ...prev, [s.week]: e.target.value }))
                    }
                  />
                  <input
                    type="text"
                    placeholder="Video Linki"
                    className="w-full p-2 rounded bg-white/10 border border-white/30 text-white"
                    value={tempVideos[s.week]}
                    onChange={(e) =>
                      setTempVideos((prev) => ({ ...prev, [s.week]: e.target.value }))
                    }
                  />
                  <button onClick={() => handleUpdate(s.week)} className="bg-yellow-500 text-white px-3 py-1 rounded w-full">
                    💾 Kaydet
                  </button>
                </div>
              ))}
            </div>

            {selectedWeek && details.present.length > 0 && (
              <div className="mt-10">
                <h3 className="text-lg font-bold text-white mb-2 text-center">{selectedWeek}. Hafta Katılım Detayları</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left text-white border border-white/20">
                    <thead className="bg-white/10 uppercase text-xs font-bold">
                      <tr>
                        <th className="px-4 py-2">Ad Soyad</th>
                        <th className="px-4 py-2">E-posta</th>
                        <th className="px-4 py-2">Katılım Oranı</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/5">
                      {details.present.map((p) => (
                        <tr key={p.id} className="border-t border-white/10">
                          <td className="px-4 py-2">{p.name}</td>
                          <td className="px-4 py-2">{p.email}</td>
                          <td className="px-4 py-2 text-green-300">%{p.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {activePanel === "Genel Katılım" && generalSummary.length > 0 && (
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
                {generalSummary.map((u) => (
                  <tr key={u.id} className="border-t border-white/10">
                    <td className="px-4 py-2">{u.name}</td>
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2">{u.attended}</td>
                    <td className="px-4 py-2">{u.totalWeeks}</td>
                    <td className="px-4 py-2">
                      <span className={`font-semibold ${
                        u.rate >= 75 ? "text-green-400" :
                        u.rate >= 50 ? "text-yellow-300" :
                        "text-red-400"
                      }`}>
                        %{u.rate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default InstructorDashboard;
