'use client';

import { create } from 'zustand';
import { db } from '@/lib/db/indexed-db';

interface IPTrackerState {
  searchHistory: string[];
  addToHistory: (ip: string) => void;
  clearHistory: () => void;
  loadHistory: () => Promise<void>;
}

export const useIPTrackerStore = create<IPTrackerState>((set, get) => ({
  searchHistory: [],

  addToHistory: async (ip: string) => {
    const currentHistory = get().searchHistory;
    const newHistory = [ip, ...currentHistory.filter(i => i !== ip)].slice(0, 5);
    set({ searchHistory: newHistory });
    await db.set('ipTracker', 'searchHistory', newHistory);
  },

  clearHistory: async () => {
    set({ searchHistory: [] });
    await db.set('ipTracker', 'searchHistory', []);
  },

  loadHistory: async () => {
    const history = await db.get<string[]>('ipTracker', 'searchHistory');
    if (history) {
      set({ searchHistory: history });
    }
  },
})); 