import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyMatchesApi } from "../api/matchesApi";
import MatchPhaseBadge from "../components/MatchPhaseBadge";

function Dashboard() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getMyMatchesApi()
      .then((data) => setMatches(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="container mt-4">Loading...</div>;
  }

  if (error) {
    return <div className="container mt-4 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-3">I miei match</h2>

      {matches.length === 0 ? (
        <div className="alert alert-secondary">Non stai partecipando a nessun match.</div>
      ) : (
        <div className="list-group">
          {matches.map((m) => (
            <Link key={m.matchId ?? m.id} to={`/matches/${m.matchId ?? m.id}`} className="list-group-item list-group-item-action">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold">Dibattito: {m.debateTitle ?? m.debateId}</div>
                  <div className="text-muted">Creato: {new Date(m.createdAt).toLocaleString()}</div>
                </div>

                <MatchPhaseBadge phase={m.phase} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
