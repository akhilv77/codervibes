import { create } from 'zustand';
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

// Helper function to validate volume
const validateVolume = (volume: number): number => {
  if (typeof volume !== 'number' || !isFinite(volume)) {
    return defaultSettings.preferredVolume;
  }
  return Math.max(0, Math.min(1, volume));
};

export const useSettingsStore = create<SettingsStore>()((set) => ({
  settings: defaultSettings,
  setSettings: async (newSettings) => {
    try {
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
      const settings = await db.get<Settings>('settings', 'settings');
      if (settings) {
        // Validate volume when initializing
        set({ 
          settings: {
            ...settings,
            preferredVolume: validateVolume(settings.preferredVolume)
          }
        });
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