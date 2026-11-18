import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CreditCard, CalendarClock, XCircle } from "lucide-react";
import { getOwnerMembers, getOwnerPayments } from "../../api.js";
import StatCard from "../../components/owner/StatCard.jsx";
import StatusBadge from "../../components/owner/StatusBadge.jsx";
import PaymentDetailsModal from "../../components/owner/PaymentDetailsModal.jsx";

const money = (minor) => `€${(minor / 100).toFixed(2)}`;
const date = (value) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function PaymentRecords({ token, businessId }) {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!businessId) return;
    Promise.all([getOwnerPayments(token, businessId), getOwnerMembers(token, businessId)])
      .then(([paymentResult, memberResult]) => {
        setPayments(paymentResult.payments.map((payment) => {
          const member = payment.subscription.member;
          return {
            ...payment,
            member: member.name,
            initials: member.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
            date: date(payment.createdAt),
            status: payment.status === "SUCCESS" ? "Success" : "Failed",
            activity: payment.error || "Monthly membership charge",
            amount: payment.amountMinor / 100,
          };
        }));
        setMembers(memberResult.members);
      })
      .catch((requestError) => setError(requestError.message));
  }, [businessId, token]);

  const visiblePayments = useMemo(() => filter === "all" ? payments : payments.filter((payment) => payment.status.toLowerCase() === filter), [filter, payments]);
  const currentMonth = new Date();
  currentMonth.setDate(1);
  const thisMonth = payments.filter((payment) => new Date(payment.createdAt) >= currentMonth);
  const collected = thisMonth.filter((payment) => payment.status === "Success").reduce((total, payment) => total + payment.amountMinor, 0);
  const failed = payments.filter((payment) => payment.status === "Failed");
  const upcoming = members.filter((member) => member.status === "ACTIVE" && new Date(member.nextChargeAt) > new Date());

  if (!businessId) return <section className="panel records-panel"><h2>Create a business first</h2><p>Payment records will appear after the first subscription payment.</p></section>;
  return (
    <>
      {error && <p role="alert">{error}</p>}
      {failed.length > 0 && <div className="attention-banner"><AlertCircle size={19} /><span><strong>{failed.length} failed payment{failed.length === 1 ? "" : "s"} recorded.</strong> Review the payment details for the recorded failure reason.</span></div>}
      <section className="stats-grid">
        <StatCard label="Collected this month" value={money(collected)} note={`${thisMonth.filter((payment) => payment.status === "Success").length} successful payments`} icon={CreditCard} />
        <StatCard label="Upcoming" value={String(upcoming.length)} note="Active subscriptions" icon={CalendarClock} />
        <StatCard label="Failed" value={money(failed.reduce((total, payment) => total + payment.amountMinor, 0))} note={`${failed.length} failed payments`} icon={XCircle} />
      </section>
      <section className="panel records-panel">
        <div className="records-heading">
          <div><h2>Payment records</h2><p>Recorded charges and payment outcomes.</p></div>
          <label className="filter-control"><span>Filter status</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All payments</option><option value="success">Success</option><option value="failed">Failed</option></select></label>
        </div>
        <div className="desktop-table-wrap">
          <table className="data-table payments-table">
            <thead><tr><th>Member</th><th>Date</th><th>Status</th><th>Activity</th><th>Amount</th></tr></thead>
            <tbody>{visiblePayments.map((payment) => <tr key={payment.id} onClick={() => setSelectedPayment(payment)} tabIndex="0" onKeyDown={(event) => event.key === "Enter" && setSelectedPayment(payment)}>
              <td><div className="member-cell"><span className="member-avatar">{payment.initials}</span><strong>{payment.member}</strong></div></td>
              <td>{payment.date}</td><td><StatusBadge status={payment.status} /></td><td>{payment.activity}</td><td className="amount-cell">{money(payment.amountMinor)}</td>
            </tr>)}</tbody>
          </table>
        </div>
        {visiblePayments.length === 0 && <div className="empty-state"><strong>No payment records</strong><span>Recorded payments matching this filter will appear here.</span></div>}
      </section>
      <PaymentDetailsModal payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
    </>
  );
}
