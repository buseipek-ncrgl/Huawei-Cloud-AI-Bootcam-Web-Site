import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const panels = [
  { key: "Profil", title: "🙋‍♂️ Profilim" },
  { key: "Duyurular", title: "📢 Duyurular" },
  { key: "Hakkımızda", title: "ℹ️ Hakkımızda" },
  { key: "Program", title: "📅 Eğitim Programı" },
  { key: "Katılım", title: "📝 Katılım Durumu" },
  { key: "Eğitmenler", title: "👨‍🏫 Eğitmenler" },
  { key: "Kaynaklar", title: "📚 Eğitim Kaynakları" },
  { key: "Görevler", title: "✅ Haftalık Görevler" },
  { key: "Sertifika", title: "🎓 Sertifika" },
  { key: "Huawei Cloud Hesabı", title: "☁️ Huawei Cloud Hesabı" },
  { key: "Kurallar", title: "📌 Katılım Kuralları" },
  { key: "Sorular", title: "❓ Sıkça Sorulan Sorular" },
  { key: "İletişim", title: "✉️ İletişim Bilgileri" },
];


const panelTitles = {
  Profil: "🙋‍♂️ Profilim",
  Duyurular: "📢 Duyurular",
  Hakkımızda: "ℹ️ Hakkımızda",
  Program: "📅 Eğitim Programı",
  Katılım: "📝 Katılım Durumu",
  Eğitmenler: "👨‍🏫 Eğitmenler",
  Kaynaklar: "📚 Eğitim Kaynakları",
  Görevler: "✅ Haftalık Görevler",
  Sertifika: "🎓 Sertifika",
  "Huawei Cloud Hesabı": "☁️ Huawei Cloud Hesabı",
  Kurallar: "📌 Katılım Kuralları",
  Sorular: "❓ Sıkça Sorulan Sorular",
  İletişim: "✉️ İletişim Bilgileri",
};


function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return {};
  }
}

const ParticipantDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePanel, setActivePanel] = useState("Program");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [user, setUser] = useState(null); // 🟡 Profil için kullanıcı bilgisi
  const [certificateUrl, setCertificateUrl] = useState("");
  const [editingField, setEditingField] = useState(null);
const [editValues, setEditValues] = useState({
  fullName: user?.fullName || "",
  email: user?.email || ""
});

  // useEffect dışında, en üstte tanımla
const fetchData = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Sessions verisini çek
    const sessionRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance/sessions`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!sessionRes.data.sessions) {
      throw new Error(sessionRes.data.error || "Veri alınamadı");
    }

    let initialSessions = sessionRes.data.sessions;
    const fullName = sessionRes.data.fullName;
    const email = sessionRes.data.email;

    // Submissions verisini çek
    const submissionRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance/task-submissions`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const submissions = submissionRes.data.submissions;

    const grouped = {};
    submissions.forEach((s) => {
      if (!grouped[s.week]) grouped[s.week] = [];
      grouped[s.week].push(s);
    });

    const mergedSessions = initialSessions.map((s) => ({
      ...s,
      submissions: grouped[s.week] || [],
    }));

    setSessions(mergedSessions);
    setFullName(fullName);
    setUser({
      fullName,
      email,
      sessions: mergedSessions,
    }); // ✅ PROFİL PANELİ İÇİN

  } catch (err) {
    setError(err.response?.data?.error || err.message);
    if (err.response?.status === 403) {
      navigate("/login");
    }
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  fetchData();
}, []);

