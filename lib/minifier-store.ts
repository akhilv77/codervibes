'use client';

import { create } from 'zustand';
import { db } from '@/lib/db/indexed-db';

interface MinifierHistory {
    original: string;
    minified: string;
    type: 'html' | 'css' | 'js';
    timestamp: string;
}

interface MinifierState {
    history: MinifierHistory[];
    addToHistory: (item: MinifierHistory) => void;
    clearHistory: () => void;
    loadHistory: () => Promise<void>;
}

const STORAGE_KEY = 'minifier-history';
const MAX_HISTORY_ITEMS = 10;

export const useMinifierStore = create<MinifierState>((set) => ({
    history: [],
    addToHistory: async (item: MinifierHistory) => {
        set((state) => {
            const newHistoryList = [item, ...state.history].slice(0, MAX_HISTORY_ITEMS);
            return { history: newHistoryList };
        });

        try {
            const currentHistory = await db.get<MinifierHistory[]>('minifier', STORAGE_KEY) || [];
            const updatedHistory = [item, ...currentHistory].slice(0, MAX_HISTORY_ITEMS);
            await db.set('minifier', STORAGE_KEY, updatedHistory);
        } catch (error) {
            console.error('Error saving to IndexedDB:', error);
        }
    },
    clearHistory: async () => {
        set({ history: [] });
        try {
            await db.delete('minifier', STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing IndexedDB:', error);
        }
    },
    loadHistory: async () => {
        try {
            const history = await db.get<MinifierHistory[]>('minifier', STORAGE_KEY) || [];
            set({ history: history.slice(0, MAX_HISTORY_ITEMS) });
        } catch (error) {
            console.error('Error loading from IndexedDB:', error);
        }
    },
})); 