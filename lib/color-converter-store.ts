'use client';

import { create } from 'zustand';
import { db } from '@/lib/db/indexed-db';

interface ColorHistory {
    type: string;
    from: string;
    to: string;
    timestamp: number;
}

interface ColorConverterState {
    history: ColorHistory[];
    addToHistory: (type: string, from: string, to: string) => void;
    clearHistory: () => void;
    loadHistory: () => Promise<void>;
}

export const useColorConverterStore = create<ColorConverterState>((set) => ({
    history: [],

    addToHistory: async (type: string, from: string, to: string) => {
        set((state) => {
            const newHistory = [
                { type, from, to, timestamp: Date.now() },
                ...state.history
            ].slice(0, 10);
            db.set('colorConverter', 'history', newHistory);
            return { history: newHistory };
        });
    },

    clearHistory: async () => {
        set({ history: [] });
        await db.delete('colorConverter', 'history');
    },

    loadHistory: async () => {
        try {
            const history = (await db.get<ColorHistory[]>('colorConverter', 'history')) || [];
            set({ history });
        } catch (error) {
            console.error('Error loading color converter history:', error);
            set({ history: [] });
        }
    },
})); 