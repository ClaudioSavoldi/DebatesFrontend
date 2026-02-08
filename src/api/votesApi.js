import { http } from "./http";

// VoteValue: Pro=1 Contro=2
export function voteApi(matchId, value) {
  return http(`/api/matches/${matchId}/votes`, {
    method: "POST",
    body: JSON.stringify({ value }),
  });
}
