import { createContext, useContext, useMemo, useState } from "react";
import { getToken, setToken, clearToken } from "./tokenStorage";
import { getUserFromToken } from "./jwt";
import { loginApi } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const initialToken = getToken();
  const initialUser = initialToken ? getUserFromToken(initialToken) : null;

  const [token, setTokenState] = useState(initialToken);
  const [user, setUser] = useState(initialUser);

  async function login({ email, password }) {
    const result = await loginApi({ email, password });

    const receivedToken = result?.token || result?.accessToken || result?.jwt;

    if (!receivedToken) {
      throw new Error("Login OK ma token non trovato nella risposta.");
    }

    setToken(receivedToken);
    setTokenState(receivedToken);
    setUser(getUserFromToken(receivedToken));
  }

  function logout() {
    clearToken();
    setTokenState(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      login,
      logout,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
