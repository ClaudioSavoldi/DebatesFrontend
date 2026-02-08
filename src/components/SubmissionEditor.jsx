import { useState } from "react";

function SubmissionEditor({ title, initialBody = "", onSaveDraft, onSubmitFinal, disabled = false }) {
  const [body, setBody] = useState(initialBody);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const run = async (fn) => {
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setBusy(false);
    }
  };

  const handleSaveDraft = () =>
    run(async () => {
      await onSaveDraft(body);
      setMessage("Bozza salvata");
    });

  const handleSubmit = () =>
    run(async () => {
      await onSubmitFinal(body);
      setMessage("Consegna inviata");
    });

  return (
    <div className="card">
      <div className="card-header fw-semibold">{title}</div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <textarea
          className="form-control mb-3"
          rows={7}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={disabled || busy}
          placeholder="Scrivi qui..."
        />

        <div className="d-flex gap-2">
          <button type="button" className="btn btn-outline-primary" onClick={handleSaveDraft} disabled={disabled || busy}>
            {busy ? "..." : "Salva bozza"}
          </button>

          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={disabled || busy || body.trim().length === 0}>
            {busy ? "..." : "Consegna"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SubmissionEditor;
