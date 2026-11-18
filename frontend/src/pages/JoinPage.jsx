import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ApprovalModal from "../components/ApprovalModal.jsx";
import {
  RefreshCw,
  ShieldCheck,
  Wallet,
  CircleCheck,
  ArrowRight,
} from "lucide-react";
import "./styles/JoinCallbackScope.css";
import RECURPAYLOGO from "../assets/RecurPay-Logo.svg";

const business = {
  initials: "IG",
  name: "Ironcore Gym",
  description:
    "A welcoming community gym focused on strength, wellbeing, and consistent progress.",
  monthlyAmount: 35,
};

const features = [
  "Charged automatically each month",
  "One capped payment authorization",
  "Cancel anytime from your dashboard",
  "No card details shared",
];

export default function JoinPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  function handleContinueToWallet() {
    // Simulates the external wallet approval, this is where we would implement backend api call
    setModalOpen(false);
    navigate("/callback?status=success");
  }

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
          <div className="business-avatar" aria-hidden="true">
            {business.initials}
          </div>
          <p className="eyebrow eyebrow--teal">You're invited to join</p>
          <h1 className="join-page__title">{business.name}</h1>
          <p className="join-page__description">{business.description}</p>

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
            <span className="pricing-card__amount">
              €{Math.trunc(business.monthlyAmount)}
              <span className="pricing-card__cents">.00</span>
            </span>
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
            onClick={() => setModalOpen(true)}
          >
            Subscribe for €{business.monthlyAmount}/month
            <ArrowRight size={16} />
          </button>

          <p className="reassurance pricing-card__powered">
            <ShieldCheck size={16} />
            Powered by Interledger Open Payments
          </p>
        </section>
      </main>

      <footer className="join-page__footer">
        <p>RecurPay makes recurring payments simple and transparent.</p>
      </footer>

      {modalOpen && (
        <ApprovalModal
          amount={business.monthlyAmount}
          businessName={business.name}
          onClose={() => setModalOpen(false)}
          onContinue={handleContinueToWallet}
        />
      )}
    </div>
  );
}
