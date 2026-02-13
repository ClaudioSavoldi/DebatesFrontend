import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMatchResultsApi } from "../api/matchesApi";
import MatchPhaseBadge from "../components/MatchPhaseBadge";

function MatchResults() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [q, setQ] = useState("");
  const [onlyWithVotes, setOnlyWithVotes] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await getMatchResultsApi();
        if (!alive) return;
        setItems(Array.isArray(data) ? data : []);
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

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    let arr = Array.isArray(items) ? [...items] : [];

    // ordina per più recente
    arr.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });

    // filtro voti
    if (onlyWithVotes) {
      arr = arr.filter((m) => (m.totalVotes ?? 0) > 0);
    }

    // search su titolo + vincitore + draw
    if (query) {
      arr = arr.filter((m) => {
        const title = String(m.debateTitle ?? "").toLowerCase();
        const winner = String(m.winnerUsername ?? "").toLowerCase();
        const draw = m.isDraw ? "pareggio" : "";
        return title.includes(query) || winner.includes(query) || draw.includes(query);
      });
    }

    return arr;
  }, [items, q, onlyWithVotes]);

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4 dp-results" style={{ maxWidth: 1000 }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
        <div className="min-w-0">
          <div className="dp-eyebrow">ARCHIVIO</div>
          <h1 className="dp-title mb-1">Risultati</h1>
          <div className="dp-muted">Match conclusi da leggere (opening + rebuttal). Clicca un risultato per aprire la pagina pubblica.</div>
        </div>

        <Link to="/" className="btn btn-sm btn-outline-secondary">
          ← Home
        </Link>
      </div>

      {/* Toolbar */}
      <div className="card dp-card mb-3">
        <div className="card-body dp-results-toolbar">
          <div className="dp-results-search">
            <label className="dp-muted small mb-1">Cerca</label>
            <input className="form-control" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Titolo dibattito, vincitore, “pareggio”…" />
          </div>

          <div className="dp-results-filters">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="onlyWithVotes"
                checked={onlyWithVotes}
                onChange={(e) => setOnlyWithVotes(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="onlyWithVotes">
                Solo match con voti
              </label>
            </div>

            <div className="dp-muted small dp-results-count">{filtered.length} risultati</div>
          </div>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="alert alert-secondary mb-0">Nessun risultato trovato.</div>
      ) : (
        <div className="list-group dp-list">
          {filtered.map((m) => {
            const id = m.id ?? m.matchId;
            const created = m.createdAt ? new Date(m.createdAt).toLocaleString() : "";
            const title = m.debateTitle ?? "Dibattito";
            const votes = m.totalVotes ?? 0;
            const pro = m.proCount ?? 0;
            const contro = m.controCount ?? 0;
            const winner = m.isDraw ? "Pareggio" : (m.winnerUsername ?? "—");

            return (
              <Link key={id} to={`/public/matches/${id}`} className="list-group-item list-group-item-action dp-list-item dp-hoverlift">
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div className="min-w-0">
                    <div className="fw-semibold text-truncate">{title}</div>

                    <div className="dp-muted small">
                      Esito: <span className="text-dark fw-semibold">{winner}</span> · Voti: {votes} (Pro {pro} / Contro {contro})
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    <MatchPhaseBadge phase={m.phase ?? 4} />
                    <span className="dp-muted small" style={{ whiteSpace: "nowrap" }}>
                      {created}
                    </span>
                  </div>
                </div>

                <div className="mt-2">
                  <span className="dp-link">Apri e leggi →</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MatchResults;
