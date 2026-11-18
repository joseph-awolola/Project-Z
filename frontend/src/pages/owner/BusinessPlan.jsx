import { useEffect, useState } from "react";
import { Check, CreditCard, Users, Link2, Wallet } from "lucide-react";
import { createBusiness, getOwnerMembers, getOwnerPayments, updateBusiness } from "../../api.js";
import StatCard from "../../components/owner/StatCard.jsx";

const money = (minor) => `€${(minor / 100).toFixed(2)}`;

export default function BusinessPlan({ business, token, ownerWalletUrl, onSaved }) {
  const [name, setName] = useState(business?.name || "");
  const [fee, setFee] = useState(business ? (business.feeMinor / 100).toFixed(2) : "");
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!business) {
      return;
    }
    Promise.all([
      getOwnerMembers(token, business.id),
      getOwnerPayments(token, business.id),
    ]).then(([memberResult, paymentResult]) => {
      setMembers(memberResult.members);
      setPayments(paymentResult.payments);
    }).catch((requestError) => setError(requestError.message));
  }, [business, token]);

  async function saveChanges(event) {
    event.preventDefault();
    const feeMinor = Math.round(Number(fee) * 100);
    if (!name.trim() || !Number.isSafeInteger(feeMinor) || feeMinor <= 0) {
      setError("Enter a business name and a valid monthly fee.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      if (business) await updateBusiness(token, business.id, { name: name.trim(), feeMinor });
      else await createBusiness(token, { name: name.trim(), feeMinor });
      setNotice("Business and monthly plan saved.");
      await onSaved();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function copyJoinLink() {
    if (!business) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/join/${business.id}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setError("Unable to copy the link in this browser.");
    }
  }

  const currentMonth = new Date();
  currentMonth.setDate(1);
  const currentMonthPayments = payments.filter((payment) => new Date(payment.createdAt) >= currentMonth);
  const successful = currentMonthPayments.filter((payment) => payment.status === "SUCCESS");
  const revenue = successful.reduce((total, payment) => total + payment.amountMinor, 0);
  const activeCount = members.filter((member) => member.status === "ACTIVE").length;
  const successRate = currentMonthPayments.length
    ? `${((successful.length / currentMonthPayments.length) * 100).toFixed(1)}%`
    : "—";

  return (
    <>
      <section className="stats-grid">
        <StatCard label="Collected this month" value={money(revenue)} note={`${successful.length} successful payments`} icon={CreditCard} />
        <StatCard label="Active members" value={String(activeCount)} note={`${members.length} total subscriptions`} icon={Users} />
        <StatCard label="Payment success" value={successRate} note="Based on this month’s recorded payments" icon={Check} />
      </section>

      <form className="business-layout" onSubmit={saveChanges}>
        <section className="panel business-details">
          <div className="panel-heading">
            <div><h2>Business details</h2><p>Changes apply to new subscriptions; current subscriptions retain their approved fee.</p></div>
            {business && <span className="business-active"><Check size={14} /> Active</span>}
          </div>
          <div className="business-fields">
            <label className="form-field field-full">
              <span>Business name</span>
              <input name="name" value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
            <label className="form-field field-full">
              <span>Monthly fee (€)</span>
              <input name="fee" type="number" min="0.01" step="0.01" value={fee} onChange={(event) => setFee(event.target.value)} required />
            </label>
            <div className="form-field field-full">
              <span>Owner wallet</span>
              <div className="wallet-field">
                <Wallet size={18} />
                <span>{ownerWalletUrl || "Wallet URL is not available"}</span>
                <strong><Check size={14} /> Connected</strong>
              </div>
              <small>Payments settle directly to this wallet.</small>
            </div>
          </div>
        </section>

        <aside className="panel plan-panel">
          <div className="panel-heading"><div><h2>Monthly plan</h2><p>One simple fee, collected automatically.</p></div></div>
          <div className="plan-price"><strong>{money(Math.round(Number(fee || 0) * 100))}</strong><span>EUR / month</span></div>
          <div className="plan-breakdown"><div><span>Member pays</span><strong>{money(Math.round(Number(fee || 0) * 100))}</strong></div></div>
        </aside>

        <section className="join-link-panel">
          <div className="join-link-copy">
            <span className="join-link-icon"><Link2 size={21} /></span>
            <div><h3>Share your join link</h3><p>Members can review your plan and authorize recurring payments.</p></div>
          </div>
          <div className="copy-control">
            <span>{business ? `${window.location.host}/join/${business.id}` : "Save your business to create a join link"}</span>
            <button type="button" className="button button-secondary" disabled={!business} onClick={copyJoinLink}>{copied ? "Copied" : "Copy link"}</button>
          </div>
        </section>

        <div className="save-row">
          {error && <span className="save-notice" role="alert">{error}</span>}
          {!error && notice && <span className="save-notice" role="status">{notice}</span>}
          {!error && !notice && <span className="saved-time">{business ? "Business settings" : "Create your business profile"}</span>}
          <button className="button button-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
        </div>
      </form>
    </>
  );
}
