'use client';

import { create } from 'zustand';
import { db } from '@/lib/db/indexed-db';

interface URLHistory {
    type: string;
    result: string;
    timestamp: number;
}

interface URLEncoderState {
    history: URLHistory[];
    addToHistory: (type: string, result: string) => void;
    clearHistory: () => void;
    loadHistory: () => Promise<void>;
}

export const useURLEncoderStore = create<URLEncoderState>((set) => ({
    history: [],

    addToHistory: async (type: string, result: string) => {
        set((state) => {
            const newHistory = [
                { type, result, timestamp: Date.now() },
                ...state.history
            ].slice(0, 10);
            db.set('urlEncoder', 'history', newHistory);
            return { history: newHistory };
        });
    },

    clearHistory: async () => {
        set({ history: [] });
        await db.delete('urlEncoder', 'history');
    },

    loadHistory: async () => {
        try {
            const history = (await db.get<URLHistory[]>('urlEncoder', 'history')) || [];
            set({ history });
        } catch (error) {
            console.error('Error loading URL encoder history:', error);
            set({ history: [] });
        }
    },
})); 