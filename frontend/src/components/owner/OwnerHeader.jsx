import { Bell, Repeat2 } from "lucide-react";
import RECURPAYLOGO from "../../assets/RecurPay-Logo.svg";

export default function OwnerHeader() {
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
        <span className="owner-avatar" aria-label="Jordan Kimani">
          JK
        </span>
      </div>
    </header>
  );
}
