export default function StatCard({ label, value, note, icon: Icon }) {
  return (
    <article className="stat-card">
      <span className="stat-icon"><Icon size={20} strokeWidth={1.8} /></span>
      <div className="stat-copy">
        <p className="stat-label">{label}</p>
        <strong className="stat-value">{value}</strong>
        <p className="stat-note">{note}</p>
      </div>
    </article>
  );
}
