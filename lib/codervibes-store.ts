import { create } from 'zustand';
import { db } from './db/indexed-db';

interface Settings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  favoriteApps: string[];
}

interface SettingsState extends Settings {
  setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
  setFontSize: (size: 'small' | 'medium' | 'large') => Promise<void>;
  toggleFavoriteApp: (appId: string) => Promise<void>;
  isAppFavorite: (appId: string) => boolean;
  initialize: () => Promise<void>;
}

const defaultSettings: Settings = {
  theme: 'system',
  fontSize: 'medium',
  favoriteApps: [],
};

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  ...defaultSettings,
  setTheme: async (theme) => {
    const currentSettings = await db.get<Settings>('settings', 'settings') || defaultSettings;
    const updatedSettings = { ...currentSettings, theme };
    await db.set('settings', 'settings', updatedSettings);
    set({ theme });
  },
  setFontSize: async (fontSize) => {
    const currentSettings = await db.get<Settings>('settings', 'settings') || defaultSettings;
    const updatedSettings = { ...currentSettings, fontSize };
    await db.set('settings', 'settings', updatedSettings);
    set({ fontSize });
  },
  toggleFavoriteApp: async (appId) => {
    try {
      const currentSettings = await db.get<Settings>('settings', 'settings') || defaultSettings;
      const currentFavorites = currentSettings.favoriteApps || [];
      const favoriteApps = currentFavorites.includes(appId)
        ? currentFavorites.filter((id: string) => id !== appId)
        : [...currentFavorites, appId];
      
      const updatedSettings = { ...currentSettings, favoriteApps };
      await db.set('settings', 'settings', updatedSettings);
      set({ favoriteApps });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Fallback to local state update if DB operation fails
      const currentFavorites = get().favoriteApps || [];
      const favoriteApps = currentFavorites.includes(appId)
        ? currentFavorites.filter((id: string) => id !== appId)
        : [...currentFavorites, appId];
      set({ favoriteApps });
    }
  },
  isAppFavorite: (appId) => {
    const favoriteApps = get().favoriteApps || [];
    return favoriteApps.includes(appId);
  },
  initialize: async () => {
    try {
      const settings = await db.get<Settings>('settings', 'settings');
      if (settings) {
        // Ensure favoriteApps exists
        const updatedSettings = {
          ...settings,
          favoriteApps: settings.favoriteApps || [],
        };
        set(updatedSettings);
      } else {
        // Initialize with default settings if none exist
        await db.set('settings', 'settings', defaultSettings);
        set(defaultSettings);
      }
    } catch (error) {
      console.error('Error initializing settings:', error);
      set(defaultSettings);
    }
  },
})); 