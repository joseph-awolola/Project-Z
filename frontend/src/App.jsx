import Login from "./pages/Login.jsx";
import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { getMe } from "./api.js";
import OwnerDashboard from "./pages/owner/OwnerDashboard.jsx";
import MemberDashboard from "./pages/MemberDashboard.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("token");

      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const result = await getMe(token);
        setUser(result.user);
      } catch (error) {
        console.error("Authentication error:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setAuthLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (authLoading) {
    return <div>Checking your session...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/owner" element={<OwnerDashboard />} />
      <Route path="/member" element={<MemberDashboard />} />
    </Routes>
  );
}
