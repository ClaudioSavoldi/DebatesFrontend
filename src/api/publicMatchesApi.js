import { http } from "./http";

export function getPublicMatchesApi() {
  return http("/api/Matches/public", { method: "GET" });
}
