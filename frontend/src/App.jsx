import Login from "./pages/Login.jsx";
import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { getMe } from "./api.js";
import OwnerDashboard from "./pages/owner/OwnerDashboard.jsx";
import MemberDashboard from "./pages/MemberDashboard.jsx";
import BusinessDirectory from "./pages/BusinessDirectory.jsx";
import JoinPage from "./pages/JoinPage.jsx";
import CallbackPage from "./pages/CallbackPage.jsx";
import OutOfScope from "./pages/OutOfScope.jsx";

export default function App() {
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("token");

      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        await getMe(token);
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
      <Route path="/businesses" element={<BusinessDirectory />} />
      <Route path="/join/ironcore" element={<JoinPage />} />
      <Route path="/join/:businessId" element={<JoinPage />} />
      <Route path="/callback" element={<CallbackPage />} />
      <Route path="/subscription/result" element={<CallbackPage />} />
      <Route path="*" element={<OutOfScope />} />
    </Routes>
  );
}
