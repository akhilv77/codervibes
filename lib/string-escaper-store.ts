'use client';

import { create } from 'zustand';
import { db } from '@/lib/db/indexed-db';

interface HistoryItem {
  id: string;
  inputText: string;
  escapedText: string;
  type: string;
  timestamp: number;
}

interface StringEscaperState {
  inputText: string;
  escapedText: string;
  selectedType: string;
  history: HistoryItem[];
  setInputText: (text: string) => void;
  setEscapedText: (text: string) => void;
  setSelectedType: (type: string) => void;
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
  reset: () => void;
  loadHistory: () => Promise<void>;
  initialize: () => Promise<void>;
}

const initialState = {
  inputText: '',
  escapedText: '',
  selectedType: 'javascript',
  history: [],
};

export const useStringEscaperStore = create<StringEscaperState>()((set) => ({
  ...initialState,

  setInputText: (inputText) => set({ inputText }),
  setEscapedText: (escapedText) => set({ escapedText }),
  setSelectedType: (selectedType) => set({ selectedType }),

  initialize: async () => {
    try {
      await db.init();
      const history = (await db.get<HistoryItem[]>('stringEscaper', 'history')) || [];
      set({ history });
    } catch (error) {
      console.error('Error initializing string escaper store:', error);
      set({ history: [] });
    }
  },

  addToHistory: async (item) => {
    try {
      await db.init();
      set((state) => {
        const newHistory = [
          {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            ...item,
          },
          ...state.history,
        ].slice(0, 10);
        db.set('stringEscaper', 'history', newHistory);
        return { history: newHistory };
      });
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  },

  clearHistory: async () => {
    try {
      await db.init();
      set({ history: [] });
      await db.delete('stringEscaper', 'history');
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  },

  removeFromHistory: async (id) => {
    try {
      await db.init();
      set((state) => {
        const newHistory = state.history.filter((item) => item.id !== id);
        db.set('stringEscaper', 'history', newHistory);
        return { history: newHistory };
      });
    } catch (error) {
      console.error('Error removing from history:', error);
    }
  },

  reset: () => set(initialState),

  loadHistory: async () => {
    try {
      await db.init();
      const history = (await db.get<HistoryItem[]>('stringEscaper', 'history')) || [];
      set({ history });
    } catch (error) {
      console.error('Error loading string escaper history:', error);
      set({ history: [] });
    }
  },
})); 