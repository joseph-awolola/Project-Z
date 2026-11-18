import { useState } from "react";
import {
  ArrowRight,
  ArrowLeftRight,
  Building2,
  Users,
  ShieldCheck,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import "./styles/Login.css";
import RECURPAYLOGO from "../assets/RecurPay-Icon.svg";
import { signup, login } from "../api.js";

const benefits = [
  { icon: ShieldCheck, text: "Capped & revocable authorizations" },
  { icon: ArrowLeftRight, text: "Automatic monthly collections" },
  { icon: Check, text: "Built on Interledger Open Payments" },
];

export default function Login() {
  const [mode, setMode] = useState("signup");
  const [role, setRole] = useState("owner");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    walletUrl: "",
  });
  const isSignup = mode === "signup";
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function switchMode(next) {
    setMode(next);
    setNotice("");
    setShowPassword(false);
  }

  async function submit(e) {
    e.preventDefault();

    if (!form.email.trim()) {
      setNotice("Please enter your email address.");
      return;
    }

    if (!form.password) {
      setNotice("Please enter your password.");
      return;
    }

    if (isSignup) {
      if (!form.name.trim()) {
        setNotice("Please enter your full name.");
        return;
      }

      if (form.password.length < 8) {
        setNotice("Password must be at least 8 characters.");
        return;
      }

      if (!form.walletUrl.trim()) {
        setNotice("Please enter your wallet URL.");
        return;
      }
    }

    try {
      setLoading(true);
      setNotice("");

      let result;

      if (isSignup) {
        result = await signup({
          name: form.name,
          email: form.email,
          password: form.password,
          role: role === "owner" ? "OWNER" : "MEMBER",
          walletUrl: form.walletUrl,
        });
      } else {
        result = await login({
          email: form.email,
          password: form.password,
        });
      }

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      setNotice(
        isSignup ? "Account created successfully!" : "Login successful!",
      );
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="brand-panel">
        <a className="brand" href="#" aria-label="RecurPay home">
          <span className="brand-mark">
            <img src={RECURPAYLOGO} alt="RecurPay logo"></img>
          </span>
          <span>RecurPay</span>
        </a>

        <div className="brand-copy">
          <p className="eyebrow">PAYMENTS THAT RUN ON TIME</p>
          <h1>
            Recurring
            <br />
            payments,
            <br />
            made
            <br />
            straightforward.
          </h1>
          <p className="intro">
            Set up predictable collections with one secure, revocable wallet
            authorization.
          </p>
          <ul className="benefits">
            {benefits.map(({ icon: Icon, text }) => (
              <li key={text}>
                <Icon size={19} />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="panel-footer">
          Secure payment automation for everyday businesses.
        </p>
        <div className="decor-ring" aria-hidden="true" />
      </section>

      <section className="form-panel">
        <div className="form-wrap">
          <p className="eyebrow form-eyebrow">
            {isSignup ? "GET STARTED" : "WELCOME BACK"}
          </p>
          <h2>{isSignup ? "Create your account" : "Sign in to RecurPay"}</h2>
          <p className="subtitle">
            {isSignup
              ? "Choose how you’ll use RecurPay."
              : "Continue managing your payments."}
          </p>

          <div className="role-switch" aria-label="Choose account type">
            <button
              type="button"
              className={`role-card ${role === "owner" ? "selected" : ""}`}
              onClick={() => {
                setRole("owner");
                setNotice("");
              }}
            >
              <span className="role-icon">
                <Building2 size={20} />
              </span>
              <span className="role-copy">
                <strong>Business owner</strong>
                <small>
                  Collect recurring
                  <br className="desktop-break" /> payments
                </small>
              </span>
              <span className="radio-dot">{role === "owner" && <i />}</span>
            </button>
            <button
              type="button"
              className={`role-card ${role === "member" ? "selected" : ""}`}
              onClick={() => {
                setRole("member");
                setNotice("");
              }}
            >
              <span className="role-icon">
                <Users size={20} />
              </span>
              <span className="role-copy">
                <strong>Member</strong>
                <small>
                  Join and manage
                  <br className="desktop-break" /> subscriptions
                </small>
              </span>
              <span className="radio-dot">{role === "member" && <i />}</span>
            </button>
          </div>

          <form onSubmit={submit} noValidate>
            {isSignup && (
              <label className="field">
                <span>Full name</span>
                <div className="input-wrap">
                  <UserRound size={17} />
                  <input
                    name="name"
                    value={form.name}
                    onChange={update}
                    placeholder="e.g. Jordan Kimani"
                    autoComplete="name"
                  />
                </div>
              </label>
            )}
            <label className="field">
              <span>Email address</span>
              <div className="input-wrap">
                <Mail size={17} />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={update}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </label>
            <label className="field">
              <span>Password</span>
              <div className="input-wrap">
                <LockKeyhole size={17} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={update}
                  placeholder="At least 8 characters"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            {isSignup && (
              <label className="field">
                <span>Interledger Wallet URL</span>

                <div className="input-wrap">
                  <input
                    type="text"
                    name="walletUrl"
                    value={form.walletUrl}
                    onChange={update}
                    placeholder="https://ilp.interledger-test.dev/..."
                  />
                </div>
              </label>
            )}

            {notice && (
              <div
                className={`notice ${notice.startsWith("Please") || notice.startsWith("Enter") || notice.startsWith("Your password") ? "error" : "success"}`}
                role="status"
              >
                {notice}
              </div>
            )}
            <button className="submit-btn" type="submit" disabled={loading}>
              {loading
                ? isSignup
                  ? "Creating account..."
                  : "Signing in..."
                : isSignup
                  ? `Create ${role === "owner" ? "owner" : "member"} account`
                  : "Sign in"}

              <ArrowRight size={18} />
            </button>
          </form>

          <p className="switch-auth">
            {isSignup ? "Already have an account?" : "New to RecurPay?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(isSignup ? "signin" : "signup")}
            >
              {isSignup ? "Sign in" : "Create an account"}
            </button>
          </p>
          <p className="legal">
            By continuing, you agree to our <a href="#terms">Terms</a> and{" "}
            <a href="#privacy">Privacy Policy</a>.
          </p>
        </div>
      </section>
    </main>
  );
}
