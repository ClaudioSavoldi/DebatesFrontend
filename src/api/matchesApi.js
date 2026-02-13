import { http } from "./http";

export function getMyMatchesApi() {
  return http("/api/Matches/mine", { method: "GET" });
}

export function getMatchByIdApi(id) {
  return http(`/api/Matches/${id}`, { method: "GET" });
}

export function getMatchResultsApi() {
  return http("/api/Matches/results");
}
