import { useEffect, useState } from "react";
import { getDebatesForModerationApi, changeDebateStatusApi } from "../api/debatesModerationApi";

// Enum BACKEND — NON TOCCARE
const DEBATE_STATUS = {
  Open: 1,
  InReview: 2,
  Approved: 3,
  Rejected: 4,
  Closed: 5,
};

function statusLabel(status) {
  switch (status) {
    case 1:
      return "Open";
    case 2:
      return "In Review";
    case 3:
      return "Approved";
    case 4:
      return "Rejected";
    case 5:
      return "Closed";
    default:
      return String(status);
  }
}

function Mod() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [actionError, setActionError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getDebatesForModerationApi();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAction = async (debateId, newStatus) => {
    setActionError(null);
    setActionMessage(null);
    setBusyId(debateId);

    try {
      await changeDebateStatusApi(debateId, newStatus);
      setActionMessage("Operazione completata");
      await load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Moderazione Dibattiti</h2>

      {actionError && <div className="alert alert-danger">{actionError}</div>}
      {actionMessage && <div className="alert alert-success">{actionMessage}</div>}

      {items.length === 0 ? (
        <div className="alert alert-secondary">Nessun dibattito da moderare.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>Titolo</th>
                <th>Status</th>
                <th>Creato</th>
                <th>Creato da</th>
                <th style={{ width: 320 }}>Azioni</th>
              </tr>
            </thead>

            <tbody>
              {items.map((d) => (
                <tr key={d.id}>
                  <td className="fw-semibold">{d.title}</td>
                  <td>{statusLabel(d.status)}</td>
                  <td>{new Date(d.createdAt).toLocaleString()}</td>
                  <td className="text-muted">{d.createdByUserId}</td>

                  <td>
                    <div className="d-flex gap-2">
                      {/* Open -> InReview */}
                      {d.status === DEBATE_STATUS.Open && (
                        <button className="btn btn-warning btn-sm" disabled={busyId === d.id} onClick={() => handleAction(d.id, DEBATE_STATUS.InReview)}>
                          {busyId === d.id ? "..." : "Prendi in carico"}
                        </button>
                      )}

                      {/* InReview -> Approved/Rejected */}
                      {d.status === DEBATE_STATUS.InReview && (
                        <>
                          <button className="btn btn-success btn-sm" disabled={busyId === d.id} onClick={() => handleAction(d.id, DEBATE_STATUS.Approved)}>
                            {busyId === d.id ? "..." : "Approva"}
                          </button>

                          <button className="btn btn-danger btn-sm" disabled={busyId === d.id} onClick={() => handleAction(d.id, DEBATE_STATUS.Rejected)}>
                            {busyId === d.id ? "..." : "Rifiuta"}
                          </button>
                        </>
                      )}

                      {/* Altri stati: nessuna azione */}
                      {d.status !== DEBATE_STATUS.Open && d.status !== DEBATE_STATUS.InReview && <span className="text-muted">—</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button className="btn btn-outline-secondary mt-3" onClick={load}>
        Ricarica
      </button>
    </div>
  );
}

export default Mod;
