"use client";

import * as React from "react";
import { useSettingsStore } from '@/lib/stores/settings-store';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'system',
  enableSystem = true,
  disableTransitionOnChange = true
}: ThemeProviderProps) {
  const { settings, setSettings } = useSettingsStore();
  const [mounted, setMounted] = React.useState(false);

  // Initialize theme on mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = async (theme: Theme) => {
    await setSettings({ theme });
    // Update the document class for immediate effect
    if (theme === 'system' && enableSystem) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(systemTheme);
    } else {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    }
  };

  // Handle system theme changes
  React.useEffect(() => {
    if (settings.theme === 'system' && enableSystem) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme, enableSystem]);

  // Set initial theme
  React.useEffect(() => {
    if (mounted) {
      if (settings.theme === 'system' && enableSystem) {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.classList.add(systemTheme);
      } else {
        document.documentElement.classList.add(settings.theme);
      }
    }
  }, [mounted, settings.theme, enableSystem]);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme: settings.theme, setTheme: handleThemeChange }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}