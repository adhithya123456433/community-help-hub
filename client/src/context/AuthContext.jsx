import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, getCurrentUser, setAuthSession, clearAuthSession, apiRequest } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken());
  const [user, setUser] = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      const storedToken = getToken();
      if (storedToken) {
        try {
          const res = await apiRequest('/auth/me', 'GET');
          if (res.ok && res.data.success) {
            setUser(res.data.user);
            setAuthSession(storedToken, res.data.user);
          } else {
            // Invalid or expired token
            clearAuthSession();
            setToken(null);
            setUser(null);
          }
        } catch (e) {
          // Keep offline state if available
        }
      }
      setLoading(false);
    }
    verifyAuth();
  }, []);

  const login = (newToken, newUser) => {
    setAuthSession(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    clearAuthSession();
    setToken(null);
    setUser(null);
  };

  const syncUser = async () => {
    try {
      const res = await apiRequest('/auth/me', 'GET');
      if (res.ok && res.data.success) {
        setUser(res.data.user);
        const storedToken = getToken();
        if (storedToken) setAuthSession(storedToken, res.data.user);
      }
    } catch (e) {
      // non-blocking
    }
  };

  const value = {
    token,
    user,
    role: user ? user.role : null,
    isLoggedIn: !!token && !!user,
    login,
    logout,
    syncUser,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
