import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { loginApi } from "../api/authApi";
import { setCredentials } from "../store/authSlice";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await loginApi(form);

      // supporto a diverse forme di risposta
      const token = result?.token || result?.accessToken || result?.jwt;

      if (!token) {
        throw new Error("Login OK ma token non trovato nella risposta.");
      }

      // il tuo slice vuole SOLO il token
      dispatch(setCredentials(token));

      // redirect
      navigate("/dashboard");
    } catch (err) {
      const msg = String(err?.message || "");

      // messaggi user-friendly
      if (msg.includes("401")) setError("Email o password non corretti.");
      else if (msg.includes("400")) setError("Dati non validi. Controlla email e password.");
      else setError(msg || "Errore durante il login. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 420 }}>
      <h2 className="mb-3">Login</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading}
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Accesso..." : "Accedi"}
        </button>
      </form>

      <div className="mt-3 text-center">
        <span className="text-muted">Non hai un account?</span> <Link to="/register">Registrati</Link>
      </div>
    </div>
  );
}

export default Login;
