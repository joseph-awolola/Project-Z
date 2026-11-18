import StatusBadge from "./StatusBadge";
import { formatCurrency } from "../../utils/formatCurrency.js";

export default function SubscriptionCard({
  subscription,
  status,
  onCancelClick,
}) {
  const isCancelled = status === "cancelled";

  return (
    <section className="subscription-card">
      <h2 className="subscription-card__heading">Your subscriptions</h2>
      <p className="subscription-card__subheading">
        Active authorizations connected to your wallet.
      </p>

      <div className="subscription-row">
        <div className="subscription-row__identity">
          <span className="subscription-row__logo">
            {subscription.businessInitials}
          </span>
          <div>
            <p className="subscription-row__name">
              {subscription.businessName}
            </p>
            <p className="subscription-row__plan">{subscription.planLabel}</p>
          </div>
          <StatusBadge
            status={status}
            label={isCancelled ? "Cancelled" : "Active"}
          />
        </div>

        <div className="subscription-row__field">
          <p className="subscription-row__label">Monthly amount</p>
          <p className="subscription-row__value">
            {formatCurrency(subscription.monthlyAmount)}
          </p>
        </div>

        <div className="subscription-row__field">
          <p className="subscription-row__label">Next charge</p>
          <p className="subscription-row__value">
            {isCancelled ? "—" : subscription.nextCharge}
          </p>
        </div>

        {isCancelled ? (
          <button
            className="subscription-row__button subscription-row__button--disabled"
            disabled
          >
            Subscription ended
          </button>
        ) : (
          <button
            className="subscription-row__button subscription-row__button--danger"
            onClick={onCancelClick}
          >
            Cancel subscription
          </button>
        )}
      </div>
    </section>
  );
}
