import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import ApprovalModal from "../components/ApprovalModal.jsx";
import {
  ShieldCheck,
  Wallet,
  CircleCheck,
  ArrowRight,
} from "lucide-react";
import "./styles/JoinCallbackScope.css";
import RECURPAYLOGO from "../assets/RecurPay-Logo.svg";
import { getBusiness, subscribe } from "../api.js";

const features = [
  "Charged automatically each month",
  "One capped payment authorization",
  "Cancel anytime from your dashboard",
  "No card details shared",
];

export default function JoinPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [business, setBusiness] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { businessId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let active = true;
    getBusiness(businessId).then(({ business: result }) => {
      if (active) setBusiness(result);
    }).catch((requestError) => {
      if (active) setError(requestError.message);
    });
    return () => { active = false; };
  }, [businessId]);

  async function handleContinueToWallet() {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate(`/?returnTo=${encodeURIComponent(location.pathname)}`);
      return;
    }
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 45_000);
    try {
      setSubmitting(true);
      setError("");
      const { redirectUrl } = await subscribe(token, business.id, { signal: controller.signal });
      const walletUrl = new URL(redirectUrl);
      if (!["http:", "https:"].includes(walletUrl.protocol)) {
        throw new Error("The wallet returned an invalid approval link.");
      }
      window.location.assign(walletUrl.href);
    } catch (requestError) {
      setError(requestError.name === "AbortError"
        ? "The wallet did not respond in time. Check your connection and try again."
        : requestError.message);
    } finally {
      window.clearTimeout(timeoutId);
      setSubmitting(false);
    }
  }

  const monthlyAmount = business ? business.feeMinor / 100 : 0;
  const businessName = business?.name || "Business";
  return (
    <div className="join-page">
      <header className="join-page__nav">
        <Link to="/" className="brand">
          <span className="brand__mark">
            <img src={RECURPAYLOGO} alt="RecurPay Logo" />
          </span>
          <span className="brand__name">RecurPay</span>
        </Link>
        <Link to="/" className="join-page__signin">
          Sign in
        </Link>
      </header>

      <main className="join-page__main">
        <section className="join-page__intro">
          <div className="business-avatar" aria-hidden="true">{businessName.slice(0, 2).toUpperCase()}</div>
          <p className="eyebrow eyebrow--teal">You're invited to join</p>
          <h1 className="join-page__title">{business ? businessName : "Loading business…"}</h1>
          <p className="join-page__description">{business?.owner?.name ? `A recurring membership offered by ${business.owner.name}.` : "Review the monthly plan and authorize payments from your wallet."}</p>

          <div className="join-page__badges">
            <span className="join-page__badge">
              <ShieldCheck size={16} />
              Verified business
            </span>
            <span className="join-page__badge">
              <Wallet size={16} />
              Secure wallet payments
            </span>
          </div>
        </section>

        <section className="pricing-card">
          <p className="eyebrow eyebrow--teal">Monthly membership</p>

          <div className="pricing-card__price">
            <span className="pricing-card__amount">€{monthlyAmount.toFixed(2)}</span>
            <span className="pricing-card__period">per month</span>
          </div>

          <hr className="pricing-card__divider" />

          <ul className="pricing-card__features">
            {features.map((feature) => (
              <li key={feature}>
                <CircleCheck size={18} />
                {feature}
              </li>
            ))}
          </ul>

          <button
            className="btn btn--primary btn--block"
            disabled={!business || submitting}
            onClick={() => setModalOpen(true)}
          >
            Subscribe for €{monthlyAmount.toFixed(2)}/month
            <ArrowRight size={16} />
          </button>

          <p className="reassurance pricing-card__powered">
            <ShieldCheck size={16} />
            Powered by Interledger Open Payments
          </p>
        </section>
        {error && !modalOpen && <p role="alert">{error}</p>}
      </main>

      <footer className="join-page__footer">
        <p>RecurPay makes recurring payments simple and transparent.</p>
      </footer>

      {modalOpen && (
        <ApprovalModal
          amount={monthlyAmount}
          businessName={businessName}
          onClose={() => {
            setModalOpen(false);
            setError("");
          }}
          onContinue={handleContinueToWallet}
          submitting={submitting}
          error={error}
        />
      )}
    </div>
  );
}
