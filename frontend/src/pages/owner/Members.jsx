import { useMemo, useState } from "react";
import { Search, Users, Check, AlertCircle } from "lucide-react";
import { members } from "../../data/members.js";
import StatCard from "../../components/owner/StatCard.jsx";
import StatusBadge from "../../components/owner/StatusBadge.jsx";

export default function Members() {
  const [query, setQuery] = useState("");
  const filteredMembers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return members;
    return members.filter((member) =>
      member.name.toLowerCase().includes(normalized) || member.email.toLowerCase().includes(normalized)
    );
  }, [query]);

  return (
    <>
      <section className="stats-grid">
        <StatCard label="Total members" value="10" note="Across all statuses" icon={Users} />
        <StatCard label="Active" value="5" note="50% of all members" icon={Check} />
        <StatCard label="Needs attention" value="4" note="Grace period or lapsed" icon={AlertCircle} />
      </section>
      <section className="panel records-panel">
        <div className="records-heading">
          <div><h2>Members</h2><p>Monitor authorizations and payment health.</p></div>
          <label className="search-box"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name or email" aria-label="Search members" /></label>
        </div>
        <div className="desktop-table-wrap">
          <table className="data-table members-table">
            <thead><tr><th>Member ↕</th><th>Status ↕</th><th>Joined</th><th>Next charge</th><th>Last payment</th></tr></thead>
            <tbody>
              {filteredMembers.map((member) => <tr key={member.email}>
                <td><div className="member-cell"><span className="member-avatar">{member.initials}</span><span><strong>{member.name}</strong><small>{member.email}</small></span></div></td>
                <td><StatusBadge status={member.status} /></td><td>{member.joined}</td><td>{member.nextCharge}</td><td>{member.lastPayment}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div className="mobile-record-list">
          {filteredMembers.map((member) => <article className="mobile-record-card" key={member.email}>
            <div className="mobile-record-top"><div className="member-cell"><span className="member-avatar">{member.initials}</span><span><strong>{member.name}</strong><small>{member.email}</small></span></div><StatusBadge status={member.status} /></div>
            <div className="mobile-record-meta"><span>Joined <strong>{member.joined}</strong></span><span>Next charge <strong>{member.nextCharge}</strong></span><span>Last payment <strong>{member.lastPayment}</strong></span></div>
          </article>)}
        </div>
        {filteredMembers.length === 0 && <div className="empty-state"><strong>No members found</strong><span>Try a different name or email address.</span></div>}
      </section>
    </>
  );
}
