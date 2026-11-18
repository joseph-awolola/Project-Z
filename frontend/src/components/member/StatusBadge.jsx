const VARIANT_BY_STATUS = {
  active: "success",
  success: "success",
  failed: "danger",
  cancelled: "neutral",
};

export default function StatusBadge({ status, label }) {
  const variant = VARIANT_BY_STATUS[status] ?? "neutral";
  return (
    <span className={`status-badge status-badge--${variant}`}>
      <span className="status-badge__dot" aria-hidden="true" />
      {label}
    </span>
  );
}
