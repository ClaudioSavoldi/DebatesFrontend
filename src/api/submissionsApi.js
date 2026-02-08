import { http } from "./http";

// Opening
export function saveOpeningDraftApi(matchId, body) {
  return http(`/api/matches/${matchId}/submissions/opening/draft`, {
    method: "PUT",
    body: JSON.stringify({ body }),
  });
}

export function submitOpeningApi(matchId, body) {
  return http(`/api/matches/${matchId}/submissions/opening/submit`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

// Rebuttal
export function saveRebuttalDraftApi(matchId, body) {
  return http(`/api/matches/${matchId}/submissions/rebuttal/draft`, {
    method: "PUT",
    body: JSON.stringify({ body }),
  });
}

export function submitRebuttalApi(matchId, body) {
  return http(`/api/matches/${matchId}/submissions/rebuttal/submit`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}
