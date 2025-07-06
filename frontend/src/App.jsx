import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ParticipantDashboard from './pages/ParticipantDashboard';
import InstructorDashboard from './pages/InstructorDashboard'; // 👈 bunu da ekle
import axios from "axios";

// Token'ı localStorage'dan al ve axios'a varsayılan olarak ayarla
axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/participant" element={<ParticipantDashboard />} />
        <Route path="/instructor" element={<InstructorDashboard />} /> {/* 👈 eksik olan burası */}
      </Routes>
    </Router>
  );
}

export default App;
