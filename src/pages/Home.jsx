import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDebatesApi } from "../api/debatesApi";
import DebateStatusBadge from "../components/DebateStatusBadge";
import MatchPhaseBadge from "../components/MatchPhaseBadge";

function Home() {
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getDebatesApi()
      .then((data) => setDebates(data))
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Dibattiti pubblici</h2>

        <Link to="/debates/new" className="btn btn-primary">
          Crea dibattito
        </Link>
      </div>

      {debates.length === 0 ? (
        <div className="alert alert-secondary">Nessun dibattito disponibile.</div>
      ) : (
        <div className="list-group">
          {debates.map((d) => (
            <Link key={d.id} to={`/debates/${d.id}`} className="list-group-item list-group-item-action">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold">{d.title}</div>
                  <div className="text-muted">Creato: {new Date(d.createdAt).toLocaleString()}</div>
                </div>

                <DebateStatusBadge status={d.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
