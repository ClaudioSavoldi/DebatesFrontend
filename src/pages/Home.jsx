import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { getDebatesApi } from "../api/debatesApi";
import { getMatchResultsApi } from "../api/matchesApi";
import { getPublicMatchesApi } from "../api/publicMatchesApi";

import DebateStatusBadge from "../components/DebateStatusBadge";

function pickRandom(items, n) {
  const arr = Array.isArray(items) ? [...items] : [];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

function Home() {
  const user = useSelector((s) => s.auth.user);

  const [debates, setDebates] = useState([]);
  const [results, setResults] = useState([]);
  const [votables, setVotables] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [d, r, v] = await Promise.all([getDebatesApi(), getMatchResultsApi(), getPublicMatchesApi()]);
        if (!alive) return;

        setDebates(Array.isArray(d) ? d : []);
        setResults(Array.isArray(r) ? r : []);
        setVotables(Array.isArray(v) ? v : []);
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

  const featuredResults = useMemo(() => pickRandom(results, 4), [results]);
  const topVotables = useMemo(() => (Array.isArray(votables) ? votables.slice(0, 6) : []), [votables]);

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;

  return (
    <div className="container dp-home mt-4">
      <div className="row g-4 align-items-start">
        {/* LEFT SIDEBAR */}
        <aside className="col-12 col-lg-2 dp-sidebar">
          <div className="card dp-card">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="flex-grow-1 min-w-0">
                  <div className="fw-semibold text-truncate">{user ? user.username : "Ospite"}</div>
                  <div className="dp-muted small">{user ? "Accesso effettuato" : "Accedi per partecipare Pro/Contro"}</div>
                </div>
              </div>

              <hr />

              {!user ? (
                <div className="d-grid gap-2">
                  <Link to="/login" className="btn btn-sm btn-primary">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-sm btn-outline-secondary">
                    Crea account
                  </Link>
                </div>
              ) : (
                <div className="d-grid gap-2">
                  <Link to="/dashboard" className="btn btn-sm btn-primary">
                    Vai alla Dashboard
                  </Link>
                </div>
              )}

              <div className="dp-muted small mt-3">Suggerimento: apri un match concluso per leggere opening + rebuttal.</div>
            </div>
          </div>
        </aside>

        {/* CENTER */}
        <main className="col-12 col-lg-8">
          {/* HERO */}
          <section className="dp-hero card dp-card mb-4">
            <div className="card-body">
              <div className="dp-eyebrow">DIBATTITI MODERATI · PRO VS CONTRO · VOTO PUBBLICO</div>
              <h1 className="dp-title mb-2">Discussioni chiare, voti trasparenti.</h1>
              <p className="dp-muted mb-3">Entra in un topic, schierati Pro o Contro, scrivi opening e rebuttal. Poi lascia che sia la community a decidere.</p>

              <div className="d-flex flex-wrap gap-2">
                <Link to="/public/matches" className="btn btn-outline-secondary">
                  Match pubblici
                </Link>
                <Link to="/debates/new" className="btn btn-primary">
                  Crea dibattito
                </Link>
              </div>
            </div>
          </section>

          {/* FEATURED RESULTS */}
          <section className="mb-4">
            <div className="d-flex justify-content-between align-items-end mb-2">
              <div>
                <h3 className="mb-0">In evidenza</h3>
                <div className="dp-muted small">Match conclusi da leggere (opening + rebuttal).</div>
              </div>
              <Link to="/results" className="btn btn-sm btn-outline-secondary">
                Vedi tutti
              </Link>
            </div>

            {featuredResults.length === 0 ? (
              <div className="alert alert-secondary mb-0">Nessun match concluso disponibile.</div>
            ) : (
              <div className="row g-3">
                {featuredResults.map((m) => {
                  const matchId = m.id ?? m.matchId;
                  const winner = m.isDraw ? "Pareggio" : (m.winnerUsername ?? "—");

                  return (
                    <div className="col-12" key={matchId}>
                      <Link to={`/public/matches/${matchId}`} className="text-decoration-none">
                        <div className="card dp-card dp-hoverlift">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start gap-3">
                              <div className="dp-min0">
                                <div className="fw-semibold text-dark dp-ellipsis">{m.debateTitle ?? "Dibattito"}</div>
                                <div className="dp-muted small">
                                  Esito: <span className="text-dark fw-semibold">{winner}</span> · Voti: {m.totalVotes ?? 0}
                                </div>
                              </div>

                              <span className="badge text-bg-dark">Closed</span>
                            </div>

                            <div className="mt-3">
                              <span className="dp-link">Apri e leggi →</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* TOPICS */}
          <section className="mb-5">
            <div className="d-flex justify-content-between align-items-end mb-2">
              <div>
                <h3 className="mb-0">Topic</h3>
                <div className="dp-muted small">Scegli un dibattito e partecipa.</div>
              </div>
              <span className="dp-muted small">{debates.length} topic</span>
            </div>

            {debates.length === 0 ? (
              <div className="alert alert-secondary mb-0">Nessun dibattito disponibile.</div>
            ) : (
              <div className="list-group dp-list">
                {debates.map((d) => (
                  <Link key={d.id} to={`/debates/${d.id}`} className="list-group-item list-group-item-action dp-list-item">
                    <div className="d-flex justify-content-between align-items-center gap-3">
                      <div className="flex-grow-1 min-w-0">
                        <div className="fw-semibold dp-ellipsis">{d.title}</div>
                        <div className="dp-muted small">Creato: {new Date(d.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="col-12 col-lg-2 dp-sidebar">
          <div className="card dp-card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                <div className="fw-semibold text-truncate">Da votare</div>
                <Link to="/public/matches" className="btn btn-sm btn-outline-secondary">
                  Vedi
                </Link>
              </div>

              <div className="dp-muted small mb-2">Match in fase Voting</div>

              {topVotables.length === 0 ? (
                <div className="dp-muted small">Nessun match votabile al momento.</div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {topVotables.map((m) => (
                    <Link key={m.matchId} to={`/public/matches/${m.matchId}`} className="dp-miniitem text-decoration-none">
                      <div className="fw-semibold text-dark dp-ellipsis">{m.debateTitle ?? "Match"}</div>
                      <div className="dp-muted small">
                        Voti: {m.totalVotes ?? 0} · Pro {m.proCount ?? 0} / Contro {m.controCount ?? 0}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card dp-card mt-3">
            <div className="card-body">
              <div className="fw-semibold mb-1">Come funziona</div>
              <ol className="dp-muted small mb-0 ps-3">
                <li>Opening</li>
                <li>Rebuttal</li>
                <li>Voting</li>
                <li>Risultato</li>
              </ol>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Home;
