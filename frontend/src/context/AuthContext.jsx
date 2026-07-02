import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api.get("/auth/me")
      .then((res) => setUser(res))
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  function storeToken(newToken) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }

  async function login(email, password) {
    const data = await api.post("/auth/login", { email, password });
    storeToken(data.token);
    setUser(data.user);
  }

  async function register(name, email, password, role) {
    const data = await api.post("/auth/register", { name, email, password, role });
    storeToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
