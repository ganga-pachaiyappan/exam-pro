import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI } from "@/lib/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  address: string;
  phone: string;
  photo_url: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_TOKEN_KEY = "token";
const AUTH_USER_KEY = "user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = sessionStorage.getItem(AUTH_TOKEN_KEY);
      const savedUser = sessionStorage.getItem(AUTH_USER_KEY);

      if (!savedToken) {
        setLoading(false);
        return;
      }

      setToken(savedToken);

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          sessionStorage.removeItem(AUTH_USER_KEY);
        }
      }

      try {
        const res = await authAPI.me();
        setUser(res.data);
        sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.data));
      } catch {
        sessionStorage.removeItem(AUTH_TOKEN_KEY);
        sessionStorage.removeItem(AUTH_USER_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void restoreSession();
  }, []);

  const login = (t: string, u: User) => {
    setToken(t);
    setUser(u);
    sessionStorage.setItem(AUTH_TOKEN_KEY, t);
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
  };

  const updateUser = (u: User) => {
    setUser(u);
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAdmin: user?.role === "admin", loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
