import React, { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [pending, setPending] = useState(false);
  const [hydrating, setHydrating] = useState(true);

  useEffect(() => {
    let active = true;
    const hydrate = async () => {
      try {
        const { user: userPayload } = await apiFetch("/auth/me");
        if (active) setUser(userPayload);
      } catch (err) {
        // ignore if no session
      } finally {
        if (active) setHydrating(false);
      }
    };
    hydrate();
    return () => {
      active = false;
    };
  }, []);

  const login = async ({ email, password }) => {
    setPending(true);
    setAuthError(null);
    try {
      const { user: userPayload } = await apiFetch("/auth/login", {
        method: "POST",
        body: { email, password }
      });
      setUser(userPayload);
      return userPayload;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setPending(false);
    }
  };

  const register = async ({ name, email, password }) => {
    setPending(true);
    setAuthError(null);
    try {
      const { user: userPayload } = await apiFetch("/auth/register", {
        method: "POST",
        body: { name, email, password }
      });
      setUser(userPayload);
      return userPayload;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setPending(false);
    }
  };

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (err) {
      // ignore logout errors
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout, register, authError, pending, hydrating }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
