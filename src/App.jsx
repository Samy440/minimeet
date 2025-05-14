import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DashboardPage from './pages/Dashboard';
import MeetRoomPage from './pages/MeetRoom';
// import { supabase } from './services/supabaseClient'; // Pour la gestion de session future

// Un composant simple pour simuler une page protégée
const ProtectedRoute = ({ children }) => {
  // const session = supabase.auth.session(); // Logique de session à affiner
  const session = true; // Placeholder: Assume l'utilisateur est connecté pour l'instant
  if (!session) {
    console.log("ProtectedRoute: No session, redirecting to login.");
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/meet/:roomId" element={<ProtectedRoute><MeetRoomPage /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
