export default function ConnectedWallet({ url }) {
  return (
    <section className="connected-wallet">
      <span className="connected-wallet__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <rect
            x="3"
            y="6"
            width="18"
            height="13"
            rx="2"
            stroke="white"
            strokeWidth="1.6"
          />
          <path d="M3 10h18" stroke="white" strokeWidth="1.6" />
          <circle cx="17" cy="14.5" r="1.1" fill="white" />
        </svg>
      </span>

      <div className="connected-wallet__body">
        <p className="connected-wallet__eyebrow">Connected wallet</p>
        <p className="connected-wallet__url">{url}</p>
        <p className="connected-wallet__note">
          Authorization limits are managed securely by your wallet provider.
        </p>
      </div>

      <span className="connected-wallet__badge">
        <svg
          viewBox="0 0 24 24"
          width="12"
          height="12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Connected
      </span>
    </section>
  );
}
