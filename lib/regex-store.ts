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
        set((state) => {
            const newHistory = [
                { pattern, flags, timestamp: Date.now() },
                ...state.history.filter(item => item.pattern !== pattern || item.flags !== flags)
            ].slice(0, 10);
            db.set('regexTester', 'history', newHistory);
            return { history: newHistory };
        });
    },

    clearHistory: async () => {
        set({ history: [] });
        await db.delete('regexTester', 'history');
    },

    loadHistory: async () => {
        try {
            const history = (await db.get<RegexHistory[]>('regexTester', 'history')) || [];
            set({ history });
        } catch (error) {
            console.error('Error loading regex history:', error);
            set({ history: [] });
        }
    },
})); 