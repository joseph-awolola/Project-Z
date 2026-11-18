import Login from "./pages/Login.jsx";
import { useState, useEffect } from "react";
import { getMe } from "./api.js";

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

  return <Login />;
}
