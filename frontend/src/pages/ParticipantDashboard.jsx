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
        <div className="w-full max-w-5xl">
  <h2 className="text-lg font-semibold mb-4 text-center text-white">
    Haftalık Katılım
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {sessions.length === 0 ? (
      <div className="col-span-full text-center text-gray-200">
        Yoklama bilgisi bulunamadı
      </div>
    ) : (
      sessions.map((s) => (
        <div
          key={s.week}
          className="relative bg-white/5 border border-white/20 rounded-xl p-5 text-white backdrop-blur-md shadow-md transition hover:scale-[1.015] hover:border-yellow-400"
        >
          {/* HAFTA BAŞLIĞI */}
          <h3 className="text-xl font-bold mb-3 text-yellow-300">{s.week}. Hafta</h3>

          {/* KONULAR (Madde madde) */}
          {s.topic ? (
            <div className="mb-3">
              <p className="text-sm font-semibold mb-1 text-white">📌 Konular:</p>
              <ul className="list-disc list-inside text-sm text-gray-200 space-y-1">
                {s.topic.split("\n").map((item, i) => (
                  <li key={i}>{item.trim()}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* VIDEO LİNK */}
          {s.videoUrl && (
            <div className="mb-3">
              <a
                href={s.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-blue-400 text-sm underline hover:text-blue-300 transition"
              >
                📺 Video İzle
              </a>
            </div>
          )}

          {/* KATILIM DURUMU */}
          {s.attended ? (
            <span className="text-green-400 font-bold text-lg mt-4">✔ Katıldınız</span>
          ) : s.active ? (
            <button
              onClick={() => handleAttend(s.week)}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-base font-semibold transition mt-4 w-full"
            >
              Katıldım
            </button>
          ) : (
            <span className="text-gray-400 italic text-sm">Katılım Kapalı</span>
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
