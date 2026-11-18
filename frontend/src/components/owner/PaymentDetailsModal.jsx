import { X } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";

export default function PaymentDetailsModal({ payment, onClose }) {
  if (!payment) return null;
  const successful = payment.status === "Success";

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <section className="payment-modal" role="dialog" aria-modal="true" aria-labelledby="payment-modal-title">
        <div className="modal-heading">
          <div>
            <p className="owner-eyebrow">PAYMENT DETAILS</p>
            <h2 id="payment-modal-title">{payment.member}</h2>
          </div>
          <button className="icon-button modal-close" onClick={onClose} aria-label="Close details"><X size={20} /></button>
        </div>
        <div className="modal-status-row"><span>Status</span><StatusBadge status={payment.status} /></div>
        <div className="detail-list">
          <div><span>Payment date</span><strong>{payment.date}</strong></div>
          <div><span>Membership charge</span><strong>€35.00</strong></div>
          <div><span>Processing fee</span><strong>{successful ? "€3.50" : "€0.00"}</strong></div>
          <div className="detail-total"><span>Net settlement</span><strong>{successful ? "€31.50" : "€0.00"}</strong></div>
        </div>
        <div className="activity-note"><strong>Activity</strong><p>{payment.activity}</p></div>
        <p className="fee-explanation">Processing fees are shown transparently and may vary slightly by wallet provider.</p>
        <button className="button button-primary modal-done" onClick={onClose}>Done</button>
      </section>
    </div>
  );
}
