import StatusBadge from "./StatusBadge";
import { formatCurrency } from "../../utils/formatCurrency.js";

export default function PaymentHistory({ payments }) {
  return (
    <section className="payment-history">
      <div className="payment-history__header">
        <div>
          <h2 className="payment-history__heading">Payment history</h2>
          <p className="payment-history__subheading">
            A clear record of charges from your subscriptions.
          </p>
        </div>

        <label className="payment-history__period">
          <span>Time period</span>
          <select defaultValue="6m">
            <option value="6m">Last 6 months</option>
            <option value="year">This year</option>
          </select>
        </label>
      </div>

      <div className="payment-history__table-wrap">
        <table className="payment-history__table">
          <thead>
            <tr>
              <th>Business</th>
              <th>
                Date{" "}
                <span className="sort-icon" aria-hidden="true">
                  ↕
                </span>
              </th>
              <th>Status</th>
              <th>Processing fee</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="payment-history__business">
                  {payment.business}
                </td>
                <td className="payment-history__muted">{payment.date}</td>
                <td>
                  <StatusBadge
                    status={payment.status}
                    label={payment.status === "success" ? "Success" : "Failed"}
                  />
                </td>
                <td className="payment-history__muted">
                  {payment.processingFee == null ? "—" : formatCurrency(payment.processingFee)}
                </td>
                <td className="payment-history__amount">
                  {formatCurrency(payment.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