const handleSave = async (field) => {
  const token = localStorage.getItem("token");
  try {
    await axios.put(`${import.meta.env.VITE_API_URL}/api/profile`, {
      [field]: editValues[field]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setEditingField(null);
    window.location.reload(); // Veya state güncellemesi yapılabilir
  } catch (err) {
    console.error("Güncelleme hatası ❌", err);
  }
};



useEffect(() => {
  const fetchAnnouncements = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/attendance/announcements`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        setAnnouncements(res.data.announcements);
      }
    } catch (err) {
      console.error("Duyurular alınamadı ❌", err);
    }
  };

  fetchAnnouncements();
}, []);


  const handleAttend = async (week, day) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/attendance/${week}`,
      { day: day }, // 👈 açıkça belirt
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // ✅ Bu çok önemli
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Katılım kaydedilemedi");
    }

    alert(`${week}. Hafta ${day}. Gün için katılım alındı ✅`);
    await fetchData();
  } catch (err) {
    alert(err.response?.data?.error || err.message);
  }
};

// 🔧 GÜNCELLENMİŞ handleTaskSubmit
const handleTaskSubmit = async (e, week, taskIndex) => {
  e.preventDefault();

  const inputName = `fileUrl-${week}-${taskIndex}`;
  const fileUrl = e.target.elements[inputName]?.value.trim();
  if (!fileUrl) return;

  const token = localStorage.getItem("token");

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/attendance/session/${week}/task`,
      { fileUrl, taskIndex }, // 👈 taskIndex de gönderiliyor
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const newSubmission = response.data.submission;

    alert("✅ Görev gönderildi!");
    e.target.reset();

    // 🔁 Yeni gönderimi ilgili görev index’ine göre ekle
    setSessions((prev) =>
      prev.map((s) =>
        s.week === week
          ? {
              ...s,
              submissions: [...(s.submissions || []), newSubmission],
            }
          : s
      )
    );
  } catch (err) {
    console.error("Görev gönderilemedi ❌:", err);
    alert("Görev gönderilemedi. Lütfen bağlantıyı kontrol edin.");
  }
};

const handleDeleteSubmission = async (id) => {
  const token = localStorage.getItem("token");

  try {
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/attendance/task-submissions/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    alert("Gönderim silindi ✅");

    // ⛔️ _id ile eşleşen gönderimi kaldır
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        submissions: s.submissions?.filter((sub) => sub._id !== id),
      }))
    );
  } catch (err) {
    console.error("Silme hatası ❌:", err);
    alert("Gönderim silinemedi.");
  }
};

useEffect(() => {
  const fetchMyCertificate = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/certificates/my-certificate`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCertificateUrl(res.data?.url || "");
    } catch (err) {
      console.error("Sertifika alınamadı ❌", err);
    }
  };

  fetchMyCertificate();
}, []);

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

