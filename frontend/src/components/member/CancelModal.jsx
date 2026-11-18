import { useEffect, useRef } from "react";

export default function CancelModal({ businessName, onKeep, onConfirm }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    dialogRef.current?.focus();
    function handleKeyDown(event) {
      if (event.key === "Escape") onKeep();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onKeep]);

  return (
    <div className="cancel-modal__overlay" onMouseDown={onKeep}>
      <div
        className="cancel-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-modal-title"
        ref={dialogRef}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="cancel-modal__header">
          <h2 id="cancel-modal-title">Cancel subscription?</h2>
          <button
            className="cancel-modal__close"
            onClick={onKeep}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <p className="cancel-modal__description">
          RecurPay will stop scheduling future charges to {businessName}.
          Canceling here does not revoke the authorization at your wallet provider.
        </p>

        <div className="cancel-modal__warning">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 9v4m0 4h.01M10.3 3.9 2.6 17.2a1.5 1.5 0 0 0 1.3 2.3h16.2a1.5 1.5 0 0 0 1.3-2.3L13.7 3.9a1.5 1.5 0 0 0-2.6 0Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>To fully revoke wallet authorization, also manage it with your wallet provider.</span>
        </div>

        <div className="cancel-modal__actions">
          <button
            className="cancel-modal__button cancel-modal__button--keep"
            onClick={onKeep}
          >
            Keep subscription
          </button>
          <button
            className="cancel-modal__button cancel-modal__button--confirm"
            onClick={onConfirm}
          >
            Yes, cancel subscription
          </button>
        </div>
      </div>
    </div>
  );
}
