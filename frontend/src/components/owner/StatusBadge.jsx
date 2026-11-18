const statusClass = {
  Active: "status-active",
  Pending: "status-pending",
  "Grace Period": "status-grace",
  Lapsed: "status-lapsed",
  Cancelled: "status-cancelled",
  Success: "status-active",
  Failed: "status-lapsed",
};

export default function StatusBadge({ status }) {
  return <span className={`status-badge ${statusClass[status] || ""}`}>{status}</span>;
}
