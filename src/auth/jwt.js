import { jwtDecode } from "jwt-decode";

export function getUserFromToken(token) {
  if (token) return null;

  const payload = jwtDecode(token);
  const userId = payload.nameid || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || payload.sub || null;

  const username = payload.unique_name || payload.name || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || payload.email || null;

  const email = payload.email || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || null;

  const rawRoles = payload.role || payload.roles || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || [];

  const roles = Array.isArray(rawRoles) ? rawRoles : [rawRoles];

  return {
    userId,
    username,
    email,
    roles,
    claims: payload,
  };
}
