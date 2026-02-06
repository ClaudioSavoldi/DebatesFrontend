import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api/authApi";
import { setToken } from "../auth/tokenStorage";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await loginApi(form);
      setToken(result.token);

      console.log("Token salvato");
      console.log("LOGIN RESPONSE:", result);

      navigate("/");
      window.location.reload(); // temporaneo finché non mettiamo stato globale
    } catch (err) {
      console.error("LOGIN ERROR:", err.message);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="mb-4 text-center">Login</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} required />
        </div>

        <button className="btn btn-primary w-100" type="submit">
          Accedi
        </button>
      </form>
    </div>
  );
}

export default Login;
