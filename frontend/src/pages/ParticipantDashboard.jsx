import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const panels = ["Program", "Katılım", "Eğitmenler", "Kaynaklar", "Kurallar", "İletişim"];

const ParticipantDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openPanel, setOpenPanel] = useState(null);
  const navigate = useNavigate();

  const togglePanel = (panel) => {
    setOpenPanel((prev) => (prev === panel ? null : panel));
  };

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
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/background1.png')" }}
    >
      <div className="min-h-screen bg-black/30 flex flex-col items-center px-4 py-10">
        {/* Logo ve Başlık */}
        <div className="flex flex-col items-center justify-center mt-2 mb-8">
          <div className="flex items-center gap-8 mb-2">
            <img src="/huaweilogo.png" className="w-40 sm:w-48" />
            <img src="/hsdlogo.png" className="w-40 sm:w-48" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-yellow-400 text-center">
            Huawei Cloud AI Bootcamp
          </h1>
        </div>

        {/* Katılımcı Bilgisi */}
        <div className="bg-white/10 border border-white/20 px-6 py-3 rounded-xl mb-6 shadow text-white backdrop-blur-sm">
          <p className="text-base sm:text-lg font-medium">
            Katılımcı:{" "}
            <span className="font-semibold text-white">{fullName}</span>
          </p>
        </div>

        {/* Paneller */}
        <div className="w-full max-w-5xl space-y-4">
          {panels.map((panel) => (
            <div key={panel} className="bg-white/10 border border-white/20 rounded-xl text-white shadow overflow-hidden">
              <button
                onClick={() => togglePanel(panel)}
                className="w-full text-left px-6 py-4 font-semibold text-xl bg-white/10 hover:bg-yellow-500/10 transition"
              >
                {panel}
              </button>
              {openPanel === panel && (
                <div className="p-6 bg-black/30">

                  {/* PROGRAM */}
                  {panel === "Program" ? (
                    sessions.length === 0 ? (
                      <p className="text-gray-200">Haftalık konu bilgisi bulunamadı</p>
                    ) : (
                      <div className="space-y-4">
                        {sessions.map((s) => (
                          <div key={s.week} className="bg-white/5 border border-white/20 rounded-lg p-4">
                            <h3 className="text-lg font-bold text-yellow-300 mb-2">{s.week}. Hafta</h3>
                            {s.topic ? (
                              <ul className="list-disc list-inside text-sm text-gray-200 space-y-1">
                                {s.topic.split("\n").map((item, i) => (
                                  <li key={i}>{item.trim()}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="italic text-gray-400">Henüz konu bilgisi girilmemiş</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )

                  /* KATILIM */
                  ) : panel === "Katılım" ? (
                    sessions.length === 0 ? (
                      <p className="text-gray-200">Yoklama bilgisi bulunamadı</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {sessions.map((s) => (
                          <div key={s.week} className="bg-white/5 border border-white/20 rounded-xl p-5 backdrop-blur-sm">
                            <h3 className="text-xl font-bold mb-3 text-yellow-300">{s.week}. Hafta</h3>

                            {s.topic && (
                              <div className="mb-3">
                                <p className="font-semibold mb-1 text-white">📌 Konular:</p>
                                <ul className="list-disc list-inside text-sm text-gray-200 space-y-1">
                                  {s.topic.split("\n").map((item, i) => (
                                    <li key={i}>{item.trim()}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {s.videoUrl?.trim() && (
                              <div className="mb-3">
                                <p className="font-semibold text-white">🎥 Video Link:</p>
                                <a
                                  href={s.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block mt-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                                >
                                  İzle
                                </a>
                              </div>
                            )}

                            {s.attended ? (
                              <span className="text-green-400 font-bold text-lg">✔ Katıldınız</span>
                            ) : s.active ? (
                              <button
                                onClick={() => handleAttend(s.week)}
                                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-base font-semibold w-full mt-2"
                              >
                                Katıldım
                              </button>
                            ) : (
                              <span className="text-gray-400 italic text-sm">Katılım Kapalı</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )

                  /* EĞİTMENLER */
                  ) : panel === "Eğitmenler" ? (
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
                      ].map((instructor, i) => (
                        <div key={i} className="bg-white/10 border border-white/20 rounded-lg p-4 text-white">
                          <h3 className="text-lg font-semibold">{instructor.name}</h3>
                          <p className="text-sm text-gray-300 mb-2">{instructor.title}</p>
                          <a
                            href={instructor.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline text-sm"
                          >
                            LinkedIn Profili
                          </a>
                        </div>
                      ))}
                    </div>

                  /* KURALLAR */
                  ) : panel === "Kurallar" ? (
                    <div className="space-y-3 text-gray-200 text-sm leading-relaxed">
                      <p>✅ Her katılımcının her hafta yoklama alması beklenmektedir.</p>
                      <p>📌 En az 4 hafta katılım zorunludur. Aksi halde sertifika verilmez.</p>
                      <p>🧠 Her hafta konular öğrenildikten sonra haftalık sınav yapılabilir.</p>
                      <p>🎓 Final sınavına sadece yeterli katılım gösterenler alınır.</p>
                      <p>📨 Sorularınız için eğitmenlerle veya iletişim bölümündeki destekle iletişime geçebilirsiniz.</p>
                    </div>

                  /* KAYNAKLAR */
                  ) : panel === "Kaynaklar" ? (
                    <div className="space-y-4 text-white text-sm">
                      <div>
                        <h4 className="font-semibold mb-1">🎥 YouTube Video:</h4>
                        <a
                          href="https://www.youtube.com/watch?v=örnekvideo"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          https://www.youtube.com/watch?v=örnekvideo
                        </a>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">📄 Medium Yazısı:</h4>
                        <a
                          href="https://medium.com/@hsdcloudbootcamp/hafta1"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          https://medium.com/@hsdcloudbootcamp/hafta1
                        </a>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">📁 CVÇ (Çalışma ve Video Çizelgesi):</h4>
                        <a
                          href="https://drive.google.com/file/d/örnekcvç"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          Google Drive Linki (CVÇ)
                        </a>
                      </div>
                    </div>

                  /* İLETİŞİM */
                  ) : panel === "İletişim" ? (
                    <div className="text-sm text-white space-y-3">
                      <p>📧 E-posta: <a href="mailto:hsdcloud@bootcamp.com" className="text-blue-400 underline">hsdcloud@bootcamp.com</a></p>
                      <p>💬 Discord: <a href="https://discord.gg/örnek" target="_blank" className="text-blue-400 underline">Katılmak için tıkla</a></p>
                    </div>

                  ) : (
                    <p className="text-gray-200">"{panel}" bölümü içeriği yakında eklenecek.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParticipantDashboard;
