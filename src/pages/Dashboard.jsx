import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getMyMatchesApi } from "../api/matchesApi";
import { getMyQueueApi } from "../api/debateQueueApi";
import { getDebateByIdApi } from "../api/debatesApi";

import { phaseLabel } from "../utils/matchPhase";
import SideBadge from "../components/SideBadge";

function Dashboard() {
  const [matches, setMatches] = useState([]);
  const [queue, setQueue] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const [matchesData, queueData] = await Promise.all([getMyMatchesApi(), getMyQueueApi()]);
        if (!alive) return;

        const rawMatches = Array.isArray(matchesData) ? matchesData : [];
        const rawQueue = Array.isArray(queueData) ? queueData : [];

        const uniqueDebateIds = Array.from(new Set(rawMatches.map((m) => m.debateId).filter(Boolean)));

        let titleMap = {};
        if (uniqueDebateIds.length > 0) {
          const results = await Promise.allSettled(
            uniqueDebateIds.map(async (debateId) => {
              const d = await getDebateByIdApi(debateId);
              return { debateId, title: d?.title ?? null };
            }),
          );

          titleMap = results.reduce((acc, r) => {
            if (r.status === "fulfilled" && r.value?.debateId) {
              acc[r.value.debateId] = r.value.title;
            }
            return acc;
          }, {});
        }

        const enrichedMatches = rawMatches.map((m) => ({
          ...m,
          debateTitle: m.debateTitle ?? titleMap[m.debateId] ?? null,
        }));

        setMatches(enrichedMatches);
        setQueue(rawQueue);
      } catch (e) {
        if (!alive) return;
        setError(e.message || "Errore nel caricamento della dashboard.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const sortedMatches = useMemo(() => {
    const arr = Array.isArray(matches) ? [...matches] : [];
    arr.sort((a, b) => {
      const pa = a.phase ?? 999;
      const pb = b.phase ?? 999;
      if (pa !== pb) return pa - pb;

      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
    return arr;
  }, [matches]);

  const activeMatches = useMemo(() => sortedMatches.filter((m) => (m.phase ?? 0) !== 4), [sortedMatches]);
  const closedMatches = useMemo(() => sortedMatches.filter((m) => (m.phase ?? 0) === 4), [sortedMatches]);

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;

  return (
    <div className="container dp-home mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
        <div className="min-w-0">
          <div className="dp-eyebrow">DASHBOARD</div>
          <h1 className="dp-title mb-1">Il tuo spazio</h1>
          <div className="dp-muted">Coda e match: tutto in un colpo d’occhio.</div>
        </div>

        <div className="d-flex gap-2">
          <Link to="/" className="btn btn-sm btn-outline-secondary">
            ← Topic
          </Link>
          <Link to="/public/matches" className="btn btn-sm btn-outline-secondary">
            Match pubblici
          </Link>
        </div>
      </div>

      <div className="row g-4">
        {/* MAIN */}
        <main className="col-12 col-lg-8 order-2 order-lg-1">
          {/* MATCHES */}
          <section className="card dp-card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-end mb-2">
                <div>
                  <div className="fw-semibold">
                    I miei match <span className="dp-count ms-2">{sortedMatches.length}</span>
                  </div>
                  <div className="dp-muted small">Apri un match per scrivere (opening/rebuttal) o vedere lo stato.</div>
                </div>
              </div>

              {sortedMatches.length === 0 ? (
                <div className="alert alert-secondary mb-0">Nessun match trovato.</div>
              ) : (
                <>
                  {/* ATTIVI */}
                  <div className="d-flex justify-content-between align-items-center mt-3 mb-2">
                    <div className="fw-semibold">
                      Attivi <span className="dp-count ms-2">{activeMatches.length}</span>
                    </div>
                  </div>

                  {activeMatches.length === 0 ? (
                    <div className="alert alert-secondary">Nessun match attivo.</div>
                  ) : (
                    <div className="list-group dp-list mb-3">
                      {activeMatches.map((m) => {
                        const matchId = m.id || m.matchId;
                        const created = m.createdAt ? new Date(m.createdAt).toLocaleString() : "";
                        const title = m.debateTitle ?? "Dibattito";

                        return (
                          <Link key={matchId} to={`/matches/${matchId}`} className="list-group-item list-group-item-action dp-list-item">
                            <div className="d-flex justify-content-between align-items-start gap-3">
                              <div className="min-w-0">
                                <div className="fw-semibold text-truncate">{title}</div>
                                <div className="dp-muted small">Creato: {created}</div>
                              </div>

                              <span className="badge bg-warning text-dark flex-shrink-0">{phaseLabel(m.phase)}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* CONCLUSI */}
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="fw-semibold">
                      Conclusi <span className="dp-count ms-2">{closedMatches.length}</span>
                    </div>
                  </div>

                  {closedMatches.length === 0 ? (
                    <div className="alert alert-secondary mb-0">Nessun match concluso.</div>
                  ) : (
                    <div className="list-group dp-list">
                      {closedMatches.map((m) => {
                        const matchId = m.id || m.matchId;
                        const created = m.createdAt ? new Date(m.createdAt).toLocaleString() : "";
                        const title = m.debateTitle ?? "Dibattito";

                        return (
                          <Link key={matchId} to={`/matches/${matchId}`} className="list-group-item list-group-item-action dp-list-item">
                            <div className="d-flex justify-content-between align-items-start gap-3">
                              <div className="min-w-0">
                                <div className="fw-semibold text-truncate">{title}</div>
                                <div className="dp-muted small">Creato: {created}</div>
                              </div>

                              <span className="badge text-bg-dark flex-shrink-0">Closed</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* QUEUE */}
          <section className="card dp-card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-end mb-2">
                <div>
                  <div className="fw-semibold">
                    In coda <span className="dp-count ms-2">{queue.length}</span>
                  </div>
                  <div className="dp-muted small">Iscrizioni in attesa di avversario.</div>
                </div>
              </div>

              {queue.length === 0 ? (
                <div className="alert alert-secondary mb-0">Nessuna iscrizione in coda.</div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {queue.map((q) => {
                    const key = q.id ?? `${q.debateId}-${q.side ?? ""}`;
                    const joined = q.joinedAt ? new Date(q.joinedAt).toLocaleString() : "";

                    return (
                      <div key={key} className="dp-miniitem">
                        <div className="d-flex justify-content-between align-items-start gap-3">
                          <div className="min-w-0">
                            <div className="fw-semibold text-truncate">{q.debateTitle ?? "Dibattito"}</div>
                            <div className="dp-muted small">
                              Lato: <SideBadge side={q.side} /> {joined ? `· Iscritto: ${joined}` : ""}
                            </div>
                          </div>

                          <Link className="btn btn-outline-secondary btn-sm flex-shrink-0" to={`/debates/${q.debateId}`}>
                            Apri
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </main>

        {/* SIDEBAR */}
        <aside className="col-12 col-lg-4 order-1 order-lg-2">
          <div className="dp-sticky">
            <div className="card dp-card">
              <div className="card-body">
                <div className="fw-semibold mb-1">Azioni rapide</div>
                <div className="dp-muted small mb-3">Vai dritto al punto.</div>

                <div className="d-grid gap-2">
                  <Link to="/" className="btn btn-primary btn-sm">
                    Trova un topic
                  </Link>
                  <Link to="/debates/new" className="btn btn-outline-secondary btn-sm">
                    Crea dibattito
                  </Link>
                  <Link to="/results" className="btn btn-outline-secondary btn-sm">
                    Risultati
                  </Link>
                </div>
              </div>
            </div>

            <div className="card dp-card mt-3">
              <div className="card-body">
                <div className="fw-semibold mb-1">Come funziona</div>
                <ul className="dp-muted small mb-0 ps-3">
                  <li>Entri in coda Pro/Contro</li>
                  <li>Quando trovi avversario nasce un match</li>
                  <li>Opening → Rebuttal → Voting → Risultato</li>
                </ul>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Dashboard;
