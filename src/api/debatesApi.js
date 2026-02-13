import { http } from "./http";

export function getDebatesApi() {
  return http("/api/Debates", { method: "GET" });
}

export function getDebateByIdApi(id) {
  return http(`/api/Debates/${id}`, { method: "GET" });
}

export function createDebateApi(payload) {
  // payload: { title, body }
  return http("/api/Debates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * (enum backend)
 * side: numero
 * 1 = Pro, 2 = Contro
 */
export function joinDebateApi(debateId, side) {
  return http(`/api/debates/${debateId}/join`, {
    method: "POST",
    body: JSON.stringify({ side }),
  });
}
