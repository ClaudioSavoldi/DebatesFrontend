import { useState } from "react";
import { Link } from "react-router-dom";
import AuthCard from "../components/AuthCard";

function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("REGISTER form data:", form);
  };

  return (
    <AuthCard title="Registrazione">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label" htmlFor="username">
            Username
          </label>
          <input className="form-control" id="username" name="username" value={form.username} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input className="form-control" id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input className="form-control" id="password" name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="confirmPassword">
            Conferma password
          </label>
          <input
            className="form-control"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>

        <button className="btn btn-primary w-100" type="submit">
          Registrati
        </button>

        <p className="text-muted mt-3 mb-0">
          Hai già un account? <Link to="/login">Accedi</Link>
        </p>
      </form>
    </AuthCard>
  );
}

export default Register;
