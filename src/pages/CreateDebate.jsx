import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDebateApi } from "../api/debatesApi";

function CreateDebate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await createDebateApi({
        title: form.title,
        body: form.description,
      });
      setMessage("Dibattito creato. In attesa di moderazione.");

      // Dopo 2 second1 home
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 700 }}>
      <h2 className="mb-3">Crea un dibattito</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Titolo</label>
          <input name="title" className="form-control" value={form.title} onChange={handleChange} required disabled={loading} />
        </div>

        <div className="mb-3">
          <label className="form-label">Descrizione</label>
          <textarea name="description" className="form-control" rows={4} value={form.description} onChange={handleChange} required disabled={loading} />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Creazione..." : "Crea"}
        </button>
      </form>
    </div>
  );
}

export default CreateDebate;
