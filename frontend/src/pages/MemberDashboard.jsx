import { useState } from "react";
import Header from "../components/member/Header.jsx";
import PageIntro from "../components/member/PageIntro.jsx";
import SuccessAlert from "../components/member/SuccessAlert.jsx";
import SubscriptionCard from "../components/member/SubscriptionCard.jsx";
import PaymentHistory from "../components/member/PaymentHistory.jsx";
import ConnectedWallet from "../components/member/ConnectedWallet.jsx";
import CancelModal from "../components/member/CancelModal.jsx";
import {
  member,
  subscription,
  paymentHistory,
  connectedWallet,
} from "../data/member.js";
import "./styles/member.css";

export default function MemberDashboard() {
  const [subscriptionStatus, setSubscriptionStatus] = useState("active");
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleCancelClick() {
    setIsModalOpen(true);
  }

  function handleKeep() {
    setIsModalOpen(false);
  }

  function handleConfirmCancel() {
    setSubscriptionStatus("cancelled");
    setIsModalOpen(false);
  }

  return (
    <div className="app">
      <Header memberInitials={member.initials} />

      <main className="app__content">
        <PageIntro name={member.name} />

        {subscriptionStatus === "cancelled" && (
          <SuccessAlert message="Your subscription has been cancelled. No future charges will be made." />
        )}

        <SubscriptionCard
          subscription={subscription}
          status={subscriptionStatus}
          onCancelClick={handleCancelClick}
        />

        <PaymentHistory payments={paymentHistory} />

        <ConnectedWallet url={connectedWallet.url} />
      </main>

      {isModalOpen && (
        <CancelModal
          businessName={subscription.businessName}
          onKeep={handleKeep}
          onConfirm={handleConfirmCancel}
        />
      )}
    </div>
  );
}
