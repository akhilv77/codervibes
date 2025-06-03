'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSettingsStore } from '@/lib/stores/settings-store';

const AMBIENT_SOUNDS = {
  rain: {
    name: 'Rain',
    url: '/sounds/rain.mp3',
    icon: '🌧️',
  },
  forest: {
    name: 'Forest',
    url: '/sounds/forest.mp3',
    icon: '🌲',
  },
  water: {
    name: 'Water',
    url: '/sounds/water.mp3',
    icon: '💧',
  },
  waves: {
    name: 'Waves',
    url: '/sounds/waves.mp3',
    icon: '🌊',
  },
  fire: {
    name: 'Crackling Fire',
    url: '/sounds/fire.mp3',
    icon: '🔥',
  },
} as const;

type SoundKey = keyof typeof AMBIENT_SOUNDS;

interface MusicContextType {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  currentSound: SoundKey | null;
  setCurrentSound: (sound: SoundKey) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState<SoundKey | null>(null);
  const { settings, initialize } = useSettingsStore();

  // Initialize settings store
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Set initial sound from settings
  useEffect(() => {
    if (settings?.preferredSound && !currentSound) {
      const soundKey = settings.preferredSound as SoundKey;
      if (soundKey in AMBIENT_SOUNDS) {
        setCurrentSound(soundKey);
      } else {
        setCurrentSound('rain');
      }
    }
  }, [settings?.preferredSound, currentSound]);

  // Handle auto-play
  useEffect(() => {
    if (settings?.autoPlaySound && currentSound) {
      setIsPlaying(true);
    }
  }, [settings?.autoPlaySound, currentSound]);

  return (
    <MusicContext.Provider
      value={{
        isPlaying,
        setIsPlaying,
        currentSound,
        setCurrentSound,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
} 