{activePanel === "Program" && (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
    
    {/* 📣 Açılış Toplantısı Kartı */}
    <div className="bg-white/10 border border-white/20 p-5 rounded-xl transition hover:scale-[1.02] hover:border-yellow-400 backdrop-blur-sm">
      <h3 className="text-lg font-bold text-yellow-300 mb-3 flex items-center gap-2">
        <span className="bg-yellow-400/20 border border-yellow-400/30 rounded-lg px-3 py-1">
          📣 Açılış Toplantısı
        </span>
      </h3>
      <div className="mb-4">
        <p className="text-sm font-semibold text-white mb-1">🎥 YouTube Kaydı</p>
        <a
          href="https://www.youtube.com/live/R1dki1PzVV4?si=QczerDJiKmnIe6D-" // kendi linkinle değiştir
          target="_blank"
          rel="noopener noreferrer"
          className="text-yellow-300 underline text-sm hover:text-yellow-400"
        >
          Açılış toplantısını izlemek için tıklayın
        </a>
      </div>

      <div>
        <p className="text-sm font-semibold text-white mb-1">📝 Açıklama</p>
        <p className="text-white/90 text-sm">
          Program hakkında genel bilgilendirme, tanışma ve beklentilerin paylaşıldığı oturumdur.
        </p>
      </div>
    </div>

    {/* Haftalık Oturumlar */}
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
        className={`p-5 rounded-xl border transition duration-300 ${
          s.taskActive
            ? "bg-white/10 border-white/20 hover:border-yellow-400"
            : "bg-white/5 border-white/10 opacity-60"
        }`}
      >
        <h3 className="text-lg font-bold text-yellow-300 mb-3">
          {s.week}. Hafta Görevleri
        </h3>

{s.tasks?.length > 0 ? (
  <div className="space-y-4 mb-4">
    {s.tasks.map((task, i) => (
      <div key={i} className="bg-white/5 p-3 rounded border border-white/10">
        <p className="text-sm text-yellow-300 font-semibold mb-2">
          {i + 1}. Görev: <span className="text-white">{task}</span>
        </p>

        {/* Gönderimler ve durumlar */}
       <ul className="text-white text-xs mb-2 space-y-1">
  {s.submissions
    ?.filter((sub) => sub.taskIndex === i)
    .map((sub, idx) => (
      <li
        key={sub.id || sub._id}
        className="flex justify-between items-center gap-2"
      >
        <div className="flex items-center gap-3 flex-1">
          <a
            href={sub.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 underline"
          >
            {idx + 1}. Gönderim
          </a>

          <span
            className={`text-xs font-semibold ${
              sub.status === "approved"
                ? "text-green-400"
                : sub.status === "rejected"
                ? "text-red-400"
                : "text-yellow-400"
            }`}
          >
            {sub.status === "approved"
              ? "Onaylandı"
              : sub.status === "rejected"
              ? "Reddedildi"
              : "Bekliyor"}
          </span>
        </div>

        {/* ❌ Silme Butonu */}
        <button
          onClick={() => handleDeleteSubmission(sub.id || sub._id)}
          className="text-red-400 hover:underline text-xs"
        >
          🗑 Sil
        </button>
      </li>
    ))}
</ul>


        {/* Yeni Gönderim Formu */}
        <form
          onSubmit={(e) => handleTaskSubmit(e, s.week, i)}
          className="flex gap-2"
        >
          <input
            type="text"
            name={`fileUrl-${s.week}-${i}`}
            placeholder="Dosya bağlantısı"
            required
            className="flex-1 p-2 rounded bg-white/10 border border-white/20 text-white text-sm"
          />
          <button
            type="submit"
            className={`${
              s.taskActive
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-500 cursor-not-allowed"
            } text-white px-3 py-1.5 rounded text-sm font-semibold`}
            disabled={!s.taskActive}
          >
            Gönder
          </button>
        </form>

        {!s.taskActive && (
          <p className="text-yellow-300 text-xs italic mt-2">
            Bu haftanın görevi henüz aktif değil.
          </p>
        )}
      </div>
    ))}
  </div>
) : (
  <p className="text-gray-300 italic text-sm mb-4">Görev tanımlanmamış</p>
)}

      </div>
    ))}
  </div>
)}


{activePanel === "Duyurular" && (
  <div className="space-y-4">
    {announcements?.length > 0 ? (
      announcements.map((a) => (
        <div
          key={a._id}
          className="relative bg-yellow-50/10 hover:scale-[1.02] transition-transform duration-300 border border-yellow-400/60 hover:border-yellow-400/90 p-5 rounded-2xl shadow-md group"
        >
          {/* Başlık kutusu */}
          <div className="inline-block bg-yellow-300/20 text-yellow-300 text-xl font-bold px-4 py-2 rounded-md mb-2">
            {a.title}
          </div>

          {/* İçerik */}
          <p className="text-white/90 text-sm whitespace-pre-line leading-relaxed mt-2">
            {a.content}
          </p>

          {/* Tarih - sağ üst köşede */}
          <div className="absolute top-3 right-4 text-yellow-200 text-xs italic">
            {new Date(a.createdAt).toLocaleString("tr-TR")}
          </div>
        </div>
      ))
    ) : (
      <p className="text-white/60 italic">Henüz duyuru bulunmamaktadır.</p>
    )}
  </div>
)}

