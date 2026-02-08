import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getDebateByIdApi, joinDebateApi } from "../api/debatesApi";
import DebateStatusBadge from "../components/DebateStatusBadge";

const JOIN_SIDE = {
  Pro: 1,
  Contro: 2,
};

function DebateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = useSelector((s) => s.auth.token);
  const isAuthenticated = !!token;

  const [debate, setDebate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [joinMessage, setJoinMessage] = useState(null);

  // ✅ se l'utente è già in coda (o join già fatto), blocchiamo i bottoni
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setJoinError(null);
    setJoinMessage(null);
    setAlreadyJoined(false);

    getDebateByIdApi(id)
      .then((data) => setDebate(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const joinDisabled = useMemo(() => joinLoading || alreadyJoined, [joinLoading, alreadyJoined]);

  const handleJoin = async (side) => {
    setJoinError(null);
    setJoinMessage(null);
    setJoinLoading(true);

    try {
      await joinDebateApi(id, side);

      setAlreadyJoined(true);
      setJoinMessage("Iscrizione registrata ✅ Sei in coda. Ti porto in Dashboard...");
      setTimeout(() => navigate("/dashboard"), 600);
    } catch (err) {
      const msg = String(err.message || "");

      // ✅ 409 = già iscritto / già in coda / già hai un match
      if (msg.includes("409")) {
        setAlreadyJoined(true);
        setJoinError("Sei già in coda (o hai già un match) per questo dibattito.");
      } else if (msg.includes("404")) {
        setJoinError("Dibattito non trovato (o non più disponibile).");
      } else if (msg.includes("401")) {
        setJoinError("Sessione scaduta. Rifai login.");
      } else if (msg.includes("403")) {
        setJoinError("Non hai i permessi per partecipare a questo dibattito.");
      } else {
        setJoinError(err.message);
      }
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;
  if (!debate) return <div className="container mt-4">Dibattito non trovato.</div>;

  return (
    <div className="container mt-4" style={{ maxWidth: 900 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">{debate.title}</h2>
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted">Stato:</span>
            <DebateStatusBadge status={debate.status} />
          </div>
        </div>

        <Link to="/" className="btn btn-outline-secondary btn-sm">
          ← Torna ai dibattiti
        </Link>
      </div>

      <div className="card">
        <div className="card-body">
          <div>
            <span className="fw-semibold">Id:</span> {debate.id}
          </div>
          <div>
            <span className="fw-semibold">Creato:</span> {new Date(debate.createdAt).toLocaleString()}
          </div>
          <div>
            <span className="fw-semibold">Creato da:</span> {debate.createdByUserId}
          </div>

          <hr />

          {!isAuthenticated ? (
            <div className="alert alert-secondary mb-0">Per partecipare devi fare login.</div>
          ) : (
            <>
              {joinError && <div className="alert alert-danger">{joinError}</div>}
              {joinMessage && <div className="alert alert-success">{joinMessage}</div>}

              {alreadyJoined ? (
                <div className="alert alert-info mb-0">
                  ✅ Sei già in coda per questo dibattito. Controlla la Dashboard per vedere quando viene creato il match.
                </div>
              ) : (
                <>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-success" onClick={() => handleJoin(JOIN_SIDE.Pro)} disabled={joinDisabled}>
                      {joinLoading ? "..." : "Partecipa PRO"}
                    </button>

                    <button type="button" className="btn btn-danger" onClick={() => handleJoin(JOIN_SIDE.Contro)} disabled={joinDisabled}>
                      {joinLoading ? "..." : "Partecipa CONTRO"}
                    </button>
                  </div>

                  <div className="text-muted mt-2">Scegli da che parte schierarti. Quando trovi un avversario viene creato un match.</div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DebateDetails;
