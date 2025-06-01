'use client';

import { create } from 'zustand';
import { db } from '@/lib/db/indexed-db';

interface IPTrackerState {
  searchHistory: string[];
  addToHistory: (ip: string) => void;
  clearHistory: () => void;
  loadHistory: () => Promise<void>;
}

export const useIPTrackerStore = create<IPTrackerState>((set) => ({
  searchHistory: [],

  addToHistory: async (ip: string) => {
    set((state) => {
      const updatedHistory = [ip, ...state.searchHistory.filter(item => item !== ip)].slice(0, 10);
      db.set('ipTracker', 'history', updatedHistory);
      return { searchHistory: updatedHistory };
    });
  },

  clearHistory: async () => {
    set({ searchHistory: [] });
    await db.delete('ipTracker', 'history');
  },

  loadHistory: async () => {
    try {
      const history = (await db.get<string[]>('ipTracker', 'history')) || [];
      set({ searchHistory: history });
    } catch (error) {
      console.error('Error loading IP history:', error);
      set({ searchHistory: [] });
    }
  },
})); 