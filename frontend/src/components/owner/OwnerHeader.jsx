import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RECURPAYLOGO from "../../assets/RecurPay-Logo.svg";

export default function OwnerHeader({ name = "Business owner" }) {
  const navigate = useNavigate();
  const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  function signOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/?mode=signin", { replace: true });
  }

  return (
    <header className="owner-header">
      <a className="owner-brand" href="/" aria-label="RecurPay home">
        <span className="owner-brand-mark">
          <img src={RECURPAYLOGO} alt="RecurPay Logo" />
        </span>
        <span>RecurPay</span>
      </a>
      <div className="owner-header-actions">
        <span className="role-pill">Owner</span>
        <button
          className="icon-button"
          type="button"
          aria-label="Notifications"
        >
          <Bell size={19} />
        </button>
        <button className="icon-button" type="button" onClick={signOut} aria-label="Sign out" title="Sign out">
          <LogOut size={19} />
        </button>
        <span className="owner-avatar" aria-label={name}>
          {initials}
        </span>
      </div>
    </header>
  );
}
