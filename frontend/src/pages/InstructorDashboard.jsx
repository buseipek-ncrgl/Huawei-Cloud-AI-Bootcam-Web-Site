import { useEffect, useState } from "react";
import axios from "axios";

const InstructorDashboard = () => {
  const [summary, setSummary] = useState([]);
  const [fullName, setFullName] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [details, setDetails] = useState({ present: [], absent: [] });

  useEffect(() => {
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
    fetchData();
  }, []);

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

  const handleStart = async (week) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
  `${import.meta.env.VITE_API_URL}/api/sessions/${week}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`${week}. hafta başlatıldı ✅`);
      window.location.reload();
    } catch {
      alert("Başlatma başarısız");
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
      alert(`${week}. hafta durduruldu ⛔`);
      window.location.reload();
    } catch {
      alert("Durdurma başarısız");
    }
  };

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

      {/* EĞİTMEN BİLGİSİ */}
      <div className="bg-white/10 border border-white/20 px-6 py-3 rounded-xl mb-6 shadow text-white backdrop-blur-sm">
        <p className="text-base sm:text-lg font-medium">
          Eğitmen: <span className="font-semibold text-white">{fullName}</span>
        </p>
      </div>

      {/* YENİ HAFTA EKLEME FORMU */}
      <div className="mb-8 w-full max-w-xl text-center">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const week = e.target.week.value;
            const token = localStorage.getItem("token");
            try {
              await axios.post(`${import.meta.env.VITE_API_URL}/api/sessions/create`, { week }, {
                headers: { Authorization: `Bearer ${token}` }
              });
              alert(`${week}. hafta oluşturuldu ✅`);
              e.target.reset();
              window.location.reload();
            } catch (err) {
              alert(err.response?.data?.error || "Hafta oluşturulamadı");
            }
          }}
          className="flex flex-col sm:flex-row items-center justify-center gap-2"
        >
          <input
            type="number"
            name="week"
            placeholder="Yeni hafta numarası"
            className="p-2 rounded text-black w-full sm:w-auto"
            required
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
            Hafta Ekle
          </button>
        </form>
      </div>

      {/* HAFTALIK KATILIM KARTLARI */}
      <div className="w-full max-w-6xl">
        <h2 className="text-lg font-semibold mb-4 text-center text-white">
          Haftalık Katılım Özeti
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {summary.map((s) => (
            <div
              key={s.week}
              className="bg-white/10 p-4 rounded-lg border border-white/20 shadow text-center text-white backdrop-blur-sm"
            >
              <h3 className="text-lg font-semibold mb-2">{s.week}. Hafta</h3>
              <p className="mb-1">Katılım: <span className="font-bold">{s.attended}/{s.total}</span></p>
              <p className="mb-2">Oran: <span className="text-green-300 font-semibold">{s.rate}%</span></p>

              {s.active ? (
                <button
                  onClick={() => handleStop(s.week)}
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 mb-2"
                >
                  Yoklamayı Bitir
                </button>
              ) : (
                <button
                  onClick={() => handleStart(s.week)}
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 mb-2"
                >
                  Yoklamayı Başlat
                </button>
              )}

              <button
                onClick={() => fetchDetails(s.week)}
                className="mt-2 text-sm underline text-blue-300 hover:text-blue-400"
              >
                Katılımcı Detayları
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* DETAY TABLOSU */}
      {selectedWeek && details.present.length > 0 && (
        <div className="mt-10 bg-white/10 border border-white/20 rounded-xl p-6 w-full max-w-5xl">
          <h3 className="text-lg font-bold mb-4 text-white text-center">
            {selectedWeek}. Hafta Katılım Detayları
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-white border border-white/20">
              <thead className="bg-white/10 uppercase text-xs font-bold">
                <tr>
                  <th className="px-4 py-2">Ad Soyad</th>
                  <th className="px-4 py-2">E-posta</th>
                  <th className="px-4 py-2">Katıldığı Hafta</th>
                  <th className="px-4 py-2">Katılım Oranı</th>
                </tr>
              </thead>
              <tbody className="bg-white/5">
                {details.present.map((p) => (
                  <tr key={p.id} className="border-t border-white/10">
                    <td className="px-4 py-2">{p.name}</td>
                    <td className="px-4 py-2">{p.email}</td>
                    <td className="px-4 py-2">{p.attended} / {p.totalWeeks}</td>
                    <td className="px-4 py-2">
                      <span className={`${
                        p.rate >= 75
                          ? "text-green-400"
                          : p.rate >= 50
                          ? "text-yellow-300"
                          : "text-red-400"
                      } font-semibold`}>
                        %{p.rate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  </div>
);

};

export default InstructorDashboard;
