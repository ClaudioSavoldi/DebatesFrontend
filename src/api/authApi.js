import { http } from "./http";

export function loginApi(payload) {
  return http("/api/Auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function registerApi(payload) {
  return http("/api/Auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
