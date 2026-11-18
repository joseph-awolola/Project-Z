import { useEffect, useState } from "react";
import { Search, Users, Check, AlertCircle } from "lucide-react";
import { getOwnerMembers } from "../../api.js";
import StatCard from "../../components/owner/StatCard.jsx";
import StatusBadge from "../../components/owner/StatusBadge.jsx";

const date = (value) => value
  ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value))
  : "—";
const amount = (minor) => `€${(minor / 100).toFixed(2)}`;

export default function Members({ token, businessId }) {
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!businessId) return;
    getOwnerMembers(token, businessId)
      .then((result) => setMembers(result.members))
      .catch((requestError) => setError(requestError.message));
  }, [businessId, token]);

  const rows = members.map((subscription) => {
    const payment = subscription.payments[0];
    const status = subscription.status === "CANCELLED" ? "Cancelled"
      : payment?.status === "FAILED" ? "Failed" : "Active";
    return {
      ...subscription,
      name: subscription.member.name,
      email: subscription.member.email,
      initials: subscription.member.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
      status,
      joined: date(subscription.createdAt),
      nextCharge: subscription.status === "CANCELLED" ? "—" : date(subscription.nextChargeAt),
      lastPayment: payment ? (payment.status === "SUCCESS" ? amount(payment.amountMinor) : "Failed") : "—",
    };
  });
  const normalized = query.trim().toLowerCase();
  const filteredMembers = normalized ? rows.filter((member) =>
    member.name.toLowerCase().includes(normalized) || member.email.toLowerCase().includes(normalized),
  ) : rows;
  const activeCount = rows.filter((member) => member.status === "Active").length;
  const failedCount = rows.filter((member) => member.status === "Failed").length;

  if (!businessId) return <section className="panel records-panel"><h2>Create a business first</h2><p>Member records will appear here after members subscribe.</p></section>;
  return (
    <>
      {error && <p role="alert">{error}</p>}
      <section className="stats-grid">
        <StatCard label="Total members" value={String(rows.length)} note="All subscriptions" icon={Users} />
        <StatCard label="Active" value={String(activeCount)} note="Active subscriptions" icon={Check} />
        <StatCard label="Needs attention" value={String(failedCount)} note="Most recent payment failed" icon={AlertCircle} />
      </section>
      <section className="panel records-panel">
        <div className="records-heading">
          <div><h2>Members</h2><p>Monitor subscriptions and recent payment status.</p></div>
          <label className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or email" aria-label="Search members" /></label>
        </div>
        <div className="desktop-table-wrap">
          <table className="data-table members-table">
            <thead><tr><th>Member</th><th>Status</th><th>Joined</th><th>Next charge</th><th>Last payment</th></tr></thead>
            <tbody>{filteredMembers.map((member) => <tr key={member.id}>
              <td><div className="member-cell"><span className="member-avatar">{member.initials}</span><span><strong>{member.name}</strong><small>{member.email}</small></span></div></td>
              <td><StatusBadge status={member.status} /></td><td>{member.joined}</td><td>{member.nextCharge}</td><td>{member.lastPayment}</td>
            </tr>)}</tbody>
          </table>
        </div>
        {filteredMembers.length === 0 && <div className="empty-state"><strong>No members found</strong><span>Member data will appear when someone subscribes.</span></div>}
      </section>
    </>
  );
}
