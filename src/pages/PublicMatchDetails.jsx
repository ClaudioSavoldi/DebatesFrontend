import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { getMatchByIdApi } from "../api/matchesApi";
import { voteApi } from "../api/votesApi";
import { phaseLabel } from "../utils/matchPhase";

function PublicMatchDetails() {
  const { id } = useParams();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [voteError, setVoteError] = useState(null);
  const [voteMessage, setVoteMessage] = useState(null);
  const [voting, setVoting] = useState(false);

  const myUserId = useSelector((s) => s.auth.user?.userId);

  const isParticipant = useMemo(() => {
    if (!match || !myUserId) return false;
    return match.proUserId === myUserId || match.controUserId === myUserId;
  }, [match, myUserId]);

  const refresh = async () => {
    const data = await getMatchByIdApi(id);
    setMatch(data);
  };

  useEffect(() => {
    setLoading(true);
    getMatchByIdApi(id)
      .then((data) => {
        setMatch(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleVote = async (value) => {
    setVoteError(null);
    setVoteMessage(null);
    setVoting(true);

    try {
      await voteApi(id, value);
      setVoteMessage("Voto registrato ✅");
      await refresh(); // aggiorna conteggi
    } catch (err) {
      if (err.message.includes("403")) {
        setVoteError("Non puoi votare un match a cui partecipi.");
      } else {
        setVoteError(err.message);
      }
    } finally {
      setVoting(false);
    }
  };

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;
  if (!match) return <div className="container mt-4">Match non trovato.</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Match pubblico</h2>
        <Link to="/public/matches" className="btn btn-outline-secondary btn-sm">
          ← Torna ai match pubblici
        </Link>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div>
            <span className="fw-semibold">Id:</span> {match.id}
          </div>
          <div>
            <span className="fw-semibold">DebateId:</span> {match.debateId}
          </div>
          <div>
            <span className="fw-semibold">Fase:</span> {phaseLabel(match.phase)} ({match.phase})
          </div>
          <hr />
          <div>
            <span className="fw-semibold">Pro:</span> {match.proCount}
          </div>
          <div>
            <span className="fw-semibold">Contro:</span> {match.controCount}
          </div>
          <div>
            <span className="fw-semibold">Totale:</span> {match.totalVotes}
          </div>
        </div>
      </div>

      {match.phase !== 3 ? (
        <div className="alert alert-secondary">Questo match non è attualmente in fase di votazione.</div>
      ) : isParticipant ? (
        <div className="alert alert-secondary">Non puoi votare un match a cui partecipi.</div>
      ) : (
        <div className="card">
          <div className="card-header fw-semibold">Vota</div>
          <div className="card-body">
            {voteError && <div className="alert alert-danger">{voteError}</div>}
            {voteMessage && <div className="alert alert-success">{voteMessage}</div>}

            <div className="d-flex gap-2">
              <button type="button" className="btn btn-success" onClick={() => handleVote(1)} disabled={voting}>
                {voting ? "..." : "Vota Pro"}
              </button>

              <button type="button" className="btn btn-danger" onClick={() => handleVote(2)} disabled={voting}>
                {voting ? "..." : "Vota Contro"}
              </button>
            </div>
          </div>
        </div>
      )}

      {match.phase === 4 && (
        <div className="mt-3 alert alert-info">{match.isDraw ? "Match chiuso: pareggio." : `Match chiuso: vince ${match.winnerUsername}.`}</div>
      )}
    </div>
  );
}

export default PublicMatchDetails;
