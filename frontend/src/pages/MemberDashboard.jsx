import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/member/Header.jsx";
import PageIntro from "../components/member/PageIntro.jsx";
import SuccessAlert from "../components/member/SuccessAlert.jsx";
import SubscriptionCard from "../components/member/SubscriptionCard.jsx";
import PaymentHistory from "../components/member/PaymentHistory.jsx";
import ConnectedWallet from "../components/member/ConnectedWallet.jsx";
import CancelModal from "../components/member/CancelModal.jsx";
import { cancelSubscription, getMe, getMySubscriptions } from "../api.js";
import "./styles/member.css";

const formatDate = (value) => value
  ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value))
  : "—";

export default function MemberDashboard() {
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/?returnTo=%2Fmember", { replace: true });
      return;
    }
    async function loadDashboard() {
      try {
        const me = await getMe(token);
        if (me.user.role !== "MEMBER") {
          navigate(me.user.role === "OWNER" ? "/owner" : "/", { replace: true });
          return;
        }
        setUser(me.user);
        const result = await getMySubscriptions(token);
        setSubscriptions(result.subscriptions);
      } catch (requestError) {
        if (/token|authentication/i.test(requestError.message)) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/?returnTo=%2Fmember", { replace: true });
        } else setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [navigate, token]);

  const selected = subscriptions.find((item) => item.status === "ACTIVE") || subscriptions[0];
  const viewSubscription = selected ? {
    id: selected.id,
    businessName: selected.business.name,
    businessInitials: selected.business.name.slice(0, 2).toUpperCase(),
    planLabel: "Monthly membership",
    monthlyAmount: selected.feeMinor / 100,
    nextCharge: formatDate(selected.nextChargeAt),
  } : null;
  const paymentHistory = useMemo(() => subscriptions.flatMap((item) =>
    item.payments.map((payment) => ({
      id: payment.id,
      business: item.business.name,
      date: new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(payment.createdAt)),
      status: payment.status.toLowerCase(),
      processingFee: null,
      amount: payment.amountMinor / 100,
    })),
  ), [subscriptions]);

  if (loading) return <div>Checking your account...</div>;

  async function handleConfirmCancel() {
    if (!selected) return;
    try {
      await cancelSubscription(token, selected.id);
      setSubscriptions((current) => current.map((item) =>
        item.id === selected.id ? { ...item, status: "CANCELLED" } : item,
      ));
      setIsModalOpen(false);
    } catch (requestError) {
      setError(requestError.message);
      setIsModalOpen(false);
    }
  }

  const initials = user?.name?.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "?";
  return (
    <div className="app">
      <Header memberInitials={initials} />
      <main className="app__content">
        <PageIntro name={user?.name || "Member"} />
        {error && <div className="success-alert" role="alert">{error}</div>}
        {selected?.status === "CANCELLED" && <SuccessAlert message="Your subscription has been cancelled. No future charges will be made." />}
        {viewSubscription ? (
          <SubscriptionCard
            subscription={viewSubscription}
            status={selected.status.toLowerCase()}
            onCancelClick={() => setIsModalOpen(true)}
          />
        ) : (
          <section className="subscription-card">
            <h2 className="subscription-card__heading">Your subscriptions</h2>
            <p className="subscription-card__subheading">No subscriptions yet. Browse a business join link to get started.</p>
          </section>
        )}
        <PaymentHistory payments={paymentHistory} />
        {user?.walletUrl && <ConnectedWallet url={user.walletUrl} />}
        {isModalOpen && viewSubscription && (
          <CancelModal
            businessName={viewSubscription.businessName}
            onKeep={() => setIsModalOpen(false)}
            onConfirm={handleConfirmCancel}
          />
        )}
      </main>
    </div>
  );
}
