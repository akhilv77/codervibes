'use client';

import { create } from 'zustand';
import { db } from '@/lib/db/indexed-db';

interface RegexHistory {
    pattern: string;
    flags: string;
    timestamp: number;
}

interface RegexState {
    history: RegexHistory[];
    addToHistory: (pattern: string, flags: string) => void;
    clearHistory: () => void;
    loadHistory: () => Promise<void>;
}

export const useRegexStore = create<RegexState>((set) => ({
    history: [],

    addToHistory: async (pattern: string, flags: string) => {
        const newEntry: RegexHistory = {
            pattern,
            flags,
            timestamp: Date.now()
        };

        set((state) => {
            const updatedHistory = [newEntry, ...state.history].slice(0, 10); // Keep last 10 entries
            db.set('regex', 'history', updatedHistory);
            return { history: updatedHistory };
        });
    },

    clearHistory: async () => {
        set({ history: [] });
        await db.delete('regex', 'history');
    },

    loadHistory: async () => {
        try {
            const history = await db.get('regex', 'history') || [];
            set({ history });
        } catch (error) {
            console.error('Error loading regex history:', error);
            set({ history: [] });
        }
    }
})); 