{activePanel === "Hakkımızda" && (
   <div className="p-6 bg-white/5 border border-white/20 rounded-xl text-white space-y-6">

    <p className="text-white/90 text-sm leading-relaxed">
      <span className="font-semibold text-yellow-200">Huawei Cloud AI Bootcamp</span>, yapay zekâ ve bulut bilişim alanında kendini geliştirmek isteyen katılımcılar için özel olarak tasarlanmış teknik ve kişisel gelişim odaklı bir eğitim programıdır. Bu platform, yeni nesil teknolojileri tanıtmak, katılımcıların pratik projelerle deneyim kazanmasını sağlamak ve sektörel farkındalıklarını artırmak amacıyla oluşturulmuştur.
    </p>

    <p className="text-white/90 text-sm leading-relaxed">
      Program süresince katılımcılar:
    </p>

    <ul className="list-disc list-inside text-sm text-white/90 space-y-1">
      <li>📌 Gerçek dünya problemlerini çözen projeler üretir</li>
      <li>📌 Huawei Cloud altyapısı üzerinde uygulamalı deneyim kazanır</li>
      <li>📌 Mentor desteği ile bireysel gelişimlerini destekler</li>
      <li>📌 Haftalık görevler, videolar ve kaynaklarla düzenli olarak ilerleme sağlar</li>
    </ul>

    <p className="text-white/90 text-sm leading-relaxed">
      Ayrıca her katılımcının ilerlemesi şeffaf bir şekilde takip edilir; katılım, görev gönderimi ve başarı oranları düzenli olarak değerlendirilir.
    </p>

    <div className="bg-yellow-100/10 border border-yellow-300/30 p-4 rounded-xl">
      <h2 className="text-lg font-semibold text-yellow-300 mb-2">🎯 Vizyonumuz</h2>
      <p className="text-sm text-white/90">
        Geleceğin teknoloji liderlerini bulut ve yapay zekâ alanında yetkin bireyler olarak yetiştirmek.
      </p>
    </div>

    <div className="bg-yellow-100/10 border border-yellow-300/30 p-4 rounded-xl">
      <h2 className="text-lg font-semibold text-yellow-300 mb-2">🚀 Misyonumuz</h2>
      <p className="text-sm text-white/90">
        Erişilebilir, kaliteli ve uygulamalı bir eğitim ortamı sunarak, bilgiye dayalı üretkenliği ve ekip çalışmasını teşvik etmek.
      </p>
    </div>

    <p className="text-white/90 text-sm leading-relaxed">
      Bu platform, sadece bir eğitim alanı değil; aynı zamanda bir topluluk, bir üretim ortamı ve yeni yeteneklerin keşfedildiği bir yolculuktur.
    </p>
  </div>
)}

