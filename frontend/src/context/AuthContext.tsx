'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'reader' | 'author' | 'admin' | 'superadmin';
  isSubscribed: boolean;
  referralCode: string;
  avatar?: string;
  streakCount?: number;
  referredCount?: number;
  completedOnboarding?: boolean;
  onboardingCompleted?: boolean;
  founderRole?: string;
  startupStage?: string;
  interests?: string[];
  goals?: string[];
  contentPreferences?: string[];
  themePreference?: 'light' | 'dark' | 'system';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (name: string, email: string, password?: string, referredBy?: string) => Promise<boolean>;
  googleLogin: (name: string, email: string, googleId: string, avatar?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (name: string, avatar: string, password?: string) => Promise<boolean>;
  refreshUserStats: () => Promise<void>;
  triggerMockSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const shouldFallbackToMock = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return !error.response;
  }
  return true;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize from LocalStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('deven_token');
    const savedUser = localStorage.getItem('deven_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Update Authorization header on axios
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // LOGIN
  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token: userToken, user: userData } = res.data;

      localStorage.setItem('deven_token', userToken);
      localStorage.setItem('deven_user', JSON.stringify(userData));
      setToken(userToken);
      setUser(userData);
      return true;
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        return false;
      }
      console.warn('Backend API connection failed. Simulating login locally for developer.', error);
      
      // Mock Fallback Logins
      let mockRole: 'reader' | 'superadmin' = 'reader';
      let mockName = 'Alex Reader';
      let mockReferral = 'ALEX99';
      let mockAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80';
      let mockSub = false;

      if (email.toLowerCase().includes('admin')) {
        mockRole = 'superadmin';
        mockName = 'Deven Admin';
        mockReferral = 'DEVEN100';
        mockAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80';
        mockSub = true;
      }

      const mockUser: User = {
        id: `mock-user-id-${mockRole}`,
        name: mockName,
        email: email.toLowerCase(),
        role: mockRole,
        isSubscribed: mockSub,
        referralCode: mockReferral,
        avatar: mockAvatar,
        streakCount: mockRole === 'superadmin' ? 12 : 3,
        referredCount: mockRole === 'superadmin' ? 4 : 0,
        completedOnboarding: mockRole === 'superadmin',
        onboardingCompleted: mockRole === 'superadmin'
      };

      const mockToken = `mock-token-${mockUser.id}`;
      localStorage.setItem('deven_token', mockToken);
      localStorage.setItem('deven_user', JSON.stringify(mockUser));
      setToken(mockToken);
      setUser(mockUser);
      return true;
    }
  };

  // SIGNUP
  const signup = async (name: string, email: string, password?: string, referredBy?: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${API_URL}/auth/signup`, { name, email, password, referredBy });
      const { token: userToken, user: userData } = res.data;

      localStorage.setItem('deven_token', userToken);
      localStorage.setItem('deven_user', JSON.stringify(userData));
      setToken(userToken);
      setUser(userData);
      return true;
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        return false;
      }
      console.warn('Backend signup connection failed. Simulating local signup.', error);
      const mockUser: User = {
        id: `mock-user-id-${Date.now()}`,
        name,
        email: email.toLowerCase(),
        role: 'reader',
        isSubscribed: false,
        referralCode: `${name.replace(/\s+/g, '').substring(0, 4).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        streakCount: 0,
        referredCount: 0,
        completedOnboarding: false,
        onboardingCompleted: false
      };
      const mockToken = `mock-token-${mockUser.id}`;
      localStorage.setItem('deven_token', mockToken);
      localStorage.setItem('deven_user', JSON.stringify(mockUser));
      setToken(mockToken);
      setUser(mockUser);
      return true;
    }
  };

  // GOOGLE LOGIN
  const googleLogin = async (name: string, email: string, googleId: string, avatar?: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${API_URL}/auth/google`, { name, email, googleId, avatar });
      const { token: userToken, user: userData } = res.data;

      localStorage.setItem('deven_token', userToken);
      localStorage.setItem('deven_user', JSON.stringify(userData));
      setToken(userToken);
      setUser(userData);
      return true;
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        return false;
      }
      console.warn('Google login connection failed. Running in simulated fallback mode.', error);
      return await login(email);
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem('deven_token');
    localStorage.removeItem('deven_user');
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

  // UPDATE PROFILE
  const updateProfile = async (name: string, avatar: string, password?: string): Promise<boolean> => {
    try {
      const res = await axios.put(`${API_URL}/users/profile`, { name, avatar, password });
      const updatedUser = { ...user, name, avatar } as User;
      localStorage.setItem('deven_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return true;
    } catch (error) {
      if (user) {
        const updatedUser = { ...user, name, avatar };
        localStorage.setItem('deven_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return true;
      }
      return false;
    }
  };

  // REFRESH METRICS & STREAKS
  const refreshUserStats = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/users/dashboard`);
      const { user: userData } = res.data;
      localStorage.setItem('deven_user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.log('Unable to sync metrics from backend. Using current state.', error);
    }
  };

  // DEVELOPER SHORTCUT TO UPGRADE TO PREMIUM
  const triggerMockSubscription = async () => {
    if (!user) return;
    try {
      const res = await axios.post(`${API_URL}/payments/mock-upgrade`);
      const updatedUser = { ...user, isSubscribed: true };
      localStorage.setItem('deven_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      if (token && token.startsWith('mock-token-')) {
        const upgradedToken = `mock-token-${user.id}`;
        localStorage.setItem('deven_token', upgradedToken);
        setToken(upgradedToken);
      }
    } catch (error) {
      // Offline fallback upgrade
      const updatedUser = { ...user, isSubscribed: true };
      localStorage.setItem('deven_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      if (token && token.startsWith('mock-token-')) {
        const upgradedToken = `mock-token-${user.id}`;
        localStorage.setItem('deven_token', upgradedToken);
        setToken(upgradedToken);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        googleLogin,
        logout,
        updateProfile,
        refreshUserStats,
        triggerMockSubscription
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
