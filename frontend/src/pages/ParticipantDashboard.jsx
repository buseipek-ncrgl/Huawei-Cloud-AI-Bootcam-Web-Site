import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User, Calendar, Users, BookOpen, ShieldCheck, Mail } from "lucide-react";

const panels = ["Program", "Katılım", "Eğitmenler", "Kaynaklar", "Kurallar", "İletişim"];
const panelTitles = {
  Program: "📅 Eğitim Programı",
  Katılım: "📝 Katılım Durumu",
  Eğitmenler: "👨‍🏫 Eğitmenler",
  Kaynaklar: "📚 Eğitim Kaynakları",
  Kurallar: "📌 Katılım Kuralları",
  İletişim: "✉️ İletişim Bilgileri",
};

const icons = {
  Program: Calendar,
  Katılım: Users,
  Eğitmenler: User,
  Kaynaklar: BookOpen,
  Kurallar: ShieldCheck,
  İletişim: Mail,
};

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
        if (!token) return navigate("/login");

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance/sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.data.success) throw new Error(res.data.error || "Veri alınamadı");

        setSessions(res.data.sessions);
        setFullName(res.data.fullName);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
        if (err.response?.status === 403) navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [navigate]);

  const handleAttend = async (week) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance/${week}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data.success) throw new Error(response.data.error || "Katılım kaydedilemedi");

      alert(`Hafta ${week} için yoklama alındı ✅`);
      setSessions((prev) => prev.map((s) => (s.week === week ? { ...s, attended: true } : s)));
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-xl">Yükleniyor...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400 text-xl">{error}</div>;

  return (
    <div className="flex min-h-screen w-full bg-cover bg-center bg-no-repeat text-white" style={{ backgroundImage: "url('/background1.png')" }}>

      {/* SIDEBAR */}
      <aside className="w-72 h-screen bg-black/60 border-r border-white/30 p-5 flex flex-col fixed top-0 left-0 z-40">
        <div className="text-center mb-8">
          <p className="text-yellow-300 font-semibold text-lg">Merhaba,</p>
          <p className="text-yellow-300 font-bold text-xl">{fullName} 👋</p>
        </div>

        {panels.map((panel) => {
          const Icon = icons[panel];
          return (
            <button
              key={panel}
              onClick={() => setActivePanel(panel)}
              className={`flex items-center gap-3 px-4 py-2 mb-2 rounded-lg font-medium transition-all duration-200 hover:scale-[1.03] hover:border-yellow-400 border ${{
                true: "bg-yellow-400 text-black border-yellow-400",
                false: "bg-white/5 text-white border-white/10",
              }[activePanel === panel]}`}
            >
              <Icon className="w-5 h-5" />
              {panelTitles[panel]}
            </button>
          );
        })}
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-72 p-6 flex-1">
        {/* LOGO HEADER */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-6 mb-3">
            <img src="/huaweilogo.png" alt="Huawei" className="h-16 object-contain" />
            <img src="/hsdlogo.png" alt="HSD" className="h-20 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-yellow-400">Huawei Cloud AI Bootcamp</h1>
        </div>

        <h2 className="text-xl font-bold text-yellow-400 mb-6">{panelTitles[activePanel]}</h2>

        {/* PROGRAM */}
        {activePanel === "Program" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {sessions.map((s) => (
              <div key={s.week} className="bg-white/10 border border-white/20 p-4 rounded-xl">
                <h3 className="text-lg font-bold text-yellow-300 mb-2">{s.week}. Hafta</h3>
                {s.topic ? (
                  <ul className="list-disc list-inside text-sm text-white/90 space-y-1">
                    {s.topic.split("\n").map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">Henüz konu girilmemiş</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* KATILIM */}
        {activePanel === "Katılım" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {sessions.map((s) => (
              <div key={s.week} className="bg-white/10 border border-white/20 p-4 rounded-xl">
                <h3 className="text-lg font-bold text-yellow-300 mb-3">{s.week}. Hafta</h3>
                {s.attended ? (
                  <p className="text-green-400 font-bold">✔ Katıldınız</p>
                ) : s.active ? (
                  <button
                    onClick={() => handleAttend(s.week)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {["Ahmet Yılmaz", "Elif Demir", "Mehmet Kaya"].map((name, i) => (
              <div key={i} className="bg-white/10 border border-white/20 p-5 rounded-xl text-center">
                <img src="/profile.png" className="w-20 h-20 mx-auto rounded-full mb-3" alt="" />
                <h3 className="font-semibold">{name}</h3>
                <p className="text-sm text-gray-300">Eğitmen</p>
              </div>
            ))}
          </div>
        )}

        {/* KAYNAKLAR */}
        {activePanel === "Kaynaklar" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {sessions.map((s) => (
              <div key={s.week} className="bg-white/10 border border-white/20 p-5 rounded-xl">
                <h3 className="text-lg font-bold text-yellow-300 mb-3">{s.week}. Hafta</h3>
                <div className="space-y-3">
                  {s.videoUrl && (
                    <a
                      href={s.videoUrl}
                      target="_blank"
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold text-sm"
                    >
                      🎥 İzle
                    </a>
                  )}
                  {s.mediumUrl && (
                    <a
                      href={s.mediumUrl}
                      target="_blank"
                      className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold text-sm"
                    >
                      📝 Oku
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* KURALLAR */}
        {activePanel === "Kurallar" && (
          <div className="space-y-3 text-white/90">
            <p>✅ Her hafta yoklama almanız beklenir.</p>
            <p>📌 En az 4 hafta katılım zorunludur.</p>
            <p>🧠 Her hafta sonrası mini sınav olabilir.</p>
            <p>🎓 Final sınavına yeterli katılımı olanlar girebilir.</p>
          </div>
        )}

        {/* İLETİŞİM */}
        {activePanel === "İletişim" && (
          <div className="space-y-3 text-white/90">
            <p>📧 E-posta: <a href="mailto:hsdcloud@bootcamp.com" className="underline text-blue-400">hsdcloud@bootcamp.com</a></p>
            <p>💬 Discord: <a href="https://discord.gg/hsdcloud" className="underline text-blue-400" target="_blank">Discord'a Katıl</a></p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ParticipantDashboard;
