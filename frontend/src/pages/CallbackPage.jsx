import { Link, useSearchParams } from "react-router-dom";
import {
  Check,
  TriangleAlert,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import "./styles/JoinCallbackScope.css";
import RECURPAYLOGO from "../assets/RecurPay-Logo.svg";

export default function CallbackPage() {
  const [searchParams] = useSearchParams();
  const isError = searchParams.get("status") === "error";
  const reason = searchParams.get("reason");

  return (
    <div className="callback-page">
      <Link to="/" className="brand callback-page__brand">
        <span className="brand__mark">
          <img src={RECURPAYLOGO} alt="RecurPay Logo" />
        </span>
        <span className="brand__name">RecurPay</span>
      </Link>

      <div className="callback-card">
        {isError ? <ErrorState reason={reason} /> : <SuccessState />}
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
        Your wallet authorization was received. The subscription and its first
        payment are being processed; you can review the latest status in your dashboard.
      </p>

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

function ErrorState({ reason }) {
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
        <span>{reason === "grant_failed"
          ? "The wallet authorization could not be completed. Check your wallet and try again."
          : "The wallet connection was declined or timed out. Check your wallet and try again."}</span>
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
