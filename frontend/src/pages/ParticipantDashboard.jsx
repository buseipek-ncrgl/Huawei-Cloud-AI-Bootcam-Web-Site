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

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/attendance/sessions`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

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
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat text-white"
      style={{ backgroundImage: "url('/background1.png')" }}
    >
      {/* ÜST LOGO & BAŞLIK */}
      <div className="flex flex-col items-center justify-center mt-2 mb-6 px-4">
        <div className="flex items-center gap-8 mb-2">
          <img
            src="/huaweilogo.png"
            alt="Huawei"
            className="w-40 sm:w-48 drop-shadow-2xl brightness-125"
          />
          <img
            src="/hsdlogo.png"
            alt="HSD"
            className="w-40 sm:w-48 drop-shadow-2xl brightness-125"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-yellow-400 text-center">
          Huawei Cloud AI Bootcamp
        </h1>
      </div>

      <div className="flex flex-col md:flex-row bg-black/40 min-h-screen h-full">

        {/* SIDEBAR */}
        <aside className="w-full md:w-72 bg-black/60 border-r border-white/20 flex flex-col items-center py-6 px-4 h-full md:h-screen">

          <p className="text-sm text-gray-300 mb-6 text-center">
            Merhaba, <span className="font-medium text-white">{fullName}</span>
          </p>
          <nav className="flex flex-col gap-2 w-full">
            {panels.map((panel) => (
              <button
                key={panel}
                onClick={() => setActivePanel(panel)}
                className={`text-left w-full px-4 py-2 rounded-lg font-semibold transition-all duration-200 border hover:scale-[1.03] hover:border-yellow-400 ${
                  activePanel === panel
                    ? "bg-yellow-400 text-black border-yellow-400"
                    : "bg-white/5 border-white/10 text-white"
                }`}
              >
                {panel}
              </button>
            ))}
          </nav>
        </aside>

        {/* ANA PANEL */}
        <main className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-xl font-bold text-yellow-300 mb-6">{activePanel}</h2>

          {/* PROGRAM */}
          {activePanel === "Program" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {sessions.map((s) => (
                <div
                  key={s.week}
                  className="bg-white/10 border border-white/20 p-4 rounded-lg transition hover:scale-[1.015] hover:border-yellow-400"
                >
                  <h3 className="text-lg font-bold text-yellow-300 mb-2">
                    {s.week}. Hafta
                  </h3>
                  {s.topic ? (
                    <ul className="list-disc list-inside text-sm text-gray-200 space-y-1">
                      {s.topic.split("\n").map((item, i) => (
                        <li key={i}>{item.trim()}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 italic">Konu girilmemiş</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* KATILIM */}
          {activePanel === "Katılım" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {sessions.map((s) => (
                <div
                  key={s.week}
                  className="bg-white/10 border border-white/20 p-4 rounded-lg transition hover:scale-[1.015] hover:border-yellow-400"
                >
                  <h3 className="text-lg font-bold text-yellow-300 mb-2">
                    {s.week}. Hafta
                  </h3>
                  {s.attended ? (
                    <p className="text-green-400 font-bold">✔ Katıldınız</p>
                  ) : s.active ? (
                    <button
                      onClick={() => handleAttend(s.week)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold text-sm w-full"
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
                  linkedin: "#",
                  image: "/profile-placeholder.png",
                },
                {
                  name: "Elif Demir",
                  title: "Veri Bilimcisi – Huawei",
                  linkedin: "#",
                  image: "/profile-placeholder.png",
                },
                {
                  name: "Mehmet Kaya",
                  title: "Cloud Eğitmeni – HSD",
                  linkedin: "#",
                  image: "/profile-placeholder.png",
                },
              ].map((e, i) => (
                <div
                  key={i}
                  className="bg-white/10 border border-white/20 p-4 rounded-lg text-center transition hover:scale-[1.015] hover:border-yellow-400"
                >
                  <img
                    src={e.image}
                    alt="Eğitmen"
                    className="w-20 h-20 mx-auto rounded-full object-cover mb-3"
                  />
                  <h3 className="text-lg font-semibold">{e.name}</h3>
                  <p className="text-sm text-gray-300">{e.title}</p>
                  <a
                    href={e.linkedin}
                    target="_blank"
                    className="text-blue-400 hover:underline text-sm"
                  >
                    LinkedIn Profili
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* KAYNAKLAR */}
          {activePanel === "Kaynaklar" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {sessions.map((s) => (
                <div
                  key={s.week}
                  className="bg-white/10 border border-white/20 p-4 rounded-lg transition hover:scale-[1.015] hover:border-yellow-400"
                >
                  <h3 className="text-lg font-bold text-yellow-300 mb-2">
                    {s.week}. Hafta Kaynakları
                  </h3>
                  {s.videoUrl && (
                    <div className="mb-2">
                      <p className="font-semibold">🎥 Video:</p>
                      <a
                        href={s.videoUrl}
                        target="_blank"
                        className="text-blue-400 hover:underline"
                      >
                        İzle
                      </a>
                    </div>
                  )}
                  <div className="mb-2">
                    <p className="font-semibold">📄 Medium:</p>
                    <a
                      href="https://medium.com/@hsdcloudbootcamp/hafta1"
                      target="_blank"
                      className="text-blue-400 hover:underline"
                    >
                      Hafta 1 Medium
                    </a>
                  </div>
                  <div>
                    <p className="font-semibold">📁 CVÇ:</p>
                    <a
                      href="https://drive.google.com/file/d/örnekcvç"
                      target="_blank"
                      className="text-blue-400 hover:underline"
                    >
                      İndir
                    </a>
                  </div>
                </div>
              ))}
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
              <p>
                📧 E-posta:{" "}
                <a
                  href="mailto:hsdcloud@bootcamp.com"
                  className="text-blue-400 underline"
                >
                  hsdcloud@bootcamp.com
                </a>
              </p>
              <p>
                💬 Discord:{" "}
                <a
                  href="https://discord.gg/örnek"
                  className="text-blue-400 underline"
                  target="_blank"
                >
                  Katılmak için tıkla
                </a>
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ParticipantDashboard;
