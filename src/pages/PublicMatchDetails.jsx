import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { getMatchByIdApi } from "../api/matchesApi";
import { getDebateByIdApi } from "../api/debatesApi";
import { voteApi } from "../api/votesApi";

import MatchPhaseBadge from "../components/MatchPhaseBadge";
import SubmissionsPair from "../components/SubmissionsPair";

function PublicMatchDetails() {
  const { id } = useParams();

  const token = useSelector((s) => s.auth.token);
  const isAuthenticated = !!token;
  const myUserId = useSelector((s) => s.auth.user?.userId);

  const [match, setMatch] = useState(null);
  const [debateTitle, setDebateTitle] = useState(null);
  const [debateBody, setDebateBody] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [voteError, setVoteError] = useState(null);
  const [voteMessage, setVoteMessage] = useState(null);
  const [voting, setVoting] = useState(false);

  const isParticipant = useMemo(() => {
    if (!match || !myUserId) return false;
    return match.proUserId === myUserId || match.controUserId === myUserId;
  }, [match, myUserId]);

  const findBodyByUserId = (arr, userId) => {
    if (!Array.isArray(arr) || !userId) return null;
    const item = arr.find((x) => x.userId === userId);
    return item?.body ?? null;
  };

  const proOpening = match ? findBodyByUserId(match.openingSubmissions, match.proUserId) : null;
  const controOpening = match ? findBodyByUserId(match.openingSubmissions, match.controUserId) : null;

  const proRebuttal = match ? findBodyByUserId(match.rebuttalSubmissions, match.proUserId) : null;
  const controRebuttal = match ? findBodyByUserId(match.rebuttalSubmissions, match.controUserId) : null;

  const isVotingPhase = match?.phase === 3;
  const isClosed = match?.phase === 4;

  const load = async () => {
    setLoading(true);
    setError(null);
    setVoteError(null);
    setVoteMessage(null);

    try {
      const data = await getMatchByIdApi(id);
      setMatch(data);

      try {
        const d = await getDebateByIdApi(data.debateId);
        setDebateTitle(d?.title ?? null);
        setDebateBody(d?.body ?? null);
      } catch {
        setDebateTitle(null);
        setDebateBody(null);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleVote = async (value) => {
    setVoteError(null);
    setVoteMessage(null);
    setVoting(true);

    try {
      await voteApi(id, value);
      setVoteMessage("Voto registrato ");
      await load(); // refresh counts + info
    } catch (e) {
      const msg = String(e.message || "");
      if (msg.includes("401")) setVoteError("Devi fare login per votare.");
      else if (msg.includes("403")) setVoteError("Non puoi votare un match a cui partecipi.");
      else if (msg.includes("409")) setVoteError("Hai già votato per questo match.");
      else setVoteError(e.message);
    } finally {
      setVoting(false);
    }
  };

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;
  if (!match) return <div className="container mt-4">Match non trovato.</div>;

  const voteStateMessage = !isVotingPhase
    ? "Questo match non è in fase di votazione."
    : !isAuthenticated
      ? "Devi fare login per votare."
      : isParticipant
        ? "Non puoi votare un match a cui partecipi."
        : null;

  return (
    <div className="container dp-match mt-4">
      {/* HERO  (titolo  + descrizione) */}
      <section className="card dp-card dp-editorial mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start gap-3">
            <div className="min-w-0">
              <div className="dp-eyebrow">MATCH PUBBLICO</div>

              <h1 className="dp-title mb-2">{debateTitle ?? match.debateId}</h1>

              <div className="dp-muted small">
                <span className="me-2">
                  Id: <span className="text-dark">{match.id}</span>
                </span>
                <span className="me-2">·</span>
                <span>
                  Voti: <span className="text-dark fw-semibold">{match.totalVotes}</span> (Pro {match.proCount} / Contro {match.controCount})
                </span>
              </div>
            </div>

            <div className="text-end d-flex flex-column align-items-end gap-2">
              <MatchPhaseBadge phase={match.phase} />
              <Link to="/public/matches" className="btn btn-sm btn-outline-secondary">
                ← Torna ai match pubblici
              </Link>
            </div>
          </div>

          {debateBody && (
            <div className="dp-editorial-body mt-3">
              <div className="dp-eyebrow mb-2">Descrizione</div>
              <div className="dp-debate-text">{debateBody}</div>
            </div>
          )}
        </div>
      </section>

      <div className="row g-4 dp-match-grid">
        {/* CONTENT */}
        <div className="col-12 col-lg-8 order-2 order-lg-1">
          <div className="d-grid gap-3">
            <SubmissionsPair
              title="Opening"
              proText={proOpening}
              controText={controOpening}
              emptyHint="Opening non disponibile (diventa visibile quando entrambi consegnano)."
            />

            <SubmissionsPair
              title="Rebuttal"
              proText={proRebuttal}
              controText={controRebuttal}
              emptyHint="Rebuttal non disponibile (diventa visibile quando entrambi consegnano)."
            />

            {isClosed && (
              <div className="alert alert-success mb-0">
                {match.isDraw ? (
                  "Match chiuso: pareggio."
                ) : (
                  <>
                    Match chiuso: vince <span className="fw-semibold">{match.winnerUsername ?? "—"}</span>.
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* VOTE PANEL */}
        <div className="col-12 col-lg-4 order-1 order-lg-2">
          <div className="dp-sticky">
            <div className="card dp-card dp-votecard">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="fw-semibold">Votazione</div>
                    <div className="dp-muted small">Disponibile solo in fase Voting</div>
                  </div>
                  <span className="badge text-bg-dark">{isVotingPhase ? "Voting" : "—"}</span>
                </div>

                <div className="dp-kpis mb-3">
                  <div className="dp-kpi">
                    <div className="dp-muted small">Pro</div>
                    <div className="fw-semibold">{match.proCount}</div>
                  </div>
                  <div className="dp-kpi">
                    <div className="dp-muted small">Contro</div>
                    <div className="fw-semibold">{match.controCount}</div>
                  </div>
                  <div className="dp-kpi">
                    <div className="dp-muted small">Totale</div>
                    <div className="fw-semibold">{match.totalVotes}</div>
                  </div>
                </div>

                {voteError && <div className="alert alert-danger">{voteError}</div>}
                {voteMessage && <div className="alert alert-success">{voteMessage}</div>}

                {voteStateMessage ? (
                  <div className="alert alert-secondary mb-0">{voteStateMessage}</div>
                ) : (
                  <div className="d-grid gap-2">
                    <button type="button" className="btn btn-success" onClick={() => handleVote(1)} disabled={voting}>
                      {voting ? "..." : "Vota Pro"}
                    </button>

                    <button type="button" className="btn btn-danger" onClick={() => handleVote(2)} disabled={voting}>
                      {voting ? "..." : "Vota Contro"}
                    </button>
                  </div>
                )}

                {!isAuthenticated && <div className="dp-muted small mt-3">Suggerimento: fai login per votare e partecipare ai match.</div>}
              </div>
            </div>

            <div className="card dp-card mt-3">
              <div className="card-body">
                <div className="fw-semibold mb-1">Come votare bene</div>
                <ul className="dp-muted small mb-0 ps-3">
                  <li>Leggi Opening di entrambi</li>
                  <li>Valuta il Rebuttal (risponde davvero?)</li>
                  <li>Vota l’argomento più solido</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicMatchDetails;
