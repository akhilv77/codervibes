'use client';

import { create } from 'zustand';
import { db } from '@/lib/db/indexed-db';

interface CSVHistory {
    type: string;
    from: string;
    to: string;
    timestamp: number;
}

interface CSVConverterState {
    history: CSVHistory[];
    addToHistory: (type: string, from: string, to: string) => void;
    clearHistory: () => void;
    loadHistory: () => Promise<void>;
}

export const useCSVConverterStore = create<CSVConverterState>((set) => ({
    history: [],

    addToHistory: async (type: string, from: string, to: string) => {
        set((state) => {
            const newHistory = [
                { type, from, to, timestamp: Date.now() },
                ...state.history
            ].slice(0, 10);
            db.set('csvConverter', 'history', newHistory);
            return { history: newHistory };
        });
    },

    clearHistory: async () => {
        set({ history: [] });
        await db.delete('csvConverter', 'history');
    },

    loadHistory: async () => {
        try {
            const history = (await db.get<CSVHistory[]>('csvConverter', 'history')) || [];
            set({ history });
        } catch (error) {
            console.error('Error loading CSV converter history:', error);
            set({ history: [] });
        }
    },
})); 