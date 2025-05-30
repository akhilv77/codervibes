import { create } from 'zustand';
import { db } from '@/lib/db/indexed-db';

interface Settings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
}

interface SettingsStore {
  settings: Settings;
  setSettings: (settings: Partial<Settings>) => void;
  initialize: () => Promise<void>;
}

const defaultSettings: Settings = {
  theme: 'system',
  language: 'en',
  notifications: true,
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: defaultSettings,
  setSettings: async (newSettings) => {
    set((state) => {
      const updatedSettings = { ...state.settings, ...newSettings };
      // Save to IndexedDB
      db.set('settings', 'settings', updatedSettings).catch(console.error);
      return { settings: updatedSettings };
    });
  },
  initialize: async () => {
    try {
      const storedSettings = await db.get('settings', 'settings');
      if (storedSettings) {
        set({ settings: storedSettings as Settings });
      } else {
        // Initialize with default settings if none exist
        await db.set('settings', 'settings', defaultSettings);
        set({ settings: defaultSettings });
      }
    } catch (error) {
      console.error('Error initializing settings:', error);
      set({ settings: defaultSettings });
    }
  },
})); 