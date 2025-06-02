'use client';

import { create } from 'zustand';
import { db } from '@/lib/db/indexed-db';

interface HashHistory {
    type: string;
    result: string;
    timestamp: number;
}

interface HashGeneratorState {
    history: HashHistory[];
    addToHistory: (type: string, result: string) => void;
    clearHistory: () => void;
    loadHistory: () => Promise<void>;
}

export const useHashGeneratorStore = create<HashGeneratorState>((set) => ({
    history: [],

    addToHistory: async (type: string, result: string) => {
        set((state) => {
            const newHistory = [
                { type, result, timestamp: Date.now() },
                ...state.history
            ].slice(0, 10);
            db.set('hashGenerator', 'history', newHistory);
            return { history: newHistory };
        });
    },

    clearHistory: async () => {
        set({ history: [] });
        await db.delete('hashGenerator', 'history');
    },

    loadHistory: async () => {
        try {
            const history = (await db.get<HashHistory[]>('hashGenerator', 'history')) || [];
            set({ history });
        } catch (error) {
            console.error('Error loading hash generator history:', error);
            set({ history: [] });
        }
    },
})); 