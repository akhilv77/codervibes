'use client';

import { create } from 'zustand';
import { db } from '@/lib/db/indexed-db';

interface TextHistory {
    type: string;
    from: string;
    to: string;
    timestamp: number;
}

interface TextConverterState {
    history: TextHistory[];
    addToHistory: (type: string, from: string, to: string) => void;
    clearHistory: () => void;
    loadHistory: () => Promise<void>;
}

export const useTextConverterStore = create<TextConverterState>((set) => ({
    history: [],

    addToHistory: async (type: string, from: string, to: string) => {
        set((state) => {
            const newHistory = [
                { type, from, to, timestamp: Date.now() },
                ...state.history
            ].slice(0, 10);
            db.set('textConverter', 'history', newHistory);
            return { history: newHistory };
        });
    },

    clearHistory: async () => {
        set({ history: [] });
        await db.delete('textConverter', 'history');
    },

    loadHistory: async () => {
        try {
            const history = (await db.get<TextHistory[]>('textConverter', 'history')) || [];
            set({ history });
        } catch (error) {
            console.error('Error loading text converter history:', error);
            set({ history: [] });
        }
    },
})); 