{activePanel === "Huawei Cloud Hesabı" && (
  <div className="p-6 bg-white/5 border border-white/20 rounded-xl text-white space-y-6">

    <p className="text-white/90 text-sm leading-relaxed">
      Huawei Cloud üzerinde ücretsiz bir hesap oluşturmak oldukça kolaydır. Aşağıdaki adımları takip ederek dakikalar içinde hesabınızı aktif hâle getirebilirsiniz:
    </p>

    <ol className="list-decimal list-inside space-y-2 text-sm text-white/90">
      <li>
        <span className="font-semibold text-yellow-300">Resmi Siteye Giriş:</span>{" "}
        <a
          href="https://intl.huaweicloud.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-300 hover:text-blue-400"
        >
          Huawei Cloud
        </a>
      </li>
      <li>
        Sağ üstteki <span className="font-semibold text-yellow-300">“Register”</span> veya <span className="font-semibold text-yellow-300">“Sign Up”</span> butonuna tıklayın.
      </li>
      <li>E-posta adresi ile kayıt olun ve gelen doğrulama kodunu girin.</li>
      <li>Şifre ve kişisel bilgileri doldurun.</li>
      <li>
        <span className="font-semibold text-yellow-300">“Individual”</span> seçeneği ile devam ederek kredi kartı bilginizi girin (ücret alınmaz).
      </li>
      <li>Doğrulama sonrası hesabınız aktif hâle gelecektir.</li>
    </ol>

    <div className="bg-yellow-100/10 border border-yellow-300/30 p-4 rounded-xl">
      <h2 className="text-lg font-semibold text-yellow-300 mb-2">📺 Video Rehber</h2>
      <p className="text-sm text-white/90 mb-3">
        Aşağıdaki bağlantıya tıklayarak Huawei Cloud hesap açma sürecini adım adım izleyebilirsiniz:
      </p>
      <a
        href="https://www.youtube.com/watch?v=dkpHpOBsCMA"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
      >
        🔗 Videoyu YouTube’da Aç
      </a>
    </div>

    <p className="text-white/90 text-sm leading-relaxed">
      Hesabınızı başarıyla açtıktan sonra <span className="text-yellow-300 font-medium">Huawei Cloud Console</span> üzerinden servisleri keşfetmeye başlayabilirsiniz.
    </p>
  </div>
)}

