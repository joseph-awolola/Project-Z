import { Link } from "react-router-dom";

export default function PageIntro({ name }) {
  return (
    <div className="page-intro">
      <div>
        <p className="page-intro__eyebrow">Member dashboard</p>
        <h1 className="page-intro__title">
          Good morning, {name.split(" ")[0]}
        </h1>
        <p className="page-intro__subtitle">
          Manage subscriptions and keep track of every payment.
        </p>
      </div>
      <Link className="page-intro__action" to="/businesses">
        Browse join page
      </Link>
    </div>
  );
}
