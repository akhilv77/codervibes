'use client';

import { create } from 'zustand';
import { db } from '@/lib/db/indexed-db';

interface JSONHistory {
    json: string;
    timestamp: number;
}

interface JSONFormatterState {
    history: JSONHistory[];
    addToHistory: (json: string) => void;
    clearHistory: () => void;
    loadHistory: () => Promise<void>;
}

export const useJSONFormatterStore = create<JSONFormatterState>((set) => ({
    history: [],

    addToHistory: async (json: string) => {
        set((state) => {
            const newHistory = [
                { json, timestamp: Date.now() },
                ...state.history.filter(item => item.json !== json)
            ].slice(0, 10);
            db.set('jsonFormatter', 'history', newHistory);
            return { history: newHistory };
        });
    },

    clearHistory: async () => {
        set({ history: [] });
        await db.delete('jsonFormatter', 'history');
    },

    loadHistory: async () => {
        try {
            const history = await db.get('jsonFormatter', 'history') || [];
            set({ history });
        } catch (error) {
            console.error('Error loading JSON history:', error);
            set({ history: [] });
        }
    },
})); 