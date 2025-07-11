import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, CheckSquare, Users, BookOpenText, Info, Mail
} from "lucide-react";

const panels = [
  { key: "Program", title: "📅 Eğitim Programı" },
  { key: "Katılım", title: "📝 Katılım Durumu" },
  { key: "Eğitmenler", title: "👨‍🏫 Eğitmenler" },
  { key: "Kaynaklar", title: "📚 Eğitim Kaynakları" },
  { key: "Kurallar", title: "📌 Katılım Kuralları" },
  { key: "İletişim", title: "✉️ İletişim Bilgileri" },
];

const ParticipantDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePanel, setActivePanel] = useState("Program");
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
        <h1 className="text-lg font-bold text-yellow-400">Katılımcı Paneli</h1>
        <div className="w-8"></div>
      </div>

      {/* SIDEBAR */}
      <aside className={`fixed top-0 left-0 min-h-screen h-screen w-72 bg-black/30 backdrop-blur-md border-r border-white/20 flex flex-col z-50 transform transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static`}>
        {/* Mobile Close */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center text-white pt-8 pb-6 px-4 border-b border-white/10">
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4 mb-2 backdrop-blur-sm">
            <p className="text-lg font-semibold text-yellow-300">Merhaba,</p>
            <p className="text-xl font-bold text-yellow-300">{fullName} 👋</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-3 p-4 flex-grow">
          {panels.map(({ key, icon, title }) => (
            <button
              key={key}
              onClick={() => setActivePanel(key)}
              className={`text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] ${
                activePanel === key
                  ? "bg-yellow-400 text-black shadow-lg border-yellow-500"
                  : "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-yellow-400"
              } flex items-center gap-3`}
            >
              {icon} {title}
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
      <main className="flex-1 lg:ml-0 p-4 lg:p-6 min-h-screen transition-all overflow-auto">
        {/* Desktop Header */}
        <div className="hidden lg:block text-center mb-8">
          <div className="flex justify-center items-center gap-8 mb-4">
            <img src="/huaweilogo.png" alt="Huawei" className="h-20 object-contain" />
            <img src="/hsdlogo.png" alt="Partner" className="h-40 object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-yellow-400">Huawei Cloud AI Bootcamp</h1>
        </div>

        {/* Panel İçeriği */}
        {activePanel === "Program" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {sessions.map((s) => (
              <div key={s.week} className="bg-white/10 border border-white/20 p-5 rounded-xl backdrop-blur-sm hover:scale-[1.02] hover:border-yellow-400 transition">
                <h3 className="text-lg font-bold text-yellow-300 mb-2">{s.week}. Hafta</h3>
                {s.topic ? (
                  <ul className="list-disc list-inside text-sm text-gray-200 space-y-1">
                    {s.topic.split("\n").map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">Konu girilmemiş</p>
                )}
              </div>
            ))}
          </div>
        )}

        {activePanel === "Katılım" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {sessions.map((s) => (
              <div key={s.week} className="bg-white/10 border border-white/20 p-5 rounded-xl backdrop-blur-sm hover:scale-[1.02] hover:border-yellow-400 transition">
                <h3 className="text-lg font-bold text-yellow-300 mb-2">{s.week}. Hafta</h3>
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

        {activePanel === "Eğitmenler" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { name: "Ahmet Yılmaz", title: "AI Mühendisi – Huawei", linkedin: "#", image: "/profile.png" },
              { name: "Elif Demir", title: "Veri Bilimcisi – Huawei", linkedin: "#", image: "/profile.png" },
              { name: "Mehmet Kaya", title: "Cloud Eğitmeni – HSD", linkedin: "#", image: "/profile.png" },
            ].map((e, i) => (
              <div key={i} className="bg-white/10 border border-white/20 p-4 rounded-lg text-center transition hover:scale-[1.015] hover:border-yellow-400">
                <img src={e.image} alt="Eğitmen" className="w-20 h-20 mx-auto rounded-full object-cover mb-3" />
                <h3 className="text-lg font-semibold">{e.name}</h3>
                <p className="text-sm text-gray-300 mb-1">{e.title}</p>
                <a href={e.linkedin} target="_blank" className="text-blue-400 hover:underline text-sm">LinkedIn</a>
              </div>
            ))}
          </div>
        )}

        {activePanel === "Kaynaklar" && (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
    {sessions.map((s) => (
      <div
        key={s.week}
        className="bg-white/10 border border-white/20 p-5 rounded-xl backdrop-blur-sm hover:scale-[1.02] hover:border-yellow-400 transition"
      >
        <h3 className="text-lg font-bold text-yellow-300 mb-4">{s.week}. Hafta Kaynakları</h3>

        {/* Medium Link */}
        <div className="mb-3">
          <p className="text-sm text-white font-semibold mb-1 flex items-center gap-2">
            📝 Medium
          </p>
          {s.mediumUrl?.trim() ? (
            <a
              href={s.mediumUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-semibold inline-block"
            >
              Oku
            </a>
          ) : (
            <p className="text-gray-400 italic text-sm">Medium bağlantısı bulunamadı</p>
          )}
        </div>

        {/* Video Link */}
        <div>
          <p className="text-sm text-white font-semibold mb-1 flex items-center gap-2">
            🎥 Video
          </p>
          {s.videoUrl?.trim() ? (
            <a
              href={s.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold inline-block"
            >
              İzle
            </a>
          ) : (
            <p className="text-gray-400 italic text-sm">Video bağlantısı bulunamadı</p>
          )}
        </div>
      </div>
    ))}
  </div>
)}


        {activePanel === "Kurallar" && (
          <ul className="list-disc list-inside text-sm text-gray-200 space-y-2">
            <li>✅ Her hafta yoklama almanız beklenir.</li>
            <li>📌 En az 4 hafta katılım zorunludur.</li>
            <li>🧠 Her hafta sonrası mini sınav olabilir.</li>
            <li>🎓 Final sınavına yeterli katılımı olanlar girebilir.</li>
          </ul>
        )}

        {activePanel === "İletişim" && (
          <div className="space-y-3 text-sm">
            <p>
              📧 E-posta: <a href="mailto:hsdcloud@bootcamp.com" className="text-blue-400 underline">hsdcloud@bootcamp.com</a>
            </p>
            <p>
              💬 Discord: <a href="https://discord.gg/örnek" target="_blank" className="text-blue-400 underline">Katılmak için tıkla</a>
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ParticipantDashboard;
