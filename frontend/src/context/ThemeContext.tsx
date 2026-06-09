'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const THEME_STORAGE_KEY = 'deven_theme';

const isTheme = (value: unknown): value is Theme =>
  value === 'light' || value === 'dark' || value === 'system';

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'dark';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (isTheme(savedTheme)) {
    return savedTheme;
  }

  if (savedTheme) {
    localStorage.removeItem(THEME_STORAGE_KEY);
  }

  return 'system';
};

const syncDocumentTheme = (nextTheme: 'light' | 'dark') => {
  if (typeof window === 'undefined') {
    return;
  }

  const root = window.document.documentElement;

  root.classList.toggle('dark', nextTheme === 'dark');
  root.classList.toggle('light', nextTheme === 'light');
  root.dataset.theme = nextTheme;
  root.style.colorScheme = nextTheme;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme);
  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  // Load theme preference on mount & when user updates
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const profileTheme = user?.themePreference;
    let updateTimer: number | undefined;

    if (savedTheme && !isTheme(savedTheme)) {
      localStorage.removeItem(THEME_STORAGE_KEY);
    }

    if (!isTheme(savedTheme) && isTheme(profileTheme)) {
      syncDocumentTheme(profileTheme === 'system' ? getSystemTheme() : profileTheme);
      updateTimer = window.setTimeout(() => {
        setThemeState(profileTheme);
      }, 0);
    }

    return () => {
      if (updateTimer) {
        window.clearTimeout(updateTimer);
      }
    };
  }, [user?.themePreference]);

  // Sync with device preferences and apply theme classes
  useEffect(() => {
    syncDocumentTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    if (theme === 'system') {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      };
    }
  }, [theme]);

  // Save theme function
  const setTheme = async (newTheme: Theme) => {
    if (!isTheme(newTheme)) {
      return;
    }

    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    if (newTheme === 'system') {
      const nextSystemTheme = getSystemTheme();
      setSystemTheme(nextSystemTheme);
      syncDocumentTheme(nextSystemTheme);
    } else {
      syncDocumentTheme(newTheme);
    }
    
    // Save to user profile in DB if logged in
    if (token) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.put(`${API_URL}/users/theme`, { themePreference: newTheme }, config);
      } catch (err) {
        console.warn('Could not sync theme preference with backend server.', err);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
