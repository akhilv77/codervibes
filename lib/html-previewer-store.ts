'use client';

import { create } from 'zustand';
import { db } from '@/lib/db/indexed-db';

interface HTMLHistory {
    html: string;
    timestamp: number;
}

interface HTMLPreviewerState {
    history: HTMLHistory[];
    addToHistory: (html: string) => void;
    clearHistory: () => void;
    loadHistory: () => Promise<void>;
}

const STORAGE_KEY = 'html-previewer-history';
const MAX_HISTORY_ITEMS = 10;

export const useHTMLPreviewerStore = create<HTMLPreviewerState>((set) => ({
    history: [],
    addToHistory: async (html: string) => {
        const newHistory: HTMLHistory = {
            html,
            timestamp: Date.now(),
        };

        set((state) => {
            const newHistoryList = [newHistory, ...state.history].slice(0, MAX_HISTORY_ITEMS);
            return { history: newHistoryList };
        });

        try {
            const currentHistory = await db.get<HTMLHistory[]>('htmlPreviewer', STORAGE_KEY) || [];
            const updatedHistory = [newHistory, ...currentHistory].slice(0, MAX_HISTORY_ITEMS);
            await db.set('htmlPreviewer', STORAGE_KEY, updatedHistory);
        } catch (error) {
            console.error('Error saving to IndexedDB:', error);
        }
    },
    clearHistory: async () => {
        set({ history: [] });
        try {
            await db.delete('htmlPreviewer', STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing IndexedDB:', error);
        }
    },
    loadHistory: async () => {
        try {
            const history = await db.get<HTMLHistory[]>('htmlPreviewer', STORAGE_KEY) || [];
            set({ history: history.slice(0, MAX_HISTORY_ITEMS) });
        } catch (error) {
            console.error('Error loading from IndexedDB:', error);
        }
    },
})); 