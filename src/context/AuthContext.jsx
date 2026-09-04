import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('polar_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth on page load/refresh
  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('polar_token');
      const storedUser = localStorage.getItem('polar_user');

      if (storedToken) {
        setToken(storedToken);
        try {
          // Verify with backend or local store
          const userData = await api.getMe();
          setUser(userData);
          localStorage.setItem('polar_user', JSON.stringify(userData));
        } catch (err) {
          console.warn('Session verification fallback to stored user:', err);
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch {
              localStorage.removeItem('polar_token');
              localStorage.removeItem('polar_user');
              setUser(null);
              setToken(null);
            }
          } else {
            localStorage.removeItem('polar_token');
            localStorage.removeItem('polar_user');
            setUser(null);
            setToken(null);
          }
        }
      } else if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.token || parsed.access_token) {
            const tk = parsed.token || parsed.access_token;
            setToken(tk);
            localStorage.setItem('polar_token', tk);
            setUser(parsed);
          }
        } catch (e) {
          localStorage.removeItem('polar_user');
        }
      }
      setLoading(false);
    }

    initAuth();
  }, []);

  const login = async (username, password, station) => {
    const res = await api.login(username, password, station);
    const authToken = res.token || res.access_token;
    const isUserAdmin =
      res.role?.toLowerCase() === 'admin' ||
      res.user?.role?.toLowerCase() === 'admin' ||
      username.trim().toLowerCase() === 'admin' ||
      username.trim().toLowerCase() === 'administrator';

    const userData = {
      id: res.user?.id || 1,
      name: res.name || res.user?.name || username,
      username: res.username || res.user?.username || username,
      role: isUserAdmin ? 'admin' : (res.role || res.user?.role || 'operator'),
      status: res.status || res.user?.status || 'active',
      station: res.station || station || 'Bharati Polar Station',
      last_login: res.user?.last_login || new Date().toISOString(),
      created_at: res.user?.created_at,
    };

    localStorage.setItem('polar_token', authToken);
    localStorage.setItem('polar_user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      if (token) {
        await api.logout();
      }
    } catch (err) {
      console.warn('Logout notice:', err);
    } finally {
      localStorage.removeItem('polar_token');
      localStorage.removeItem('polar_user');
      setUser(null);
      setToken(null);
    }
  };

  const isAdmin =
    user?.role?.toLowerCase() === 'admin' ||
    user?.role === 'System Administrator' ||
    user?.username?.toLowerCase() === 'admin' ||
    user?.username?.toLowerCase() === 'administrator';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
