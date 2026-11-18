import { useEffect, useRef } from "react";
import { X, ShieldCheck, ArrowRight } from "lucide-react";

export default function ApprovalModal({
  amount,
  businessName,
  onClose,
  onContinue,
  submitting,
  error,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape" && !submitting) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, submitting]);

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={() => { if (!submitting) onClose(); }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="approval-modal-title"
        aria-busy={submitting}
        tabIndex={-1}
        ref={dialogRef}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal__close" aria-label="Close" onClick={onClose} disabled={submitting}>
          <X size={16} />
        </button>

        <p className="eyebrow eyebrow--teal">Payment authorization</p>
        <h2 id="approval-modal-title" className="modal__title">
          Authorize this subscription
        </h2>
        <p className="modal__body">
          You're about to let {businessName} charge your connected wallet up to{" "}
          <strong>€{amount.toFixed(2)}</strong> each month.
        </p>

        <ul className="modal__list">
          <li>
            <span className="modal__list-label">Requested maximum</span>
            <span className="modal__list-value">
              €{amount.toFixed(2)}/month
            </span>
          </li>
          <li>
            <span className="modal__list-label">Authorization</span>
            <span className="modal__list-value">Revocable anytime</span>
          </li>
        </ul>

        <p className="reassurance modal__reassurance">
          <ShieldCheck size={16} />
          You'll approve this securely in your own wallet. RecurPay never sees
          your wallet credentials.
        </p>

        {submitting && <p role="status">Connecting to your wallet…</p>}
        {error && <p className="modal__error" role="alert">{error}</p>}

        <div className="modal__actions">
          <button className="btn btn--ghost" onClick={onClose} disabled={submitting}>
            Not now
          </button>
          <button className="btn btn--primary" onClick={onContinue} disabled={submitting}>
            {submitting ? "Connecting…" : "Continue to wallet"}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
