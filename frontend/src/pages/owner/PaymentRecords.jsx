import { useState } from "react";
import { AlertCircle, CreditCard, CalendarClock, XCircle } from "lucide-react";
import { payments } from "../../data/payments.js";
import StatCard from "../../components/owner/StatCard.jsx";
import StatusBadge from "../../components/owner/StatusBadge.jsx";
import PaymentDetailsModal from "../../components/owner/PaymentDetailsModal.jsx";

export default function PaymentRecords() {
  const [selectedPayment, setSelectedPayment] = useState(null);

  return (
    <>
      <div className="attention-banner"><AlertCircle size={19} /><span><strong>2 payments need attention.</strong> Automatic retries are scheduled and members have been notified.</span></div>
      <section className="stats-grid">
        <StatCard label="Collected this month" value="€210.00" note="6 successful payments" icon={CreditCard} />
        <StatCard label="Upcoming" value="€105.00" note="Next 7 days" icon={CalendarClock} />
        <StatCard label="Failed" value="€70.00" note="2 retries pending" icon={XCircle} />
      </section>
      <section className="panel records-panel">
        <div className="records-heading">
          <div><h2>Payment records</h2><p>Every charge, retry, and reminder in one place.</p></div>
          <label className="filter-control"><span>Filter status</span><select defaultValue="all"><option value="all">All payments</option><option value="success">Success</option><option value="failed">Failed</option></select></label>
        </div>
        <div className="desktop-table-wrap">
          <table className="data-table payments-table">
            <thead><tr><th>Member ↕</th><th>Date ↕</th><th>Status</th><th>Activity</th><th>Amount</th></tr></thead>
            <tbody>{payments.map((payment) => <tr key={`${payment.initials}-${payment.date}`} onClick={() => setSelectedPayment(payment)} tabIndex="0" onKeyDown={(e) => e.key === "Enter" && setSelectedPayment(payment)}>
              <td><div className="member-cell"><span className="member-avatar">{payment.initials}</span><strong>{payment.member}</strong></div></td>
              <td>{payment.date}</td><td><StatusBadge status={payment.status} /></td><td>{payment.activity}</td><td className="amount-cell">€35.00</td>
            </tr>)}</tbody>
          </table>
        </div>
        <div className="mobile-record-list">
          {payments.map((payment) => <button className="mobile-record-card payment-mobile-card" key={`${payment.initials}-${payment.date}`} onClick={() => setSelectedPayment(payment)}>
            <div className="mobile-record-top"><div className="member-cell"><span className="member-avatar">{payment.initials}</span><strong>{payment.member}</strong></div><StatusBadge status={payment.status} /></div>
            <div className="mobile-record-meta"><span>Date <strong>{payment.date}</strong></span><span>Activity <strong>{payment.activity}</strong></span><span>Amount <strong>€35.00</strong></span></div>
          </button>)}
        </div>
      </section>
      <PaymentDetailsModal payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
    </>
  );
}
