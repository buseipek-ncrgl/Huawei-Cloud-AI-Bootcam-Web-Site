import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const panels = [
  { key: "Profil", title: "🙋‍♂️ Profilim" },
  { key: "Program", title: "📅 Eğitim Programı" },
  { key: "Katılım", title: "📝 Katılım Durumu" },
  { key: "Eğitmenler", title: "👨‍🏫 Eğitmenler" },
  { key: "Kaynaklar", title: "📚 Eğitim Kaynakları" },
  { key: "Görevler", title: "✅ Haftalık Görevler" },
  { key: "Kurallar", title: "📌 Katılım Kuralları" },
  { key: "Sorular", title: "❓ Sıkça Sorulan Sorular" },
  { key: "İletişim", title: "✉️ İletişim Bilgileri" },
];

const panelTitles = {
  Profil: "🙋‍♂️ Profilim",
  Program: "📅 Eğitim Programı",
  Katılım: "📝 Katılım Durumu",
  Eğitmenler: "👨‍🏫 Eğitmenler",
  Kaynaklar: "📚 Eğitim Kaynakları",
  Görevler: "✅ Haftalık Görevler",
  Kurallar: "📌 Katılım Kuralları",
  Sorular: "❓ Sıkça Sorulan Sorular",
  İletişim: "✉️ İletişim Bilgileri",
};


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

  const handleAttend = async (week, day) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/attendance/${week}`,  // ✅ Doğru endpoint
      { day },  // 👈 Gün bilgisi body içinde gönderiliyor
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Katılım kaydedilemedi");
    }

    alert(`${week}. Hafta ${day}. Gün için katılım alındı ✅`);

    // Local state güncelle
    setSessions((prev) =>
      prev.map((s) =>
        s.week === week
          ? {
              ...s,
              [`attendedDay${day}`]: true,
            }
          : s
      )
    );
  } catch (err) {
    alert(err.response?.data?.error || err.message);
  }
};

// 🔧 GÜNCELLENMİŞ handleTaskSubmit
const handleTaskSubmit = async (e, week) => {
  e.preventDefault();

  const fileUrl = e.target.fileUrl.value.trim();
  if (!fileUrl) return;

  const token = localStorage.getItem("token");

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/attendance/session/${week}/task`, // ✅ doğru endpoint
      { fileUrl },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.data.success) {
      throw new Error("Görev gönderilemedi");
    }

    alert("✅ Görev gönderildi!");
    e.target.reset();

    const newSubmission = response.data.submission; // ✅ _id içeren doğru veri

    // State’e ekle (timestamp değil, response’tan gelen veri)
    setSessions((prev) =>
      prev.map((s) =>
        s.week === week
          ? {
              ...s,
              submissions: [...(s.submissions || []), newSubmission]
            }
          : s
      )
    );
  } catch (err) {
    console.error("Görev gönderilemedi ❌:", err);
    alert("Görev gönderilemedi. Lütfen bağlantıyı kontrol edin.");
  }
};



