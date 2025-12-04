import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User } from '../../entities/User.js';
import { dummyAccounts } from '../../utils/dummyAccounts';
import { createPageUrl } from '../../utils';
import { clearStoredUser, getStoredUser, setStoredUser } from '../../utils/authSession.js';

interface RegisterOptions {
  skipRedirect?: boolean;
}

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (email: string, password: string, redirectTo?: string | null) => Promise<any>;
  register: (payload: any, redirectTo?: string | null, options?: RegisterOptions) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      const stored = getStoredUser();
      if (stored) {
        setUser(stored);
        return;
      }
      const current = await User.me();
      if (current) {
        setStoredUser(current);
        setUser(current);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (email: string, password: string, redirectTo?: string | null) => {
      const match = dummyAccounts.find(
        (account) => account.email.toLowerCase() === email.toLowerCase() && account.password === password,
      );

      if (!match) {
        throw new Error('Onjuiste combinatie van e-mail en wachtwoord.');
      }

      setStoredUser(match.user);
      setUser(match.user);

      const target = match.user?.onboarding_complete
        ? redirectTo || (location.state as any)?.from || createPageUrl('Timeline')
        : createPageUrl('Onboarding');
      navigate(target, { replace: true });
      return match.user;
    },
    [location.state, navigate],
  );

  const register = useCallback(
    async (payload: any, redirectTo?: string | null, options?: RegisterOptions) => {
      const created = await User.create(payload);
      setStoredUser(created);
      setUser(created);

      if (!options?.skipRedirect) {
        const target = redirectTo || createPageUrl(payload.start_page || 'Timeline');
        navigate(target, { replace: true });
      }

      return created;
    },
    [navigate],
  );

  const logout = useCallback(async () => {
    clearStoredUser();
    setUser(null);
    await User.logout();
    navigate(createPageUrl('Login'), { replace: true });
  }, [navigate]);

  const refreshUser = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth moet binnen een AuthProvider worden gebruikt');
  }
  return context;
};
