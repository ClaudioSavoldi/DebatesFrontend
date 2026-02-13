import { http } from "./http";

// GET /api/debatequeue/mine (protetto)
export function getMyQueueApi() {
  return http("/api/debatequeue/mine", { method: "GET" });
}
