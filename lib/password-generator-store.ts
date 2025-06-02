import { create } from 'zustand';
import { db } from './db/indexed-db';

interface PasswordSettings {
    length: number;
    includeUppercase: boolean;
    includeLowercase: boolean;
    includeNumbers: boolean;
    includeSymbols: boolean;
}

interface PasswordGeneratorStore {
    settings: PasswordSettings;
    updateSettings: (settings: PasswordSettings) => Promise<void>;
    loadSettings: () => Promise<void>;
}

const SETTINGS_KEY = 'settings';

const DEFAULT_SETTINGS: PasswordSettings = {
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
};

export const usePasswordGeneratorStore = create<PasswordGeneratorStore>((set, get) => ({
    settings: DEFAULT_SETTINGS,
    updateSettings: async (newSettings: PasswordSettings) => {
        try {
            // Update the state immediately for better UX
            set({ settings: newSettings });
            
            // Then persist to IndexedDB
            await db.set('passwordGenerator', SETTINGS_KEY, newSettings);
        } catch (error) {
            console.error('Error updating settings:', error);
            // Revert to previous settings if there's an error
            const currentSettings = get().settings;
            set({ settings: currentSettings });
        }
    },
    loadSettings: async () => {
        try {
            const settings = await db.get<PasswordSettings>('passwordGenerator', SETTINGS_KEY);
            if (settings) {
                set({ settings });
            } else {
                // If no settings are found, use default settings
                set({ settings: DEFAULT_SETTINGS });
                await db.set('passwordGenerator', SETTINGS_KEY, DEFAULT_SETTINGS);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            // Use default settings if there's an error
            set({ settings: DEFAULT_SETTINGS });
        }
    },
})); 