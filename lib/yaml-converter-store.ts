'use client';

import { create } from 'zustand';
import { db } from '@/lib/db/indexed-db';

interface YAMLHistory {
    type: string;
    from: string;
    to: string;
    timestamp: number;
}

interface YAMLConverterState {
    history: YAMLHistory[];
    addToHistory: (type: string, from: string, to: string) => void;
    clearHistory: () => void;
    loadHistory: () => Promise<void>;
}

export const useYAMLConverterStore = create<YAMLConverterState>((set) => ({
    history: [],

    addToHistory: async (type: string, from: string, to: string) => {
        set((state) => {
            const newHistory = [
                { type, from, to, timestamp: Date.now() },
                ...state.history
            ].slice(0, 10);
            db.set('yamlConverter', 'history', newHistory);
            return { history: newHistory };
        });
    },

    clearHistory: async () => {
        set({ history: [] });
        await db.delete('yamlConverter', 'history');
    },

    loadHistory: async () => {
        try {
            const history = (await db.get<YAMLHistory[]>('yamlConverter', 'history')) || [];
            set({ history });
        } catch (error) {
            console.error('Error loading YAML converter history:', error);
            set({ history: [] });
        }
    },
})); 