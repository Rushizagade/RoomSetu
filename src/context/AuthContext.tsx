import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole } from '../types/index.ts';
import { api } from '../services/api.ts';

export type AuthView =
  | 'AUTH_LANDING'
  | 'USER_LOGIN'
  | 'USER_REGISTER'
  | 'OWNER_LOGIN'
  | 'OWNER_REGISTER'
  | 'ADMIN_LOGIN'
  | 'ADMIN_PORTAL'
  | 'BROWSE_ROOMS'
  | 'MAIN_APP';

export type AuthMode = 'LOGIN' | 'REGISTER';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | 'GUEST';
  token: string | null;
  isLoading: boolean;
  currentView: AuthView;
  authMode: AuthMode;
  isAuthModalOpen: boolean;
  authModalInitialRole: 'USER' | 'ROOM_OWNER' | 'ADMIN';
  authModalInitialMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  navigateTo: (view: AuthView, mode?: AuthMode) => void;
  openAuthModal: (initialRole?: 'USER' | 'ROOM_OWNER' | 'ADMIN', initialMode?: AuthMode) => void;
  closeAuthModal: () => void;
  loginWithOtp: (phone: string, role: 'USER' | 'ROOM_OWNER', code: string, name?: string) => Promise<void>;
  loginAdmin: (email: string, pass: string) => Promise<void>;
  switchRole: (targetRole: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('roomsetu_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AuthView>('AUTH_LANDING');
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialRole, setAuthModalInitialRole] = useState<'USER' | 'ROOM_OWNER' | 'ADMIN'>('USER');
  const [authModalInitialMode, setAuthModalInitialMode] = useState<AuthMode>('LOGIN');

  const role: UserRole | 'GUEST' = user ? user.role : 'GUEST';

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        // Not logged in by default - clean state
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        setUser(res.user);
        setCurrentView('MAIN_APP');
      } catch (err) {
        // Expired or invalid token, clear it and keep unauthenticated
        localStorage.removeItem('roomsetu_token');
        setToken(null);
        setUser(null);
        setCurrentView('AUTH_LANDING');
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const navigateTo = (view: AuthView, mode?: AuthMode) => {
    if (mode) setAuthMode(mode);
    setCurrentView(view);
  };

  const openAuthModal = (
    initialRole: 'USER' | 'ROOM_OWNER' | 'ADMIN' = 'USER',
    initialMode: AuthMode = 'LOGIN'
  ) => {
    setAuthModalInitialRole(initialRole);
    setAuthModalInitialMode(initialMode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const loginWithOtp = async (phone: string, roleType: 'USER' | 'ROOM_OWNER', code: string, name?: string) => {
    const res = await api.verifyOtp(phone, roleType, code, name);
    setToken(res.token);
    localStorage.setItem('roomsetu_token', res.token);
    setUser(res.user);
    setCurrentView('MAIN_APP');
    setIsAuthModalOpen(false);
  };

  const loginAdmin = async (email: string, pass: string) => {
    const res = await api.adminLogin(email, pass);
    setToken(res.token);
    localStorage.setItem('roomsetu_token', res.token);
    setUser(res.user);
    setCurrentView('MAIN_APP');
    setIsAuthModalOpen(false);
  };

  const switchRole = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      const res = await api.demoSwitch(targetRole);
      setToken(res.token);
      localStorage.setItem('roomsetu_token', res.token);
      setUser(res.user);
      setCurrentView('MAIN_APP');
      setIsAuthModalOpen(false);
    } catch (err) {
      console.error('Failed to switch role', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('roomsetu_token');
    setToken(null);
    setUser(null);
    setCurrentView('AUTH_LANDING');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isLoading,
        currentView,
        authMode,
        isAuthModalOpen,
        authModalInitialRole,
        authModalInitialMode,
        setAuthMode,
        navigateTo,
        openAuthModal,
        closeAuthModal,
        loginWithOtp,
        loginAdmin,
        switchRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
