import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicMatchesApi } from "../api/publicMatchesApi";
import { phaseLabel } from "../utils/matchPhase";

function PublicMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    getPublicMatchesApi()
      .then((data) => {
        setMatches(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Match pubblici (votabili)</h2>

      {matches.length === 0 ? (
        <p>Nessun match votabile al momento.</p>
      ) : (
        <div className="list-group">
          {matches.map((m) => (
            <Link key={m.matchId} to={`/public/matches/${m.matchId}`} className="list-group-item list-group-item-action">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold">{m.debateTitle}</div>
                  <div className="text-muted">
                    Fase: {phaseLabel(m.phase)} · Voti: {m.totalVotes} (Pro {m.proCount} / Contro {m.controCount})
                  </div>
                </div>
                <small className="text-muted">{m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}</small>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default PublicMatches;
