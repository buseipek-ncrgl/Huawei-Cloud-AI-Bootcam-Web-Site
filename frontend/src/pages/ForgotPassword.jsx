import { useState } from "react";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/forgot-password`, { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || "İşlem sırasında hata oluştu.");
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{ backgroundImage: "url('/background1.png')" }}
    >
      <div className="bg-white/10 border border-white/20 p-8 rounded-xl backdrop-blur-sm text-white w-full max-w-md text-center">
        <img src="/huaweilogo.png" alt="Huawei" className="w-40 mx-auto mb-4 drop-shadow-xl" />
        <h2 className="text-2xl font-bold mb-4">Şifremi Unuttum</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Kayıtlı e-posta adresi"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 rounded text-black"
            required
          />
          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded font-medium"
          >
            Sıfırlama Linki Gönder
          </button>
        </form>
        {message && <p className="mt-4 text-green-400">{message}</p>}
        {error && <p className="mt-4 text-red-400">{error}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
