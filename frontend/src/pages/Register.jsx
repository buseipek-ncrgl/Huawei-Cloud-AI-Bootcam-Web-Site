import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'participant',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { email, password, phone } = form;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10,11}$/;

    if (!emailRegex.test(email)) {
      setError('Geçerli bir e-posta adresi giriniz.');
      return false;
    }

    if (!phoneRegex.test(phone)) {
      setError('Telefon numarası yalnızca rakamlardan oluşmalı (10-11 hane).');
      return false;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/register`, form);

      alert('Kayıt başarılı! Giriş yapabilirsiniz.');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Kayıt başarısız');
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/background1.png')" }}
    >
      <div className="min-h-screen bg-black/40 flex flex-col items-center justify-start px-4 py-10">

        {/* LOGOLAR + BAŞLIK */}
        <div className="flex flex-col items-center justify-center mt-4 mb-8">
          <div className="flex items-center gap-8 mb-2">
            <img src="/huaweilogo.png" alt="Huawei" className="w-32 sm:w-36 drop-shadow-xl brightness-110" />
            <img src="/hsdlogo.png" alt="Partner" className="w-32 sm:w-36 drop-shadow-xl brightness-110" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-yellow-400 text-center">
            Huawei Cloud AI Bootcamp
          </h1>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white/10 border border-white/20 rounded-xl p-6 text-white shadow-lg text-sm sm:text-base"
        >
          <h2 className="text-2xl font-semibold text-center mb-4">Kayıt Ol</h2>

          {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

          <input
            type="text"
            name="fullName"
            placeholder="Ad Soyad"
            className="w-full mb-3 p-2 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring focus:ring-yellow-400"
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="E-posta"
            className="w-full mb-3 p-2 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring focus:ring-yellow-400"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Telefon"
            className="w-full mb-3 p-2 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring focus:ring-yellow-400"
            onChange={handleChange}
            required
          />

          {/* Şifre + Göz */}
          <div className="relative mb-3">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Şifre"
              className="w-full p-2 pr-10 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring focus:ring-yellow-400"
              onChange={handleChange}
              required
            />
            <div
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.979 9.979 0 012.226-3.592m3.64-2.44A9.953 9.953 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.96 9.96 0 01-1.276 2.592M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                </svg>
              )}
            </div>
          </div>

          {/* Rol Seçimi */}
          

          <button
            type="submit"
            className="w-full bg-yellow-400 text-black font-semibold py-2 rounded hover:bg-yellow-300 transition"
          >
            Kayıt Ol
          </button>

          <p className="text-sm text-center mt-4 text-gray-300">
            Zaten hesabın var mı?{" "}
            <Link to="/" className="text-yellow-300 hover:underline">
              Giriş Yap
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
