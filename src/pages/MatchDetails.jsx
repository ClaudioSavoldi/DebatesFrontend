import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { getMatchByIdApi } from "../api/matchesApi";
import { getDebateByIdApi } from "../api/debatesApi";

import MatchPhaseBadge from "../components/MatchPhaseBadge";
import SubmissionEditor from "../components/SubmissionEditor";
import SubmissionsPair from "../components/SubmissionsPair";

import { saveOpeningDraftApi, submitOpeningApi, saveRebuttalDraftApi, submitRebuttalApi } from "../api/submissionsApi";

function MatchDetails() {
  const { id } = useParams();
  const myUserId = useSelector((s) => s.auth.user?.userId);

  const [match, setMatch] = useState(null);
  const [debateTitle, setDebateTitle] = useState(null);
  const [debateBody, setDebateBody] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reloadMatch = async () => {
    const m = await getMatchByIdApi(id);
    setMatch(m);
  };

  const isParticipant = useMemo(() => {
    if (!match || !myUserId) return false;
    return match.proUserId === myUserId || match.controUserId === myUserId;
  }, [match, myUserId]);

  const mySide = useMemo(() => {
    if (!match || !myUserId) return null;
    if (match.proUserId === myUserId) return "PRO";
    if (match.controUserId === myUserId) return "CONTRO";
    return null;
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

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const m = await getMatchByIdApi(id);
        if (!alive) return;

        setMatch(m);

        try {
          const d = await getDebateByIdApi(m.debateId);
          if (!alive) return;

          setDebateTitle(d?.title ?? null);
          setDebateBody(d?.body ?? null);
        } catch {
          if (!alive) return;
          setDebateTitle(null);
          setDebateBody(null);
        }
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
  }, [id]);

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;
  if (!match) return <div className="container mt-4">Match non trovato.</div>;

  // Se non sei participant qui non puoi  fare nulla
  if (!isParticipant) {
    return (
      <div className="container dp-home mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <div className="dp-eyebrow">MATCH</div>
            <h2 className="mb-0">Accesso limitato</h2>
          </div>
          <Link to="/public/matches" className="btn btn-outline-secondary btn-sm">
            ← Vai ai match pubblici
          </Link>
        </div>

        <div className="alert alert-warning">Questo è un match a cui non partecipi. Per leggere e votare usa la pagina pubblica.</div>

        <Link to={`/public/matches/${match.id}`} className="btn btn-primary">
          Apri versione pubblica
        </Link>
      </div>
    );
  }

  const phaseHint =
    match.phase === 1
      ? "Sei in Opening: scrivi la tua posizione iniziale."
      : match.phase === 2
        ? "Sei in Rebuttal: rispondi agli argomenti dell’avversario."
        : match.phase === 3
          ? "Voting: il pubblico sta votando (tu non puoi votare)."
          : "Closed: il match è concluso.";

  return (
    <div className="container dp-home mt-4">
      {/* HERO editoriale. badge sotto su schermi piccoli */}
      <section className="card dp-card dp-hero mb-4">
        <div className="card-body">
          <div className="dp-eyebrow">IL TUO MATCH</div>

          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3">
            <div className="min-w-0">
              <h1 className="dp-title mb-2 text-break">{debateTitle ?? `Dibattito: ${match.debateId}`}</h1>

              <p className="dp-muted mb-3" style={{ maxWidth: 820 }}>
                {phaseHint}
              </p>

              <div className="d-flex flex-wrap gap-2">
                <Link to="/dashboard" className="btn btn-outline-secondary">
                  ← Torna alla dashboard
                </Link>
                <Link to="/public/matches" className="btn btn-outline-secondary">
                  Match pubblici
                </Link>
              </div>
            </div>

            {/* pill box a destra */}
            <div className="d-flex  gap-2 align-items-start align-content-between">
              <div className="card dp-card" style={{ boxShadow: "none" }}>
                <div className="card-body py-2 px-3">
                  <div className="dp-muted small">Fase</div>
                  <MatchPhaseBadge phase={match.phase} />
                </div>
              </div>

              <div className="card dp-card" style={{ boxShadow: "none" }}>
                <div className="card-body py-2 px-3">
                  <div className="dp-muted small">Sei</div>
                  {mySide === "PRO" ? <span className="badge bg-success">PRO</span> : <span className="badge bg-danger">CONTRO</span>}
                </div>
              </div>
            </div>
          </div>

          {/* descrizione dibattito: collassabile per non rubare spazio in Opening */}
          {debateBody && (
            <details className="mt-3">
              <summary className="dp-muted" style={{ cursor: "pointer" }}>
                Mostra descrizione del dibattito
              </summary>
              <div className="mt-2 dp-muted" style={{ whiteSpace: "pre-wrap" }}>
                {debateBody}
              </div>
            </details>
          )}

          <div className="dp-muted small mt-3">
            MatchId: <span className="text-dark">{match.id}</span> · Creato: <span className="text-dark">{new Date(match.createdAt).toLocaleString()}</span> ·
            Voti (pubblico): <span className="text-dark fw-semibold">{match.totalVotes}</span> (Pro {match.proCount} / Contro {match.controCount})
          </div>
        </div>
      </section>

      {/* Testi (visibili se disponibili) */}
      <div className="row g-4">
        <div className="col-12">
          <SubmissionsPair
            title="Opening"
            proText={proOpening}
            controText={controOpening}
            emptyHint="Opening non disponibile (diventa visibile quando entrambi consegnano)."
          />
        </div>

        <div className="col-12">
          <SubmissionsPair
            title="Rebuttal"
            proText={proRebuttal}
            controText={controRebuttal}
            emptyHint="Rebuttal non disponibile (diventa visibile quando entrambi consegnano)."
          />
        </div>

        {/* Editor Opening */}
        {match.phase === 1 && (
          <div className="col-12">
            <SubmissionEditor
              title="Scrivi Opening"
              onSaveDraft={async (body) => {
                await saveOpeningDraftApi(match.id, body);
                await reloadMatch();
              }}
              onSubmitFinal={async (body) => {
                await submitOpeningApi(match.id, body);
                await reloadMatch();
              }}
            />
            <div className="dp-muted mt-2" style={{ fontSize: 13 }}>
              Dopo la consegna, l’opening diventa visibile quando anche l’avversario consegna.
            </div>
          </div>
        )}

        {/* Editor Rebuttal */}
        {match.phase === 2 && (
          <div className="col-12">
            <SubmissionEditor
              title="Scrivi Rebuttal"
              onSaveDraft={async (body) => {
                await saveRebuttalDraftApi(match.id, body);
                await reloadMatch();
              }}
              onSubmitFinal={async (body) => {
                await submitRebuttalApi(match.id, body);
                await reloadMatch();
              }}
            />
            <div className="dp-muted mt-2" style={{ fontSize: 13 }}>
              Puoi leggere gli opening sopra per preparare la tua risposta.
            </div>
          </div>
        )}

        {/* Voting (informativo) */}
        {match.phase === 3 && (
          <div className="col-12">
            <div className="alert alert-info mb-0">
              Questo match è in fase <span className="fw-semibold">Voting</span>. Il voto è pubblico e avviene dalla sezione{" "}
              <Link to="/public/matches" className="fw-semibold">
                Match pubblici
              </Link>
              .
              <div className="mt-2 text-muted" style={{ fontSize: 13 }}>
                Tu non puoi votare perché sei un partecipante.
              </div>
            </div>
          </div>
        )}

        {/* Closed */}
        {match.phase === 4 && (
          <div className="col-12">
            <div className="alert alert-success mb-0">
              {match.isDraw ? (
                "Match chiuso: pareggio."
              ) : (
                <>
                  Match chiuso: vince <span className="fw-semibold">{match.winnerUsername ?? "—"}</span>.
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MatchDetails;
