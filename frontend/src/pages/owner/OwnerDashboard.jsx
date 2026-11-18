import { useSearchParams } from "react-router-dom";
import OwnerHeader from "../../components/owner/OwnerHeader.jsx";
import OwnerTabs from "../../components/owner/OwnerTabs.jsx";
import BusinessPlan from "./BusinessPlan.jsx";
import Members from "./Members.jsx";
import PaymentRecords from "./PaymentRecords.jsx";
import "../styles/owner.css";

export default function OwnerDashboard() {
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = ["business", "members", "payments"].includes(requestedTab)
    ? requestedTab
    : "business";

  return (
    <div className="owner-app">
      <OwnerHeader />
      <main className="owner-main">
        <section className="owner-intro">
          <div>
            <p className="owner-eyebrow">IRONCORE GYM</p>
            <h1>Good morning, Jordan</h1>
            <p className="owner-subtitle">
              Here’s what’s happening with your recurring payments.
            </p>
          </div>
          <a
            className="button button-secondary join-page-link"
            href="/join/ironcore"
          >
            View join page <span aria-hidden="true">↗</span>
          </a>
        </section>

        <OwnerTabs activeTab={activeTab} />

        {activeTab === "business" && <BusinessPlan />}
        {activeTab === "members" && <Members />}
        {activeTab === "payments" && <PaymentRecords />}
      </main>
    </div>
  );
}
