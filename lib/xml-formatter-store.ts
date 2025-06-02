'use client';

import { create } from 'zustand';
import { db } from '@/lib/db/indexed-db';

interface XMLHistory {
    type: string;
    from: string;
    to: string;
    timestamp: number;
}

interface XMLFormatterState {
    history: XMLHistory[];
    addToHistory: (item: Omit<XMLHistory, 'timestamp'>) => void;
    clearHistory: () => void;
    loadHistory: () => Promise<void>;
}

export const useXMLFormatterStore = create<XMLFormatterState>((set) => ({
    history: [],

    addToHistory: async (item) => {
        set((state) => {
            const newHistory = [
                { ...item, timestamp: Date.now() },
                ...state.history
            ].slice(0, 10);
            db.set('xmlFormatter', 'history', newHistory);
            return { history: newHistory };
        });
    },

    clearHistory: async () => {
        set({ history: [] });
        await db.delete('xmlFormatter', 'history');
    },

    loadHistory: async () => {
        try {
            const history = (await db.get<XMLHistory[]>('xmlFormatter', 'history')) || [];
            set({ history });
        } catch (error) {
            console.error('Error loading XML formatter history:', error);
            set({ history: [] });
        }
    },
})); 