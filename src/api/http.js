import { getToken, clearToken } from "../auth/tokenStorage";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export async function http(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // token scaduto/non valido → logout “hard”
    clearToken();
  }

  const contentType = res.headers.get("content-type") || "";
  const hasJson = contentType.includes("application/json");
  const data = hasJson ? await res.json() : null;

  if (!res.ok) {
    const message = (data && (data.message || data.error || data.title)) || `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
