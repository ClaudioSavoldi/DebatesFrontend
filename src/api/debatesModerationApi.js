import { http } from "./http";

export function getDebatesForModerationApi() {
  return http("/api/Debates/moderation", {
    method: "GET",
  });
}

export function changeDebateStatusApi(debateId, newStatus, reason = null) {
  const body = {
    NewStatus: newStatus,
  };

  if (reason) {
    body.Reason = reason;
  }

  return http(`/api/Debates/${debateId}/status`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
