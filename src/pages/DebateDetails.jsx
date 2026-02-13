import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { getDebateByIdApi, joinDebateApi } from "../api/debatesApi";
import { getMyQueueApi } from "../api/debateQueueApi";
import DebateStatusBadge from "../components/DebateStatusBadge";

const JOIN_SIDE = {
  Pro: 1,
  Contro: 2,
};

function DebateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = useSelector((s) => s.auth.token);
  //const user = useSelector((s) => s.auth.user);
  const isAuthenticated = !!token;

  const [debate, setDebate] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [queueLoading, setQueueLoading] = useState(false);
  const [queue, setQueue] = useState([]); // array di queue items

  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [joinMessage, setJoinMessage] = useState(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      // reset messaggi join quando cambi pagina
      setJoinError(null);
      setJoinMessage(null);

      try {
        const debatePromise = getDebateByIdApi(id);

        // se non loggato, non controllare queue
        const queuePromise = isAuthenticated ? getMyQueueApi() : Promise.resolve([]);

        if (isAuthenticated) setQueueLoading(true);

        const [debateData, queueData] = await Promise.all([debatePromise, queuePromise]);
        if (!alive) return;

        setDebate(debateData);

        // normalizza queueData
        const q = Array.isArray(queueData) ? queueData : queueData ? [queueData] : [];
        setQueue(q);
      } catch (e) {
        if (!alive) return;
        setError(e.message);
      } finally {
        if (alive) {
          setLoading(false);
          setQueueLoading(false);
        }
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [id, isAuthenticated]);

  // --- Stato queue  ---
  const queueState = useMemo(() => {
    if (!isAuthenticated) return { kind: "guest" };

    const inThisDebate = queue?.some((q) => String(q.debateId) === String(id));
    if (inThisDebate) return { kind: "in_this" };

    const inOtherDebate = queue?.find((q) => q.debateId && String(q.debateId) !== String(id));
    if (inOtherDebate) return { kind: "in_other", debateId: inOtherDebate.debateId };

    return { kind: "free" };
  }, [queue, id, isAuthenticated]);

  const joinDisabled = useMemo(() => {
    if (!isAuthenticated) return true;
    if (joinLoading) return true;
    if (queueState.kind === "in_this" || queueState.kind === "in_other") return true;
    return false;
  }, [isAuthenticated, joinLoading, queueState.kind]);

  const handleJoin = async (side) => {
    if (!isAuthenticated || joinDisabled) return;

    setJoinError(null);
    setJoinMessage(null);
    setJoinLoading(true);

    try {
      await joinDebateApi(id, side);

      //segno che sei in coda per questo dibattito
      setQueue((prev) => {
        const arr = Array.isArray(prev) ? prev : [];
        // evita duplicati
        if (arr.some((x) => String(x.debateId) === String(id))) return arr;
        return [{ debateId: id }, ...arr];
      });

      setJoinMessage("Iscrizione registrata ✅ Sei in coda. Ti porto in Dashboard...");
      setTimeout(() => navigate("/dashboard"), 700);
    } catch (err) {
      const msg = String(err?.message || "");

      // 409: già in coda / già joinato / già match -> non errore “rosso”
      if (msg.includes("409")) {
        setJoinMessage("Sei già in coda (o hai già un match) per questo dibattito. Vai in Dashboard per vedere lo stato.");
        // segna comunque come in coda
        setQueue((prev) => {
          const arr = Array.isArray(prev) ? prev : [];
          if (arr.some((x) => String(x.debateId) === String(id))) return arr;
          return [{ debateId: id }, ...arr];
        });
      } else if (msg.includes("404")) {
        setJoinError("Dibattito non trovato (o non più disponibile).");
      } else if (msg.includes("401")) {
        setJoinError("Sessione scaduta. Rifai login.");
      } else if (msg.includes("403")) {
        setJoinError("Non hai i permessi per partecipare a questo dibattito.");
      } else {
        setJoinError(err?.message || "Errore durante l’iscrizione.");
      }
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;
  if (!debate) return <div className="container mt-4">Dibattito non trovato.</div>;

  return (
    <div className="container mt-4" style={{ maxWidth: 1000 }}>
      {/* HERO  */}
      <section className="card dp-card dp-hero mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start gap-3">
            <div className="min-w-0">
              <div className="dp-eyebrow">DIBATTITO</div>

              <h1 className="dp-title mb-2 text-truncate">{debate.title}</h1>

              <div className="d-flex flex-wrap align-items-center gap-2">
                <span className="dp-muted small">Stato:</span>
                <DebateStatusBadge status={debate.status} />
                {queueLoading && isAuthenticated && <span className="dp-muted small">· controllo coda...</span>}
              </div>

              {debate.body && (
                <p className="dp-muted mt-3 mb-0" style={{ maxWidth: 80 + "ch" }}>
                  {debate.body}
                </p>
              )}
            </div>

            <Link to="/" className="btn btn-sm btn-outline-secondary flex-shrink-0">
              ← Torna ai dibattiti
            </Link>
          </div>
        </div>
      </section>

      {/* CARD azioni */}
      <div className="card dp-card">
        <div className="card-body">
          {/* Info pulite */}
          <div className="d-flex flex-wrap gap-3 dp-muted small">
            <span>
              Creato: <span className="text-dark">{new Date(debate.createdAt).toLocaleString()}</span>
            </span>
            <span>
              Id: <span className="text-dark">{debate.id}</span>
            </span>
          </div>

          <hr />

          {!isAuthenticated ? (
            <div className="alert alert-secondary mb-0">
              Per partecipare devi fare login.{" "}
              <Link to="/login" className="dp-link">
                Vai al login →
              </Link>
            </div>
          ) : (
            <>
              {/* Messaggi*/}
              {joinError ? (
                <div className="alert alert-danger">{joinError}</div>
              ) : joinMessage ? (
                <div className="alert alert-success">{joinMessage}</div>
              ) : queueState.kind === "in_other" ? (
                <div className="alert alert-warning">
                  Sei già in coda per un altro dibattito. Per evitare conflitti, termina o esci dalla coda da Dashboard.
                  <div className="mt-2">
                    <Link to="/dashboard" className="btn btn-sm btn-outline-secondary">
                      Vai in Dashboard
                    </Link>
                  </div>
                </div>
              ) : queueState.kind === "in_this" ? (
                <div className="alert alert-info mb-0">
                  Sei già in coda per questo dibattito. Vai in Dashboard per vedere lo stato.
                  <div className="mt-2">
                    <Link to="/dashboard" className="btn btn-sm btn-outline-secondary">
                      Vai in Dashboard
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="fw-semibold mb-2">Partecipa</div>
                  <div className="dp-muted small mb-3">Scegli da che parte schierarti. Quando trovi un avversario viene creato un match.</div>

                  <div className="d-flex flex-wrap gap-2">
                    <button type="button" className="btn btn-success" onClick={() => handleJoin(JOIN_SIDE.Pro)} disabled={joinDisabled}>
                      {joinLoading ? "..." : "Partecipa PRO"}
                    </button>

                    <button type="button" className="btn btn-danger" onClick={() => handleJoin(JOIN_SIDE.Contro)} disabled={joinDisabled}>
                      {joinLoading ? "..." : "Partecipa CONTRO"}
                    </button>
                  </div>

                  <div className="dp-muted small mt-3">
                    Suggerimento: dopo l’iscrizione controlla la Dashboard per vedere se sei ancora in coda o se il match è stato creato.
                  </div>
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
