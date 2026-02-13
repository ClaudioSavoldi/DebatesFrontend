import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicMatchesApi } from "../api/publicMatchesApi";
import MatchPhaseBadge from "../components/MatchPhaseBadge";

function PublicMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI controls
  const [query, setQuery] = useState("");
  const [onlyVoting, setOnlyVoting] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await getPublicMatchesApi();
        if (!alive) return;
        setMatches(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!alive) return;
        setError(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const view = useMemo(() => {
    const q = query.trim().toLowerCase();

    let arr = Array.isArray(matches) ? [...matches] : [];

    // Filter
    if (onlyVoting) {
      arr = arr.filter((m) => (m.phase ?? 0) === 3);
    }

    if (q) {
      arr = arr.filter((m) => {
        const title = String(m.debateTitle ?? "").toLowerCase();
        return title.includes(q);
      });
    }

    // Sort: Voting first
    arr.sort((a, b) => {
      const pa = a.phase ?? 0;
      const pb = b.phase ?? 0;

      const aIsVoting = pa === 3;
      const bIsVoting = pb === 3;
      if (aIsVoting !== bIsVoting) return aIsVoting ? -1 : 1;

      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });

    return arr;
  }, [matches, onlyVoting, query]);

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4" style={{ maxWidth: 1120 }}>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
        <div className="min-w-0">
          <div className="dp-eyebrow">MATCH PUBBLICI</div>
          <h1 className="dp-title mb-2">Leggi e vota</h1>
          <div className="dp-muted">
            Qui puoi leggere opening/rebuttal e votare durante la fase <span className="fw-semibold">Voting</span>.
          </div>
        </div>

        <div className="d-flex gap-2">
          <Link to="/results" className="btn btn-outline-secondary btn-sm">
            Risultati
          </Link>
        </div>
      </div>

      {/* Controls */}
      <div className="card dp-card mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-7">
              <input
                className="form-control"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cerca per titolo del dibattito…"
                aria-label="Cerca match"
              />
            </div>

            <div className="col-12 col-md-5">
              <div className="d-flex gap-2 justify-content-md-end">
                <button type="button" className={`btn btn-sm ${onlyVoting ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setOnlyVoting(true)}>
                  Solo Voting
                </button>
                <button type="button" className={`btn btn-sm ${!onlyVoting ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setOnlyVoting(false)}>
                  Tutti
                </button>
              </div>
            </div>
          </div>

          <div className="dp-muted small mt-2">
            Trovati: <span className="fw-semibold text-dark">{view.length}</span>
          </div>
        </div>
      </div>

      {/* List */}
      {view.length === 0 ? (
        <div className="alert alert-secondary mb-0">Nessun match disponibile con questi filtri.</div>
      ) : (
        <div className="list-group dp-list">
          {view.map((m) => {
            const matchId = m.matchId ?? m.id;
            const title = m.debateTitle ?? "Dibattito";
            const created = m.createdAt ? new Date(m.createdAt).toLocaleString() : "";

            return (
              <Link key={matchId} to={`/public/matches/${matchId}`} className="list-group-item list-group-item-action dp-list-item">
                <div className="d-flex justify-content-between align-items-start gap-3">
                  {/* Left */}
                  <div className="min-w-0">
                    <div className="d-flex align-items-start gap-2 flex-wrap">
                      <div className="fw-semibold text-truncate" style={{ maxWidth: "100%" }}>
                        {title}
                      </div>

                      <div className="flex-shrink-0">
                        <MatchPhaseBadge phase={m.phase} />
                      </div>
                    </div>

                    <div className="dp-muted small mt-1">
                      Voti: <span className="text-dark fw-semibold">{m.totalVotes ?? 0}</span> (Pro {m.proCount ?? 0} / Contro {m.controCount ?? 0})
                    </div>

                    {/* su mobile mostra created sotto */}
                    {created && <div className="dp-muted small mt-1 d-md-none">{created}</div>}

                    <div className="mt-2">
                      <span className="dp-link">Apri →</span>
                    </div>
                  </div>

                  {/* Right (desktop only) */}
                  {created && (
                    <div className="dp-muted small d-none d-md-block" style={{ whiteSpace: "nowrap" }}>
                      {created}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PublicMatches;
