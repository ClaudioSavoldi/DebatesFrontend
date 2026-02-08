import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { getToken, setToken, clearToken } from "../auth/tokenStorage";

function getUserFromToken(token) {
  if (!token) return null;

  const payload = jwtDecode(token);

  const userId = payload.nameid || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || payload.sub || null;

  const username = payload.unique_name || payload.name || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || payload.email || null;

  const rawRoles = payload.role || payload.roles || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || [];

  const roles = Array.isArray(rawRoles) ? rawRoles : [rawRoles];

  return { userId, username, roles };
}

const initialToken = getToken();

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: initialToken || null,
    user: initialToken ? getUserFromToken(initialToken) : null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const token = action.payload;
      state.token = token;
      state.user = getUserFromToken(token);
      setToken(token);
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      clearToken();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
