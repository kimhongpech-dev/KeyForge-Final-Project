import { createContext, useState, useContext, useEffect } from "react";
import {
  apiFetch,
  authHeaders,
  clearToken,
  getToken,
  setToken,
} from "../services/http";

const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(getToken()));
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!getToken()) return;
    apiFetch("/auth/me", { headers: authHeaders() })
      .then((data) => setUser(data.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function authenticate(path, email, password) {
    try {
      const data = await apiFetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || "Network error" };
    }
  }

  function signUp(email, password) {
    return authenticate("/auth/signup", email, password);
  }

  function login(email, password) {
    return authenticate("/auth/login", email, password);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ signUp, user, logout, login, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
