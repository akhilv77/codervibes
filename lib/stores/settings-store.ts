import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { db } from '@/lib/db/indexed-db';

interface Settings {
  theme: 'light' | 'dark' | 'system';
  preferredSound: string;
  preferredVolume: number;
  autoPlaySound: boolean;
}

interface SettingsStore {
  settings: Settings;
  setSettings: (settings: Partial<Settings>) => Promise<void>;
  initialize: () => Promise<void>;
}

const defaultSettings: Settings = {
  theme: 'system',
  preferredSound: 'rain',
  preferredVolume: 0.5,
  autoPlaySound: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      setSettings: async (newSettings) => {
        const currentSettings = await db.get('settings', 'settings') || defaultSettings;
        const updatedSettings = { ...currentSettings, ...newSettings } as Settings;
        await db.set('settings', 'settings', updatedSettings);
        set({ settings: updatedSettings });
      },
      initialize: async () => {
        try {
          const settings = await db.get('settings', 'settings');
          if (settings) {
            set({ settings: settings as Settings });
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
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name) => {
          const value = await db.get('settings', name);
          return value ? JSON.stringify(value) : null;
        },
        setItem: async (name, value) => {
          await db.set('settings', name, JSON.parse(value));
        },
        removeItem: async (name) => {
          await db.delete('settings', name);
        },
      })),
    }
  )
); 