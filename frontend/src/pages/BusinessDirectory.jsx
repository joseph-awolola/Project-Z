import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBusinesses } from "../api.js";
import Header from "../components/member/Header.jsx";
import "./styles/member.css";

const money = (minor) => `€${(minor / 100).toFixed(2)}`;

export default function BusinessDirectory() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getBusinesses()
      .then(({ businesses: result }) => {
        if (active) setBusinesses(result);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="app">
      <Header memberInitials="?" />
      <main className="app__content">
        <div className="page-intro">
          <div>
            <p className="page-intro__eyebrow">Memberships</p>
            <h1 className="page-intro__title">Browse businesses</h1>
            <p className="page-intro__subtitle">Choose a business to review its plan and join.</p>
          </div>
          <Link className="page-intro__action" to="/member">Back to dashboard</Link>
        </div>

        {error && <p className="business-directory__error" role="alert">{error}</p>}
        {loading && <p role="status">Loading businesses…</p>}
        {!loading && !error && businesses.length === 0 && (
          <section className="subscription-card">
            <h2 className="subscription-card__heading">No businesses are available yet</h2>
            <p className="subscription-card__subheading">Ask a business owner for their membership link and open it to join.</p>
          </section>
        )}
        {!loading && businesses.length > 0 && (
          <section className="business-directory" aria-label="Available businesses">
            {businesses.map((business) => (
              <article className="business-directory__card" key={business.id}>
                <div>
                  <p className="page-intro__eyebrow">Monthly membership</p>
                  <h2>{business.name}</h2>
                  {business.owner?.name && <p className="page-intro__subtitle">Offered by {business.owner.name}</p>}
                </div>
                <div className="business-directory__action">
                  <strong>{money(business.feeMinor)} <span>/ month</span></strong>
                  <Link className="page-intro__action" to={`/join/${encodeURIComponent(business.id)}`}>View plan</Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
