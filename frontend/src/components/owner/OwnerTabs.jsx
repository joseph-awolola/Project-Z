import { Building2, CreditCard, Users } from "lucide-react";
import { Link } from "react-router-dom";

const tabs = [
  { id: "business", label: "Business & plan", icon: Building2 },
  { id: "members", label: "Members", icon: Users },
  { id: "payments", label: "Payment records", icon: CreditCard },
];

export default function OwnerTabs({ activeTab }) {
  return (
    <nav className="owner-tabs" aria-label="Owner dashboard sections">
      {tabs.map(({ id, label, icon: Icon }) => (
        <Link
          key={id}
          to={`/owner?tab=${id}`}
          className={`owner-tab ${activeTab === id ? "active" : ""}`}
          aria-current={activeTab === id ? "page" : undefined}
        >
          <Icon size={18} strokeWidth={1.8} />
          {label}
        </Link>
      ))}
    </nav>
  );
}
