import { useEffect, useState } from "react";
import axios from "axios";

const panels = ["Genel Katılım", "Program", "Kaynaklar", "Hafta Oluştur"];

const InstructorDashboard = () => {
  const [summary, setSummary] = useState([]);
  const [fullName, setFullName] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [details, setDetails] = useState({ present: [] });
  const [generalSummary, setGeneralSummary] = useState([]);
  const [tempTopics, setTempTopics] = useState({});
  const [tempVideos, setTempVideos] = useState({});
  const [activePanel, setActivePanel] = useState("Genel Katılım");

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
      console.error("Veri alınamadı:", err);
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
      alert("Güncellendi");
      fetchData();
    } catch {
      alert("Güncelleme hatası");
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
      fetchData();
    } catch {
      alert("Başlatma hatası");
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
      fetchData();
    } catch {
      alert("Durdurma hatası");
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat text-white flex flex-col"
      style={{ backgroundImage: "url('/background1.png')" }}
    >
      {/* HEADER */}
      <div className="flex flex-col items-center justify-center pt-6 pb-4">
        <div className="flex items-center gap-8 mb-2">
          <img src="/huaweilogo.png" className="w-40 sm:w-48" />
          <img src="/hsdlogo.png" className="w-40 sm:w-48" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-yellow-400 text-center">
          Huawei Cloud AI Bootcamp
        </h1>
      </div>

      {/* BODY */}
      <div className="flex flex-1">
        {/* SIDEBAR */}
        <aside className="w-64 bg-black/60 border-r border-white/20 p-4 flex flex-col min-h-screen">
          <div className="text-center text-white mb-8">
            <p className="text-sm">Merhaba,</p>
            <p className="text-xl font-bold text-yellow-300">{fullName}</p>
          </div>
          <nav className="flex flex-col gap-2">
            {panels.map((panel) => (
              <button
                key={panel}
                onClick={() => setActivePanel(panel)}
                className={`px-4 py-2 rounded font-semibold transition hover:scale-[1.03] hover:border-yellow-400 border ${
                  activePanel === panel
                    ? "bg-yellow-400 text-black border-yellow-400"
                    : "bg-white/5 text-white border-white/10"
                }`}
              >
                {panel}
              </button>
            ))}
          </nav>
        </aside>

        {/* MAIN PANEL */}
        <main className="flex-1 p-6 overflow-y-auto h-full">
          <h2 className="text-xl font-bold text-yellow-300 mb-6">{activePanel}</h2>

          {activePanel === "Genel Katılım" && (
            <>
              <button
                onClick={fetchGeneralSummary}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded mb-6"
              >
                📊 Genel Katılım Özeti
              </button>

              {generalSummary.length > 0 && (
                <div className="overflow-x-auto text-sm">
                  <table className="min-w-full text-left text-white border border-white/20">
                    <thead className="bg-white/10 text-xs uppercase">
                      <tr>
                        <th className="px-4 py-2">Ad Soyad</th>
                        <th className="px-4 py-2">E-posta</th>
                        <th className="px-4 py-2">Katıldığı Hafta</th>
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
                          <td className="px-4 py-2 font-semibold text-green-400">
                            %{u.rate}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activePanel === "Program" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {summary.map((s) => (
                <div key={s.week} className="bg-white/10 border border-white/20 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-yellow-300 mb-2">{s.week}. Hafta</h3>
                  {s.topic ? (
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {s.topic.split("\n").map((line, i) => (
                        <li key={i}>{line.trim()}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="italic text-gray-400">Konu yok</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {activePanel === "Kaynaklar" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {summary.map((s) => (
                <div key={s.week} className="bg-white/10 border border-white/20 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-yellow-300 mb-2">{s.week}. Hafta</h3>
                  <input
                    type="text"
                    className="w-full bg-white/10 border border-white/30 rounded p-2 text-white text-sm mb-2"
                    placeholder="Video Link"
                    value={tempVideos[s.week] || ""}
                    onChange={(e) =>
                      setTempVideos((prev) => ({ ...prev, [s.week]: e.target.value }))
                    }
                  />
                  <button
                    onClick={() => handleUpdate(s.week)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-1 px-4 rounded w-full"
                  >
                    💾 Güncelle
                  </button>
                </div>
              ))}
            </div>
          )}

          {activePanel === "Hafta Oluştur" && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const week = e.target.week.value;
                const token = localStorage.getItem("token");
                try {
                  await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/sessions/create`,
                    { week },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  fetchData();
                  e.target.reset();
                } catch {
                  alert("Oluşturulamadı");
                }
              }}
              className="flex items-center gap-3 mb-6"
            >
              <input
                type="number"
                name="week"
                placeholder="Yeni hafta numarası"
                required
                className="p-2 rounded text-black"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Hafta Ekle
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default InstructorDashboard;