const handleDeleteSubmission = async (submissionId) => {
  if (!submissionId) {
    console.error("❌ Geçersiz gönderim ID");
    alert("Geçersiz gönderim ID’si.");
    return;
  }

  const token = localStorage.getItem("token");

  try {
    // API’ye istek gönder
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/attendance/task-submissions/${submissionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    alert("Gönderim silindi ✅");

    // Local state’den sil
    setSessions((prevSessions) =>
      prevSessions.map((s) => ({
        ...s,
        submissions: s.submissions?.filter((sub) => sub._id !== submissionId)
      }))
    );
  } catch (err) {
    console.error("❌ Silme hatası:", err);
    alert("Silinemedi. Lütfen tekrar deneyin.");
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
      <aside
  className={`fixed top-0 left-0 h-screen w-72 bg-black/30 backdrop-blur-md border-r border-white/20 flex flex-col z-50 transform transition-all duration-300 ease-in-out
    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    lg:translate-x-0 lg:static lg:min-h-screen lg:h-auto`}
>

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
          </div>
          <h1 className="text-4xl font-bold text-yellow-400">Huawei Cloud AI Bootcamp</h1>
        </div>
        {/* Panel Başlığı */}
        <h2 className="text-xl lg:text-2xl font-bold text-yellow-400 mb-6 lg:mb-8 flex items-center gap-2">
          {panelTitles[activePanel]}
          </h2>

        {/* Panel İçeriği */}
        {activePanel === "Program" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {sessions.map((s) => (
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
<div className="mb-4">
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
</div>

              </div>
            ))}
          </div>
        )}

        {activePanel === "Katılım" && (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
    {sessions.map((s) => (
      <div key={s.week} className="relative bg-white/10 border border-white/20 p-5 rounded-xl hover:scale-[1.02] hover:border-yellow-400 transition backdrop-blur-sm">
        <h3 className="text-lg font-bold text-yellow-300 mb-3 flex items-center gap-2">
          <span className="bg-yellow-400/20 border border-yellow-400/30 rounded-lg px-3 py-1">
            {s.week}. Hafta
          </span>
        </h3>

        {/* 1. Gün Katılım */}
        <div className="mb-3">
          <p className="text-sm font-semibold text-white mb-1">📅 1. Gün</p>
          {s.attendedDay1 ? (
            <p className="text-green-400 font-bold">✔ Katıldınız</p>
          ) : s.activeDay1 ? (
            <button
              onClick={() => handleAttend(s.week, 1)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold text-sm"
            >
              Katıldım
            </button>
          ) : (
            <p className="text-gray-400 italic text-sm">Katılım kapalı</p>
          )}
        </div>

        {/* 2. Gün Katılım */}
        <div>
          <p className="text-sm font-semibold text-white mb-1">📅 2. Gün</p>
          {s.attendedDay2 ? (
            <p className="text-green-400 font-bold">✔ Katıldınız</p>
          ) : s.activeDay2 ? (
            <button
              onClick={() => handleAttend(s.week, 2)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold text-sm"
            >
              Katıldım
            </button>
          ) : (
            <p className="text-gray-400 italic text-sm">Katılım kapalı</p>
          )}
        </div>
      </div>
    ))}
  </div>
)}


        {activePanel === "Eğitmenler" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { name: "Hakan Aktaş", title: "Data Scientist – Huawei", linkedin: "https://www.linkedin.com/in/hakanaktas1/", image: "/hakanaktas.jpg" },
              { name: "Barış Kaplan", title: "AI & ML Engineer/Data Scientist – Huawei", linkedin: "https://www.linkedin.com/in/baris-k-896652175/", image: "/bariskaplan.png" },
              { name: "Sefa Bilicier", title: "Cloud Solutions Engineer - Huawei", linkedin: "https://tr.linkedin.com/in/sefabilicier", image: "/sefabilicier.jpg" },
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
        className="bg-white/10 border border-white/20 p-5 rounded-xl transition hover:scale-[1.02] hover:border-yellow-400 backdrop-blur-sm"
      >
        <h3 className="text-lg font-bold text-yellow-300 mb-3 flex items-center gap-2">
          <span className="bg-yellow-400/20 border border-yellow-400/30 rounded-lg px-3 py-1">
            {s.week}. Hafta Kaynakları
          </span>
        </h3>

        {/* 1. Gün Kaynaklar */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-white mb-2">📅 1. Gün Kaynakları</p>

          {/* Medium */}
          {s.mediumUrl?.day1 ? (
            <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10 mb-2">
              <span className="text-sm text-white flex items-center gap-2">
                <span className="bg-green-500/20 p-1.5 rounded-lg">📝</span> Medium
              </span>
              <a
                href={s.mediumUrl.day1}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1"
              >
                Oku
              </a>
            </div>
          ) : (
            <p className="text-gray-400 italic text-sm mb-2">Medium bağlantısı yok</p>
          )}

          {/* Video */}
          {s.videoUrl?.day1 ? (
            <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
              <span className="text-sm text-white flex items-center gap-2">
                <span className="bg-blue-500/20 p-1.5 rounded-lg">🎥</span> Video
              </span>
              <a
                href={s.videoUrl.day1}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1"
              >
                İzle
              </a>
            </div>
          ) : (
            <p className="text-gray-400 italic text-sm mb-2">Video bağlantısı yok</p>
          )}
        </div>

        {/* 2. Gün Kaynaklar */}
        <div>
          <p className="text-sm font-semibold text-white mb-2">📅 2. Gün Kaynakları</p>

          {/* Medium */}
          {s.mediumUrl?.day2 ? (
            <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10 mb-2">
              <span className="text-sm text-white flex items-center gap-2">
                <span className="bg-green-500/20 p-1.5 rounded-lg">📝</span> Medium
              </span>
              <a
                href={s.mediumUrl.day2}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1"
              >
                Oku
              </a>
            </div>
          ) : (
            <p className="text-gray-400 italic text-sm mb-2">Medium bağlantısı yok</p>
          )}

          {/* Video */}
          {s.videoUrl?.day2 ? (
            <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
              <span className="text-sm text-white flex items-center gap-2">
                <span className="bg-blue-500/20 p-1.5 rounded-lg">🎥</span> Video
              </span>
              <a
                href={s.videoUrl.day2}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1"
              >
                İzle
              </a>
            </div>
          ) : (
            <p className="text-gray-400 italic text-sm mb-2">Video bağlantısı yok</p>
          )}
        </div>
      </div>
    ))}
  </div>
)}


        {activePanel === "Kurallar" && (
  <div className="space-y-4 text-sm text-white/90 leading-relaxed">
    <h3 className="text-lg font-bold text-yellow-300 mb-2">📌 Program Kuralları</h3>
    <ul className="list-disc list-inside space-y-1">
      <li>📅 Bu program 4 haftalık bir eğitim sürecini kapsamaktadır.</li>
      <li>📝 Katılımınız her hafta otomatik olarak sistemden takip edilmektedir.</li>
      <li>📊 Sertifika almak için en az <span className="text-yellow-300 font-semibold">%80</span> oranında katılım gereklidir.</li>
      <li>🎓 Eğitimi tamamlayanlara katılım belgesi verilecektir.</li>
    </ul>

    <h3 className="text-lg font-bold text-yellow-300 mt-6 mb-2">🤝 Topluluk Kuralları</h3>
    <ul className="list-disc list-inside space-y-1">
      <li>💬 Tüm katılımcılardan saygılı ve destekleyici bir iletişim beklenmektedir.</li>
      <li>🚫 Hakaret, spam veya reklam içerikli mesajlar yasaktır.</li>
      <li>📥 Sorularınızı sormaktan çekinmeyin, topluluk yardımlaşmayı sever.</li>
      <li>🧠 Katılımınız ve katkılarınız program kalitesini artırır.</li>
      <li>📨 Sorun yaşarsanız eğitmenlere veya destek kanallarına ulaşabilirsiniz.</li>
    </ul>
  </div>
)}


{activePanel === "Görevler" && (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
    {sessions.map((s) => (
      <div
        key={s.week}
        className={`p-5 rounded-xl border ${
          s.taskActive
            ? "bg-white/10 border-white/20"
            : "bg-white/5 border-white/10 opacity-60"
        }`}
      >
        <h3 className="text-lg font-bold text-yellow-300 mb-3">
          {s.week}. Hafta Görevleri
        </h3>

        {s.tasks?.length > 0 ? (
          <ul className="list-disc ml-5 text-white text-sm mb-4">
            {s.tasks.map((task, i) => (
              <li key={i}>{task}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-300 italic text-sm mb-4">Görev tanımlanmamış</p>
        )}

        {/* Gönderilmiş dosyalar */}
        {s.submissions?.length > 0 && (
          <div className="mb-3">
            <p className="text-white font-semibold mb-2 text-sm">📂 Gönderilen Dosyalar</p>
            {s.submissions.map((submission) => (
              <div
                key={submission._id}
                className="flex justify-between items-center bg-white/5 p-2 rounded border border-white/10 mb-2"
              >
                <a
                  href={submission.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 text-sm underline"
                >
                  {new Date(submission.submittedAt).toLocaleString()}
                </a>
                <button
  onClick={() => handleDeleteSubmission(submission._id)} // ✅ _id kullanılmalı
  className="text-red-400 text-xs hover:underline"
>
  Sil
</button>

              </div>
            ))}
          </div>
        )}

        {/* Yeni Gönderim Formu */}
        <form
          onSubmit={(e) => handleTaskSubmit(e, s.week)}
          className="flex flex-col gap-2 mt-3"
        >
          <input
            type="text"
            name="fileUrl"
            placeholder="Dosya bağlantısı (GitHub, Drive...)"
            className="p-2 rounded bg-white/5 border border-white/10 text-white text-sm"
            required
          />
          <button
            type="submit"
            className={`${
              s.taskActive
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-500 cursor-not-allowed"
            } text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition`}
            disabled={!s.taskActive}
          >
            Gönder
          </button>
        </form>

        {/* Aktif değilse uyarı */}
        {!s.taskActive && (
          <p className="text-yellow-300 text-xs italic mt-2">
            Bu haftanın görevi henüz aktif değil.
          </p>
        )}
      </div>
    ))}
  </div>
)}

      </main>
    </div>
  );
};

export default ParticipantDashboard;
