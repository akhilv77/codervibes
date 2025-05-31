'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface MusicContextType {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  currentSound: string | null;
  setCurrentSound: (sound: string | null) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState<string | null>(null);

  return (
    <MusicContext.Provider value={{ isPlaying, setIsPlaying, currentSound, setCurrentSound }}>
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