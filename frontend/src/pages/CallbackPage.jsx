import { Link, useSearchParams } from "react-router-dom";
import {
  RefreshCw,
  Check,
  TriangleAlert,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import "./styles/JoinCallbackScope.css";
import RECURPAYLOGO from "../assets/RecurPay-Logo.svg";

const subscription = {
  business: "Ironcore Gym",
  monthlyAmount: 35,
};

export default function CallbackPage() {
  const [searchParams] = useSearchParams();
  const isError = searchParams.get("status") === "error";

  return (
    <div className="callback-page">
      <Link to="/" className="brand callback-page__brand">
        <span className="brand__mark">
          <img src={RECURPAYLOGO} alt="RecurPay Logo" />
        </span>
        <span className="brand__name">RecurPay</span>
      </Link>

      <div className="callback-card">
        {isError ? <ErrorState /> : <SuccessState />}
      </div>
    </div>
  );
}

function SuccessState() {
  return (
    <>
      <div className="callback-card__icon callback-card__icon--success">
        <Check size={30} strokeWidth={2.6} />
      </div>
      <p className="eyebrow eyebrow--teal callback-card__eyebrow">
        Authorization approved
      </p>
      <h1 className="callback-card__title">Subscription active</h1>
      <p className="callback-card__body">
        Your {subscription.business} membership is ready. Future payments will
        happen automatically within your approved limit.
      </p>

      <dl className="callback-card__grid">
        <div>
          <dt>Business</dt>
          <dd>{subscription.business}</dd>
        </div>
        <div>
          <dt>Monthly amount</dt>
          <dd>€{subscription.monthlyAmount.toFixed(2)}</dd>
        </div>
        <div>
          <dt>First payment</dt>
          <dd>Today</dd>
        </div>
        <div>
          <dt>Authorization</dt>
          <dd>
            <span className="status-pill status-pill--active">
              <span className="status-pill__dot" />
              Active
            </span>
          </dd>
        </div>
      </dl>

      <Link to="/member" className="btn btn--primary btn--block">
        Go to my dashboard
        <ArrowRight size={16} />
      </Link>

      <p className="reassurance callback-card__reassurance">
        <ShieldCheck size={16} />
        You can revoke this authorization at any time.
      </p>
    </>
  );
}

function ErrorState() {
  return (
    <>
      <div className="callback-card__icon callback-card__icon--error">
        <TriangleAlert size={30} strokeWidth={2} />
      </div>
      <p className="eyebrow eyebrow--red callback-card__eyebrow">
        Authorization not completed
      </p>
      <h1 className="callback-card__title">Something went wrong</h1>
      <p className="callback-card__body">
        Your wallet didn't approve the recurring payment. You haven't been
        charged.
      </p>

      <div className="callback-alert">
        <TriangleAlert size={18} />
        <span>
          The wallet connection was declined or timed out. Check your wallet and
          try again.
        </span>
      </div>

      <div className="callback-card__actions">
        <Link to="/join/ironcore" className="btn btn--primary">
          Try again
        </Link>
        <Link to="/" className="btn btn--ghost">
          Back to sign in
        </Link>
      </div>
    </>
  );
}
