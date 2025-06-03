import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  favoriteApps: string[]; // Array of app IDs
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  toggleFavoriteApp: (appId: string) => void;
  isAppFavorite: (appId: string) => boolean;
}

const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      fontSize: 'medium',
      favoriteApps: [],
      setTheme: (theme: 'light' | 'dark' | 'system') => set({ theme }),
      setFontSize: (size: 'small' | 'medium' | 'large') => set({ fontSize: size }),
      toggleFavoriteApp: (appId: string) => set((state: SettingsState) => ({
        favoriteApps: state.favoriteApps.includes(appId)
          ? state.favoriteApps.filter((id: string) => id !== appId)
          : [...state.favoriteApps, appId]
      })),
      isAppFavorite: (appId: string) => get().favoriteApps.includes(appId),
    }),
    {
      name: 'codervibes-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export { useSettingsStore }; 