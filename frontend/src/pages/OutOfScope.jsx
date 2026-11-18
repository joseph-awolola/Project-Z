import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import "./styles/JoinCallbackScope.css";
import RECURPAYLOGO from "../assets/RecurPay-Logo.svg";

export default function OutOfScope() {
  return (
    <div className="out-of-scope">
      <Link to="/join/ironcore" className="brand">
        <span className="brand__mark">
          <img src={RECURPAYLOGO} alt="RecurPay Logo" />
        </span>
        <span className="brand__name">RecurPay</span>
      </Link>
      <p className="out-of-scope__text">
        This screen isn't part of this build.
      </p>
      <Link to="/join/ironcore" className="btn btn--primary">
        Go to the join page
      </Link>
    </div>
  );
}