{activePanel === "Profil" && user && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
    
    {/* 👤 Katılımcı Bilgileri */}
    <div className="col-span-full bg-white/10 backdrop-blur-md p-6 rounded-xl border border-yellow-300 shadow-md hover:scale-[1.01] transition">
      <h2 className="text-xl font-bold text-yellow-300 mb-4">👤 Katılımcı Bilgileri</h2>

      {/* Ad Soyad */}
      <div className="mb-4">
        <label className="block text-sm text-yellow-100">Ad Soyad</label>
        {editingField === "fullName" ? (
          <div className="flex items-center mt-1 space-x-2">
            <input
              className="w-full bg-white/5 border border-yellow-300 text-white px-3 py-2 rounded-lg"
              value={editValues.fullName}
              onChange={(e) =>
                setEditValues((prev) => ({ ...prev, fullName: e.target.value }))
              }
            />
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
              onClick={() => handleSave("fullName")}
            >
              Kaydet
            </button>
            <button
              className="text-yellow-300 hover:underline text-sm"
              onClick={() => setEditingField("")}
            >
              İptal
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between mt-1">
            <span>{user.fullName}</span>
            <button
              className="flex items-center text-yellow-300 hover:text-yellow-400 text-sm"
              onClick={() => setEditingField("fullName")}
            >
              <span className="mr-1">Düzenle</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l3.536-3.536a2 2 0 112.828 2.828L11 13.828l-4 1 1-4z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* E-posta */}
      <div>
        <label className="block text-sm text-yellow-100">E-posta</label>
        {editingField === "email" ? (
          <div className="flex items-center mt-1 space-x-2">
            <input
              className="w-full bg-white/5 border border-yellow-300 text-white px-3 py-2 rounded-lg"
              value={editValues.email}
              onChange={(e) =>
                setEditValues((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
              onClick={() => handleSave("email")}
            >
              Kaydet
            </button>
            <button
              className="text-yellow-300 hover:underline text-sm"
              onClick={() => setEditingField("")}
            >
              İptal
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between mt-1">
            <span>{user.email}</span>
            <button
              className="flex items-center text-yellow-300 hover:text-yellow-400 text-sm"
              onClick={() => setEditingField("email")}
            >
              <span className="mr-1">Düzenle</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l3.536-3.536a2 2 0 112.828 2.828L11 13.828l-4 1 1-4z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>

    {/* 📊 Katılım Özeti */}
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-yellow-300 shadow-md hover:scale-[1.01] transition">
      <h2 className="text-xl font-bold text-yellow-300 mb-4">📊 Katılım Özeti</h2>
      <p className="text-sm">Toplam Gün: {user.sessions.length * 2}</p>
      <p className="text-sm mt-1">Katıldığı Gün: {user.sessions.filter(s => s.attendedDay1).length + user.sessions.filter(s => s.attendedDay2).length}</p>
      <p className="text-sm mt-1">
        Katılım Oranı:{" "}
        <span className="font-semibold text-yellow-200">
          {Math.round(
            ((user.sessions.filter(s => s.attendedDay1).length + user.sessions.filter(s => s.attendedDay2).length) / (user.sessions.length * 2)) * 100
          )}%
        </span>
      </p>
    </div>

    {/* 📝 Görev Özeti */}
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-yellow-300 shadow-md hover:scale-[1.01] transition">
      <h2 className="text-xl font-bold text-yellow-300 mb-4">📝 Görev Özeti</h2>
      <p className="text-sm">
        Gönderilen Görevler:{" "}
        {user.sessions.reduce((acc, s) => acc + (s.submissions?.length || 0), 0)}
      </p>
      <p className="text-sm mt-1">
        Aktif Görev Haftası:{" "}
        {user.sessions.filter(s => s.taskActive && s.submissions?.length > 0).length}
      </p>
    </div>
  </div>
)}


{activePanel === "Sertifika" && user && (
  <div className="p-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
      <div className="col-span-full">
        {certificateUrl ? (
          <div className="bg-white/5 backdrop-blur-sm border border-yellow-400 rounded-2xl shadow-xl p-6 text-center transition transform hover:scale-[1.02] duration-300 ease-in-out">
            <h2 className="text-2xl font-bold text-yellow-300 mb-3">🎉 Tebrikler {user.fullName}!</h2>
            <p className="text-white/90 mb-4">
              Huawei Cloud AI Bootcamp'i başarıyla tamamladınız. Aşağıdaki bağlantıdan sertifikanızı görüntüleyebilirsiniz:
            </p>
            <a
              href={certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-md transition"
            >
              🎓 Sertifikayı Görüntüle
            </a>
            <p className="text-white/60 text-sm mt-4 italic">Bu sertifika eğitmeniniz tarafından onaylanmıştır.</p>
          </div>
        ) : (
          <div className="text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 shadow-inner">
            <p className="text-yellow-200 text-lg font-semibold">Henüz sertifikanız yüklenmedi.</p>
            <p className="text-white/70 text-sm mt-2">Tüm koşulları sağladıktan sonra sertifikanız burada görünecektir.</p>
          </div>
        )}
      </div>
    </div>
  </div>
)}

{activePanel === "İletişim" && (
  <div className="flex justify-center text-white mt-6">
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-yellow-300 shadow-lg w-full max-w-2xl text-center">
      <h2 className="text-2xl font-bold text-yellow-300 mb-4">📬 İletişim</h2>
      <p className="text-white/70 mb-6">Bizimle aşağıdaki kanallardan iletişime geçebilirsiniz:</p>

      <div className="flex justify-center gap-6 text-yellow-300 text-3xl">
        {/* Instagram */}
        <a
          href="https://www.instagram.com/hsdturkiye/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-yellow-400 transition transform hover:scale-110"
        >
          <i className="fab fa-instagram"></i>
        </a>

        {/* LinkedIn */}
        <a
          href="https://www.linkedin.com/company/hsdturkiye/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-yellow-400 transition transform hover:scale-110"
        >
          <i className="fab fa-linkedin"></i>
        </a>

        {/* Medium */}
        <a
          href="https://medium.com/huawei-developers-tr"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-yellow-400 transition transform hover:scale-110"
        >
          <i className="fab fa-medium"></i>
        </a>

        {/* E-posta */}
        <a
          href="mailto:KubraBilgic1@huawei.com"
          className="hover:text-yellow-400 transition transform hover:scale-110"
        >
          <i className="fas fa-envelope"></i>
        </a>
      </div>
    </div>
  </div>
)}

      </main>
    </div>
  );
};

export default ParticipantDashboard;
