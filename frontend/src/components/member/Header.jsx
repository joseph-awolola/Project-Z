import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RECURPAYLOGO from "../../assets/RecurPay-Logo.svg";

export default function Header({ memberInitials }) {
  const navigate = useNavigate();

  function signOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/?mode=signin", { replace: true });
  }

  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__logo" aria-hidden="true">
          <img src={RECURPAYLOGO} alt="RecurPay Logo" />
        </span>
        <span className="header__name">RecurPay</span>
      </div>

      <div className="header__actions">
        <span className="header__role-badge">Member</span>
        <button className="header__icon-button" aria-label="Notifications">
          <Bell size={18} strokeWidth={1.6} />
        </button>
        <button className="header__icon-button" type="button" onClick={signOut} aria-label="Sign out" title="Sign out">
          <LogOut size={18} />
        </button>
        <button className="header__avatar" aria-label="Profile menu">
          {memberInitials}
        </button>
      </div>
    </header>
  );
}
