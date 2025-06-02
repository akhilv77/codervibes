'use client';

import { create } from 'zustand';
import { db } from '@/lib/db/indexed-db';

interface MarkdownHistory {
    from: string;
    to: string;
    timestamp: number;
}

interface MarkdownPreviewerState {
    history: MarkdownHistory[];
    addToHistory: (item: Omit<MarkdownHistory, 'timestamp'>) => void;
    clearHistory: () => void;
    loadHistory: () => Promise<void>;
}

export const useMarkdownPreviewerStore = create<MarkdownPreviewerState>((set) => ({
    history: [],

    addToHistory: async (item) => {
        set((state) => {
            const newHistory = [
                { ...item, timestamp: Date.now() },
                ...state.history
            ].slice(0, 5); // Keep only the last 5 items
            db.set('markdownPreviewer', 'history', newHistory);
            return { history: newHistory };
        });
    },

    clearHistory: async () => {
        set({ history: [] });
        await db.delete('markdownPreviewer', 'history');
    },

    loadHistory: async () => {
        try {
            const history = (await db.get<MarkdownHistory[]>('markdownPreviewer', 'history')) || [];
            set({ history });
        } catch (error) {
            console.error('Error loading markdown previewer history:', error);
            set({ history: [] });
        }
    },
})); 