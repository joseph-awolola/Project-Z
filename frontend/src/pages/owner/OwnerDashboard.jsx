import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getMe, getOwnerBusinesses } from "../../api.js";
import OwnerHeader from "../../components/owner/OwnerHeader.jsx";
import OwnerTabs from "../../components/owner/OwnerTabs.jsx";
import BusinessPlan from "./BusinessPlan.jsx";
import Members from "./Members.jsx";
import PaymentRecords from "./PaymentRecords.jsx";
import "../styles/owner.css";

export default function OwnerDashboard() {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const requestedTab = searchParams.get("tab");
  const activeTab = ["business", "members", "payments"].includes(requestedTab) ? requestedTab : "business";
  const business = businesses[0] || null;

  const loadBusinesses = useCallback(async () => {
    const result = await getOwnerBusinesses(token);
    setBusinesses(result.businesses);
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/?returnTo=%2Fowner", { replace: true });
      return;
    }
    async function loadDashboard() {
      try {
        const me = await getMe(token);
        if (me.user.role !== "OWNER") {
          navigate(me.user.role === "MEMBER" ? "/member" : "/", { replace: true });
          return;
        }
        setUser(me.user);
        const result = await getOwnerBusinesses(token);
        setBusinesses(result.businesses);
      } catch (requestError) {
        if (/token|authentication/i.test(requestError.message)) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/?returnTo=%2Fowner", { replace: true });
        } else setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [navigate, token]);

  const ownerName = user?.name || "Business owner";
  if (loading) return <div>Checking your account...</div>;

  return (
    <div className="owner-app">
      <OwnerHeader name={ownerName} />
      <main className="owner-main">
        <section className="owner-intro">
          <div>
            <p className="owner-eyebrow">{business?.name?.toUpperCase() || "YOUR BUSINESS"}</p>
            <h1>Welcome, {ownerName}</h1>
            <p className="owner-subtitle">Here’s what’s happening with your recurring payments.</p>
          </div>
          {business && <Link className="button button-secondary join-page-link" to={`/join/${business.id}`}>View join page <span aria-hidden="true">↗</span></Link>}
        </section>
        {error && <p role="alert">{error}</p>}
        <OwnerTabs activeTab={activeTab} />
        {activeTab === "business" && <BusinessPlan key={business?.id || "new"} business={business} token={token} ownerWalletUrl={user?.walletUrl} onSaved={loadBusinesses} />}
        {activeTab === "members" && <Members token={token} businessId={business?.id} />}
        {activeTab === "payments" && <PaymentRecords token={token} businessId={business?.id} />}
      </main>
    </div>
  );
}
