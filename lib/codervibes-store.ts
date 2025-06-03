import { create } from 'zustand';
import { db } from './db/indexed-db';

interface Settings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  favoriteApps: string[];
  preferredSound: string;
  preferredVolume: number;
  autoPlaySound: boolean;
  urlEncoder: {
    history: UrlHistory[];
  };
  timeConversion: {
    history: TimestampHistory[];
  };
}

interface UrlHistory {
  original: string;
  encoded: string;
  timestamp: number;
}

interface TimestampHistory {
  timestamp: number;
  date: string;
  format: string;
  timezone: string;
}

interface SettingsState {
  settings: Settings;
  setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
  setFontSize: (size: 'small' | 'medium' | 'large') => Promise<void>;
  toggleFavoriteApp: (appId: string) => Promise<void>;
  isAppFavorite: (appId: string) => boolean;
  setSettings: (settings: Partial<Settings>) => Promise<void>;
  initialize: () => Promise<void>;
}

const defaultSettings: Settings = {
  theme: 'system',
  fontSize: 'medium',
  favoriteApps: [],
  preferredSound: 'rain',
  preferredVolume: 0.5,
  autoPlaySound: false,
  urlEncoder: {
    history: []
  },
  timeConversion: {
    history: []
  }
};

// Helper function to validate volume
const validateVolume = (volume: number): number => {
  if (typeof volume !== 'number' || !isFinite(volume)) {
    return defaultSettings.preferredVolume;
  }
  return Math.max(0, Math.min(1, volume));
};

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  settings: defaultSettings,
  setTheme: async (theme) => {
    try {
      await db.init();
      const currentSettings = await db.get<Settings>('settings', 'settings') || defaultSettings;
      const updatedSettings = { ...currentSettings, theme };
      await db.set('settings', 'settings', updatedSettings);
      set({ settings: updatedSettings });
    } catch (error) {
      console.error('Error setting theme:', error);
      set((state) => ({ settings: { ...state.settings, theme } }));
    }
  },
  setFontSize: async (fontSize) => {
    try {
      await db.init();
      const currentSettings = await db.get<Settings>('settings', 'settings') || defaultSettings;
      const updatedSettings = { ...currentSettings, fontSize };
      await db.set('settings', 'settings', updatedSettings);
      set({ settings: updatedSettings });
    } catch (error) {
      console.error('Error setting font size:', error);
      set((state) => ({ settings: { ...state.settings, fontSize } }));
    }
  },
  toggleFavoriteApp: async (appId) => {
    try {
      await db.init();
      const currentSettings = await db.get<Settings>('settings', 'settings') || defaultSettings;
      const currentFavorites = currentSettings.favoriteApps || [];
      const favoriteApps = currentFavorites.includes(appId)
        ? currentFavorites.filter((id: string) => id !== appId)
        : [...currentFavorites, appId];
      
      const updatedSettings = { ...currentSettings, favoriteApps };
      await db.set('settings', 'settings', updatedSettings);
      set({ settings: updatedSettings });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Fallback to local state update if DB operation fails
      set((state) => {
        const currentFavorites = state.settings.favoriteApps || [];
        const favoriteApps = currentFavorites.includes(appId)
          ? currentFavorites.filter((id: string) => id !== appId)
          : [...currentFavorites, appId];
        return { settings: { ...state.settings, favoriteApps } };
      });
    }
  },
  isAppFavorite: (appId) => {
    const favoriteApps = get().settings.favoriteApps || [];
    return favoriteApps.includes(appId);
  },
  setSettings: async (newSettings) => {
    try {
      await db.init();
      const currentSettings = await db.get<Settings>('settings', 'settings') || defaultSettings;
      const updatedSettings = { 
        ...currentSettings, 
        ...newSettings,
        // Validate volume if it's being updated
        preferredVolume: newSettings.preferredVolume !== undefined 
          ? validateVolume(newSettings.preferredVolume)
          : currentSettings.preferredVolume
      };
      await db.set('settings', 'settings', updatedSettings);
      set({ settings: updatedSettings });
    } catch (error) {
      console.error('Error updating settings:', error);
      // Fallback to local state update if DB operation fails
      set((state) => ({
        settings: { 
          ...state.settings, 
          ...newSettings,
          // Validate volume if it's being updated
          preferredVolume: newSettings.preferredVolume !== undefined 
            ? validateVolume(newSettings.preferredVolume)
            : state.settings.preferredVolume
        }
      }));
    }
  },
  initialize: async () => {
    try {
      await db.init();
      const existingSettings = await db.get<Settings>('settings', 'settings');
      if (existingSettings) {
        // If we have existing settings, use them
        set({ settings: existingSettings });
      } else {
        // Only set default settings if no settings exist
        await db.set('settings', 'settings', defaultSettings);
        set({ settings: defaultSettings });
      }
    } catch (error) {
      console.error('Error initializing settings:', error);
      set({ settings: defaultSettings });
    }
  },
})); 