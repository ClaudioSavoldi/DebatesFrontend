import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  const titleTrimmed = useMemo(() => form.title.trim(), [form.title]);
  const descTrimmed = useMemo(() => form.description.trim(), [form.description]);

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (titleTrimmed.length < 6) return false;
    if (descTrimmed.length < 30) return false;
    return true;
  }, [loading, titleTrimmed, descTrimmed]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const friendlyError = (err) => {
    const msg = String(err?.message || "");
    if (msg.includes("401")) return "Sessione scaduta: fai login e riprova.";
    if (msg.includes("403")) return "Non hai i permessi per creare un dibattito.";
    if (msg.includes("409")) return "Esiste già un dibattito simile o non puoi crearne uno in questo momento.";
    if (msg.includes("400")) return "Dati non validi: controlla titolo e descrizione.";
    return err?.message || "Errore nella creazione del dibattito.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setMessage(null);

    // validazione client-side
    if (titleTrimmed.length < 6) {
      setError("Il titolo deve avere almeno 6 caratteri.");
      return;
    }
    if (descTrimmed.length < 30) {
      setError("La descrizione deve avere almeno 30 caratteri (così è chiaro l’argomento).");
      return;
    }

    setLoading(true);

    try {
      await createDebateApi({
        title: titleTrimmed,
        body: descTrimmed,
      });

      setMessage("Dibattito creato. Ora è in attesa di moderazione.");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container dp-home mt-4">
      {/* HERO */}
      <section className="card dp-card dp-hero mb-4">
        <div className="card-body">
          <div className="dp-eyebrow">CREA DIBATTITO</div>
          <h1 className="dp-title mb-2">Proponi un nuovo topic</h1>
          <p className="dp-muted mb-0" style={{ maxWidth: 820 }}>
            Scrivi un titolo chiaro e una descrizione abbastanza dettagliata: aiuta i partecipanti a capire subito cosa si discute.
          </p>

          <div className="d-flex flex-wrap gap-2 mt-3">
            <Link to="/" className="btn btn-outline-secondary">
              ← Torna ai topic
            </Link>
            {message && (
              <button type="button" className="btn btn-primary" onClick={() => navigate("/")}>
                Vai alla Home
              </button>
            )}
          </div>
        </div>
      </section>

      {/* FORM */}
      <div className="card dp-card" style={{ maxWidth: 820, margin: "0 auto" }}>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Titolo</label>
              <input
                name="title"
                className="form-control"
                value={form.title}
                onChange={handleChange}
                disabled={loading}
                placeholder="Es. Smart working obbligatorio 2–3 giorni a settimana"
              />
              <div className="dp-muted small mt-1">
                Minimo 6 caratteri. Attuale: <span className="text-dark">{titleTrimmed.length}</span>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Descrizione</label>
              <textarea
                name="description"
                className="form-control"
                rows={6}
                value={form.description}
                onChange={handleChange}
                disabled={loading}
                placeholder="Spiega bene il contesto e cosa ci si aspetta venga discusso..."
              />
              <div className="dp-muted small mt-1">
                Minimo 30 caratteri. Attuale: <span className="text-dark">{descTrimmed.length}</span>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <button className="btn btn-primary" type="submit" disabled={!canSubmit}>
                {loading ? "Creazione..." : "Crea"}
              </button>

              <Link to="/" className={`btn btn-outline-secondary ${loading ? "disabled" : ""}`}>
                Annulla
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateDebate;
