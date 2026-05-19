import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '@/api/auth';
import { initEcho, disconnectEcho } from '@/lib/echo';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('bsn_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(true);

  // On mount, verify token + fetch fresh user
  useEffect(() => {
    const token = localStorage.getItem('bsn_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi.me()
      .then(({ user }) => {
        setUser(user);
        localStorage.setItem('bsn_user', JSON.stringify(user));
        // Initialize Echo for authenticated user
        initEcho();
      })
      .catch(() => {
        localStorage.removeItem('bsn_token');
        localStorage.removeItem('bsn_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { user, token } = await authApi.login(email, password);
    localStorage.setItem('bsn_token', token);
    localStorage.setItem('bsn_user', JSON.stringify(user));
    setUser(user);
    initEcho(); // connect to Reverb
    toast.success(`أهلاً ${user.name.split(' ')[0]}!`);
    return user;
  }, []);

  const register = useCallback(async (data) => {
    const { user, token } = await authApi.register(data);
    localStorage.setItem('bsn_token', token);
    localStorage.setItem('bsn_user', JSON.stringify(user));
    setUser(user);
    initEcho();
    toast.success('تم التسجيل، أهلاً بيك!');
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore — clear state anyway
    }
    disconnectEcho(); // close WebSocket connection
    localStorage.removeItem('bsn_token');
    localStorage.removeItem('bsn_user');
    setUser(null);
    toast.success('تم تسجيل الخروج');
  }, []);

  const updateUser = useCallback((newUser) => {
    setUser(newUser);
    localStorage.setItem('bsn_user', JSON.stringify(newUser));
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isDeveloper: user?.role === 'developer',
    isUser: user?.role === 'user',
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
