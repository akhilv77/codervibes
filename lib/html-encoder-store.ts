'use client';

import { create } from 'zustand';
import { db } from '@/lib/db/indexed-db';

interface HTMLHistory {
    type: string;
    result: string;
    timestamp: number;
}

interface HTMLEncoderState {
    history: HTMLHistory[];
    addToHistory: (type: string, result: string) => void;
    clearHistory: () => void;
    loadHistory: () => Promise<void>;
}

export const useHTMLEncoderStore = create<HTMLEncoderState>((set) => ({
    history: [],

    addToHistory: async (type: string, result: string) => {
        set((state) => {
            const newHistory = [
                { type, result, timestamp: Date.now() },
                ...state.history
            ].slice(0, 10);
            db.set('htmlEncoder', 'history', newHistory);
            return { history: newHistory };
        });
    },

    clearHistory: async () => {
        set({ history: [] });
        await db.delete('htmlEncoder', 'history');
    },

    loadHistory: async () => {
        try {
            const history = (await db.get<HTMLHistory[]>('htmlEncoder', 'history')) || [];
            set({ history });
        } catch (error) {
            console.error('Error loading HTML encoder history:', error);
            set({ history: [] });
        }
    },
})); 