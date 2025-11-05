import React, { createContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: ThemeMode;
  effectiveTheme: 'light' | 'dark'; // O tema efetivo aplicado (light ou dark)
  setTheme: (theme: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    return savedTheme || 'light';
  });

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  // Detectar preferência do sistema
  const getSystemTheme = (): 'light' | 'dark' => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  useEffect(() => {
    // Determinar qual tema aplicar
    let appliedTheme: 'light' | 'dark' = 'light';
    
    if (theme === 'system') {
      appliedTheme = getSystemTheme();
    } else {
      appliedTheme = theme;
    }

    setEffectiveTheme(appliedTheme);

    // Aplicar tema ao documento
    const root = document.documentElement;
    
    if (appliedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Salvar preferência
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listener para mudanças na preferência do sistema
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setEffectiveTheme(newSystemTheme);
      
      const root = document.documentElement;
      if (newSystemTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const value: ThemeContextValue = {
    theme,
    effectiveTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

