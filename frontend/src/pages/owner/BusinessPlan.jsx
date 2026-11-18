import { useState } from "react";
import { Check, CreditCard, Users, Link2, Info, Wallet } from "lucide-react";
import StatCard from "../../components/owner/StatCard.jsx";

const initialBusiness = {
  name: "Ironcore Gym",
  type: "Gym & fitness",
  description: "A welcoming community gym focused on strength, wellbeing, and consistent progress.",
};

export default function BusinessPlan() {
  const [business, setBusiness] = useState(initialBusiness);
  const [saved, setSaved] = useState(true);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");

  function updateField(event) {
    setBusiness((current) => ({ ...current, [event.target.name]: event.target.value }));
    setSaved(false);
    setNotice("");
  }

  function saveChanges(event) {
    event.preventDefault();
    setSaved(true);
    setNotice("Business and plan details saved successfully.");
  }

  async function copyJoinLink() {
    const link = `${window.location.origin}/join/ironcore`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setNotice("Unable to copy the link in this browser.");
    }
  }

  return (
    <>
      <section className="stats-grid">
        <StatCard label="Monthly revenue" value="€210.00" note="+ €35 expected this month" icon={CreditCard} />
        <StatCard label="Active members" value="6" note="of 10 total members" icon={Users} />
        <StatCard label="Payment success" value="85.7%" note="6 of 7 charges" icon={Check} />
      </section>

      <form className="business-layout" onSubmit={saveChanges}>
        <section className="panel business-details">
          <div className="panel-heading">
            <div><h2>Business details</h2><p>The information members see when they join.</p></div>
            <span className="business-active"><Check size={14} /> Active</span>
          </div>
          <div className="business-fields">
            <label className="form-field">
              <span>Business name</span>
              <input name="name" value={business.name} onChange={updateField} />
            </label>
            <label className="form-field">
              <span>Business type</span>
              <select name="type" value={business.type} onChange={updateField}>
                <option>Gym & fitness</option>
                <option>Tutoring</option>
                <option>Hostel</option>
                <option>Community group</option>
              </select>
            </label>
            <label className="form-field field-full">
              <span>Description</span>
              <textarea name="description" rows="4" value={business.description} onChange={updateField} />
            </label>
            <div className="form-field field-full">
              <span>Wallet address</span>
              <div className="wallet-field">
                <Wallet size={18} />
                <span>https://wallet.example/<br />ironcore</span>
                <strong><Check size={14} /> Connected</strong>
              </div>
              <small>Payments settle directly to this wallet.</small>
            </div>
          </div>
        </section>

        <aside className="panel plan-panel">
          <div className="panel-heading"><div><h2>Monthly plan</h2><p>One simple fee, collected automatically.</p></div></div>
          <div className="plan-price"><strong>€ 35.00</strong><span>EUR / month</span></div>
          <div className="plan-breakdown">
            <div><span>Member pays</span><strong>€35.00</strong></div>
            <div><span>Estimated processing fee</span><strong>€3.50</strong></div>
            <div className="owner-receives"><span>You receive</span><strong>€31.50</strong></div>
          </div>
          <div className="info-note"><Info size={17} /><span>Processing fees are shown transparently and may vary slightly by wallet provider.</span></div>
        </aside>

        <section className="join-link-panel">
          <div className="join-link-copy">
            <span className="join-link-icon"><Link2 size={21} /></span>
            <div><h3>Share your join link</h3><p>Members can review the plan and authorize recurring payments from this page.</p></div>
          </div>
          <div className="copy-control"><span>recurpay.app/join/ironcore</span><button type="button" className="button button-secondary" onClick={copyJoinLink}>{copied ? "Copied" : "Copy link"}</button></div>
        </section>

        <div className="save-row">
          {notice && <span className="save-notice" role="status">{notice}</span>}
          {!notice && <span className="saved-time">{saved ? "Last saved today at 09:42" : "You have unsaved changes"}</span>}
          <button className="button button-primary" type="submit">Save changes</button>
        </div>
      </form>
    </>
  );
}
