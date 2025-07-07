import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/reset-password/${token}`,
        { newPassword }
      );
      setMessage(res.data.message);
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "İşlem sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/background1.png')" }}
    >
      <div className="min-h-screen bg-black/40 flex flex-col items-center justify-start px-4 py-10">
        {/* Logo ve Başlık */}
        <div className="flex flex-col items-center justify-center mt-4 mb-8">
          <div className="flex items-center gap-8 mb-2">
            <img src="/huaweilogo.png" alt="Huawei" className="w-32 sm:w-36 drop-shadow-xl brightness-110" />
            <img src="/hsdlogo.png" alt="Partner" className="w-32 sm:w-36 drop-shadow-xl brightness-110" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-yellow-400 text-center">
            Huawei Cloud AI Bootcamp
          </h1>
        </div>

        {/* Form veya Yükleniyor */}
        <div className="w-full max-w-md bg-white/10 border border-white/20 rounded-xl p-6 text-white shadow-lg text-sm sm:text-base">
          <h2 className="text-2xl font-semibold text-center mb-4">Yeni Şifre Belirle</h2>

          {message && <p className="text-green-400 text-center mb-3">{message}</p>}
          {error && <p className="text-red-400 text-center mb-3">{error}</p>}

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-yellow-400"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="password"
                placeholder="Yeni şifreniz"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="p-2 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring focus:ring-yellow-400"
                required
                minLength={6}
              />
              <button
                type="submit"
                className="bg-yellow-400 text-black font-semibold py-2 rounded hover:bg-yellow-300 transition"
              >
                Şifreyi Güncelle
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
