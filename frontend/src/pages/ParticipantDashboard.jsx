import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const panels = [
  "Program",
  "Katılım",
  "Eğitmenler",
  "Kaynaklar",
  "Kurallar",
  "İletişim",
];

const ParticipantDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePanel, setActivePanel] = useState("Program");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance/sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.data.success) {
          throw new Error(res.data.error || "Veri alınamadı");
        }

        setSessions(res.data.sessions);
        setFullName(res.data.fullName);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
        if (err.response?.status === 403) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [navigate]);

  const handleAttend = async (week) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/attendance/${week}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Katılım kaydedilemedi");
      }

      alert(`Hafta ${week} için yoklama alındı ✅`);
      setSessions((prev) =>
        prev.map((s) => (s.week === week ? { ...s, attended: true } : s))
      );
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-2xl">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-400 text-xl p-4 bg-black/50 rounded-lg max-w-md text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-cover bg-center bg-no-repeat text-white" style={{ backgroundImage: "url('/background1.png')" }}>
      <div className="min-h-screen bg-black/40 flex flex-col md:flex-row">

        {/* Sidebar */}
        <div className="w-full md:w-64 bg-black/50 border-r border-white/20 p-6 flex flex-col items-center">
          <img src="/huaweilogo.png" alt="Huawei" className="w-32 mb-4" />
          <img src="/hsdlogo.png" alt="HSD" className="w-32 mb-8" />
          <h2 className="text-lg font-semibold text-center mb-6">Merhaba, {fullName}</h2>
          <nav className="space-y-2 w-full">
            {panels.map((panel) => (
              <button
                key={panel}
                onClick={() => setActivePanel(panel)}
                className={`w-full text-left px-4 py-2 rounded transition ${
                  activePanel === panel
                    ? "bg-yellow-400 text-black font-bold"
                    : "hover:bg-white/10"
                }`}
              >
                {panel}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-2xl font-bold text-yellow-300 mb-6">{activePanel}</h1>

          {/* PROGRAM */}
          {activePanel === "Program" && (
            <div className="space-y-4">
              {sessions.map((s) => (
                <div key={s.week} className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                    {s.week}. Hafta
                  </h3>
                  {s.topic ? (
                    <ul className="list-disc list-inside text-sm text-gray-200 space-y-1">
                      {s.topic.split("\n").map((item, i) => (
                        <li key={i}>{item.trim()}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="italic text-gray-400">Konu girilmemiş</p>
                  )}
                  {s.videoUrl?.trim() && (
                    <div className="mt-3">
                      <p className="font-semibold">🎥 Video:</p>
                      <a
                        href={s.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline text-sm"
                      >
                        İzlemek için tıkla
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* KATILIM */}
          {activePanel === "Katılım" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {sessions.map((s) => (
                <div key={s.week} className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <h3 className="text-lg font-semibold mb-3 text-yellow-300">
                    {s.week}. Hafta
                  </h3>
                  {s.attended ? (
                    <p className="text-green-400 font-bold">✔ Katıldınız</p>
                  ) : s.active ? (
                    <button
                      onClick={() => handleAttend(s.week)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold text-sm"
                    >
                      Katıldım
                    </button>
                  ) : (
                    <p className="text-gray-400 italic">Katılım Kapalı</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* EĞİTMENLER */}
          {activePanel === "Eğitmenler" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  name: "Ahmet Yılmaz",
                  title: "AI Mühendisi – Huawei",
                  linkedin: "https://www.linkedin.com/in/ahmetyilmaz",
                },
                {
                  name: "Elif Demir",
                  title: "Veri Bilimcisi – Huawei",
                  linkedin: "https://www.linkedin.com/in/elifdemir",
                },
                {
                  name: "Mehmet Kaya",
                  title: "Cloud Eğitmeni – HSD",
                  linkedin: "https://www.linkedin.com/in/mehmetkaya",
                },
              ].map((e, i) => (
                <div key={i} className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <h3 className="text-lg font-semibold">{e.name}</h3>
                  <p className="text-sm text-gray-300">{e.title}</p>
                  <a href={e.linkedin} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-sm mt-1 inline-block">
                    LinkedIn Profili
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* KAYNAKLAR */}
          {activePanel === "Kaynaklar" && (
            <div className="space-y-4 text-sm">
              <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                <p className="font-semibold mb-1">🎥 YouTube Video:</p>
                <a href="https://www.youtube.com/watch?v=örnekvideo" target="_blank" className="text-blue-400 hover:underline">
                  https://www.youtube.com/watch?v=örnekvideo
                </a>
              </div>
              <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                <p className="font-semibold mb-1">📄 Medium Yazısı:</p>
                <a href="https://medium.com/@hsdcloudbootcamp/hafta1" target="_blank" className="text-blue-400 hover:underline">
                  https://medium.com/@hsdcloudbootcamp/hafta1
                </a>
              </div>
              <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                <p className="font-semibold mb-1">📁 CVÇ:</p>
                <a href="https://drive.google.com/file/d/örnekcvç" target="_blank" className="text-blue-400 hover:underline">
                  Google Drive Linki (CVÇ)
                </a>
              </div>
            </div>
          )}

          {/* KURALLAR */}
          {activePanel === "Kurallar" && (
            <div className="space-y-3 text-sm text-gray-200">
              <p>✅ Her hafta yoklama almanız beklenir.</p>
              <p>📌 En az 4 hafta katılım zorunludur.</p>
              <p>🧠 Her hafta sonrası mini sınav olabilir.</p>
              <p>🎓 Final sınavına yeterli katılımı olanlar girebilir.</p>
              <p>📨 Yardım için iletişim bölümünü kullanın.</p>
            </div>
          )}

          {/* İLETİŞİM */}
          {activePanel === "İletişim" && (
            <div className="space-y-3 text-sm">
              <p>📧 E-posta: <a href="mailto:hsdcloud@bootcamp.com" className="text-blue-400 underline">hsdcloud@bootcamp.com</a></p>
              <p>💬 Discord: <a href="https://discord.gg/örnek" className="text-blue-400 underline" target="_blank">Katılmak için tıkla</a></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantDashboard;
