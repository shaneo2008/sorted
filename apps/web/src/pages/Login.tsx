import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Icon } from "../components";
import { api } from "../lib/api";

export function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const verified = useRef(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token || verified.current) return;
    verified.current = true;
    setLoading(true);
    api<{ jwt: string }>("/auth/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then(({ jwt }) => {
        localStorage.setItem("sorted_jwt", jwt);
        navigate("/", { replace: true });
      })
      .catch((caught: Error) => {
        setError(caught.message);
        setLoading(false);
      });
  }, [navigate, searchParams]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api<{ ok: true }>("/auth/magic-link", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not send login link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-mark">S</div>
      <p className="brand-wordmark">Sorted<span>.</span></p>
      {!sent ? (
        <>
          <h1>Admin, without the accounting.</h1>
          <p>You do the work. We’ll track the money.</p>
          <form onSubmit={submit}>
            <label className="field">
              <span className="field-label">Email address</span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@business.ie"
                autoComplete="email"
              />
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? "Sending…" : "Send me a login link"} <Icon name="arrow" />
            </Button>
          </form>
          <small>No password. We email you a secure link.</small>
          <Link className="demo-link" to="/">Explore the demo instead</Link>
        </>
      ) : (
        <div className="login-sent">
          <span className="success-mark"><Icon name="message" size={28} /></span>
          <h1>Check your email</h1>
          <p>
            Your development login link is in the API console for{" "}
            <strong>{email}</strong>.
          </p>
          <Button onClick={() => setSent(false)} kind="quiet">Use a different email</Button>
          <Link className="demo-link" to="/">Continue to demo</Link>
        </div>
      )}
    </main>
  );
}
