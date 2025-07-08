import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ParticipantDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        setError(null);
      } catch (err) {
        console.error("Veri alınamadı:", err);
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
      console.error("Katılım hatası:", err);
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
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/background1.png')" }}
    >
      <div className="min-h-screen bg-black/30 flex flex-col items-center justify-start px-4 py-10">
        {/* LOGO + BAŞLIK */}
        <div className="flex flex-col items-center justify-center mt-2 mb-8">
          <div className="flex items-center gap-8 mb-2">
            <img
              src="/huaweilogo.png"
              alt="Huawei"
              className="w-40 sm:w-48 drop-shadow-2xl brightness-125"
            />
            <img
              src="/hsdlogo.png"
              alt="Partner Logo"
              className="w-40 sm:w-48 drop-shadow-2xl brightness-125"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-yellow-400 text-center">
            Huawei Cloud AI Bootcamp
          </h1>
        </div>

        {/* KATILIMCI BİLGİSİ */}
        <div className="bg-white/10 border border-white/20 px-6 py-3 rounded-xl mb-6 shadow text-white backdrop-blur-sm">
          <p className="text-base sm:text-lg font-medium">
            Katılımcı:{" "}
            <span className="font-semibold text-white">{fullName}</span>
          </p>
        </div>

        {/* HAFTALIK KATILIM */}
        <div className="w-full max-w-4xl">
          <h2 className="text-lg font-semibold mb-4 text-center text-white">
            Haftalık Katılım
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {sessions.length === 0 ? (
              <div className="col-span-full text-center text-gray-200">
                Yoklama bilgisi bulunamadı
              </div>
            ) : (
              sessions.map((s) => (
  <div
    key={s.week}
    className={`bg-white/10 border rounded-lg p-4 text-center transition text-white backdrop-blur-sm
      ${s.attended ? "border-green-400" : "border-white/20"}
    `}
  >
    <p className="text-lg font-semibold mb-1">{s.week}. Hafta</p>

    {/* 🔹 Konu varsa göster */}
    {s.topic && (
      <p className="text-sm mb-1 text-yellow-300 font-medium">
        Konu: {s.topic}
      </p>
    )}

    {/* 🔹 Video link varsa göster */}
    {s.videoUrl && (
      <a
        href={s.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-400 underline block mb-2"
      >
        📺 Video İzle
      </a>
    )}

    {/* Katılım durumu */}
    {s.attended ? (
      <span className="text-green-400 font-bold">✔ Katıldı</span>
    ) : s.active ? (
      <button
        onClick={() => handleAttend(s.week)}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
      >
        Katıldım
      </button>
    ) : (
      <span className="text-gray-300 text-sm">Katılım Kapalı</span>
    )}
  </div>
))

            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantDashboard;
