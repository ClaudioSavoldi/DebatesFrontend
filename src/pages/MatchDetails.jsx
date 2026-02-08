import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { getMatchByIdApi } from "../api/matchesApi";
import { getDebateByIdApi } from "../api/debatesApi";

import MatchPhaseBadge from "../components/MatchPhaseBadge";
import SubmissionEditor from "../components/SubmissionEditor";

import { saveOpeningDraftApi, submitOpeningApi, saveRebuttalDraftApi, submitRebuttalApi } from "../api/submissionsApi";

import { voteApi } from "../api/votesApi";

function MatchDetails() {
  const { id } = useParams();

  const [match, setMatch] = useState(null);
  const [debateTitle, setDebateTitle] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [voteError, setVoteError] = useState(null);
  const [voteMessage, setVoteMessage] = useState(null);
  const [voteLoading, setVoteLoading] = useState(false);

  const myUserId = useSelector((s) => s.auth.user?.userId);

  const isParticipant = useMemo(() => {
    if (!match || !myUserId) return false;
    return match.proUserId === myUserId || match.controUserId === myUserId;
  }, [match, myUserId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setVoteError(null);
      setVoteMessage(null);

      try {
        const matchData = await getMatchByIdApi(id);
        if (cancelled) return;

        setMatch(matchData);

        // seconda fetch: titolo del dibattito
        if (matchData?.debateId) {
          try {
            const debate = await getDebateByIdApi(matchData.debateId);
            if (!cancelled) setDebateTitle(debate?.title ?? null);
          } catch {
            // se fallisce non blocchiamo la pagina
            if (!cancelled) setDebateTitle(null);
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleVote = async (value) => {
    if (!match) return;

    setVoteError(null);
    setVoteMessage(null);
    setVoteLoading(true);

    try {
      await voteApi(match.id, value);
      setVoteMessage("Voto registrato ");
    } catch (err) {
      // Backend: 403 quando voti un match in cui partecipi (o non autorizzato)
      if (String(err.message).includes("403")) {
        setVoteError("Non puoi votare un match a cui partecipi.");
      } else {
        setVoteError(err.message);
      }
    } finally {
      setVoteLoading(false);
    }
  };

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;
  if (!match) return <div className="container mt-4">Match non trovato.</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">Dettaglio match</h2>
          <div className="text-muted">
            Dibattito: <span className="fw-semibold">{debateTitle ?? match.debateId}</span>
          </div>
        </div>

        <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">
          ← Torna alla dashboard
        </Link>
      </div>

      {/* Info match */}
      <div className="card mb-3">
        <div className="card-body d-flex justify-content-between align-items-start gap-3">
          <div>
            <div>
              <span className="fw-semibold">MatchId:</span> {match.id}
            </div>
            <div>
              <span className="fw-semibold">Creato:</span> {new Date(match.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="text-end">
            <div className="mb-1">
              <span className="fw-semibold me-2">Fase:</span>
              <MatchPhaseBadge phase={match.phase} />
            </div>
            <div className="text-muted" style={{ fontSize: 13 }}>
              DebateId: {match.debateId}
            </div>
          </div>
        </div>
      </div>

      {/* Partecipanti & Voti */}
      <div className="row g-3">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header fw-semibold">Partecipanti & Voti</div>
            <div className="card-body">
              <div>
                <span className="fw-semibold">ProUserId:</span> {match.proUserId}
              </div>
              <div>
                <span className="fw-semibold">ControUserId:</span> {match.controUserId}
              </div>
              <hr />
              <div>
                <span className="fw-semibold">ProCount:</span> {match.proCount}
              </div>
              <div>
                <span className="fw-semibold">ControCount:</span> {match.controCount}
              </div>
              <div>
                <span className="fw-semibold">TotalVotes:</span> {match.totalVotes}
              </div>
            </div>
          </div>
        </div>

        {/* Esito */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header fw-semibold">Esito</div>
            <div className="card-body">
              <div>
                <span className="fw-semibold">WinnerUsername:</span> {match.winnerUsername ?? "—"}
              </div>
              <div>
                <span className="fw-semibold">Draw:</span> {match.isDraw ? "Sì" : "No"}
              </div>
              <hr />
              <div>
                <span className="fw-semibold">VotingEndsAt:</span> {match.votingEndsAt ? new Date(match.votingEndsAt).toLocaleString() : "—"}
              </div>
              <div>
                <span className="fw-semibold">ClosedAt:</span> {match.closedAt ? new Date(match.closedAt).toLocaleString() : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions: per ora lasciamo JSON (poi li “abbelliamo”) */}
      <div className="row g-3 mt-1">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header fw-semibold">Opening submissions</div>
            <div className="card-body">
              {match.openingSubmissions?.length ? (
                <pre className="mb-0">{JSON.stringify(match.openingSubmissions, null, 2)}</pre>
              ) : (
                <div className="text-muted">Nessuna submission disponibile.</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header fw-semibold">Rebuttal submissions</div>
            <div className="card-body">
              {match.rebuttalSubmissions?.length ? (
                <pre className="mb-0">{JSON.stringify(match.rebuttalSubmissions, null, 2)}</pre>
              ) : (
                <div className="text-muted">Nessuna submission disponibile.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Opening */}
      {match.phase === 1 && (
        <div className="mt-3">
          <SubmissionEditor
            title="Opening"
            onSaveDraft={(body) => saveOpeningDraftApi(match.id, body)}
            onSubmitFinal={(body) => submitOpeningApi(match.id, body)}
          />
        </div>
      )}

      {/* Rebuttal */}
      {match.phase === 2 && (
        <div className="mt-3">
          <SubmissionEditor
            title="Rebuttal"
            onSaveDraft={(body) => saveRebuttalDraftApi(match.id, body)}
            onSubmitFinal={(body) => submitRebuttalApi(match.id, body)}
          />
        </div>
      )}

      {/* Voting */}
      {match.phase === 3 && (
        <div className="mt-3 card">
          <div className="card-header fw-semibold">Voting</div>
          <div className="card-body">
            {voteError && <div className="alert alert-danger">{voteError}</div>}
            {voteMessage && <div className="alert alert-success">{voteMessage}</div>}

            {isParticipant ? (
              <div className="alert alert-secondary mb-0">Non puoi votare un match a cui partecipi.</div>
            ) : (
              <div className="d-flex gap-2">
                <button className="btn btn-success" type="button" disabled={voteLoading} onClick={() => handleVote(1)}>
                  Vota Pro
                </button>
                <button className="btn btn-danger" type="button" disabled={voteLoading} onClick={() => handleVote(2)}>
                  Vota Contro
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Closed */}
      {match.phase === 4 && (
        <div className="mt-3 alert alert-info">{match.isDraw ? "Match chiuso: pareggio." : `Match chiuso: vince ${match.winnerUsername}.`}</div>
      )}
    </div>
  );
}

export default MatchDetails;
