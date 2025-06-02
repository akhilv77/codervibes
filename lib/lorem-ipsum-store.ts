import { create } from 'zustand';
import { db } from './db/indexed-db';

interface LoremIpsumHistory {
    text: string;
    type: 'paragraphs' | 'words' | 'characters';
    count: number;
    timestamp: string;
}

interface LoremIpsumStore {
    history: LoremIpsumHistory[];
    addToHistory: (item: LoremIpsumHistory) => Promise<void>;
    clearHistory: () => Promise<void>;
    loadHistory: () => Promise<void>;
}

export const useLoremIpsumStore = create<LoremIpsumStore>((set) => ({
    history: [],

    addToHistory: async (item: LoremIpsumHistory) => {
        try {
            await db.addToHistory('lorem-ipsum', item);
            const history = await db.getHistory('lorem-ipsum');
            set({ history });
        } catch (error) {
            console.error('Error adding to history:', error);
        }
    },

    clearHistory: async () => {
        try {
            await db.clearHistory('lorem-ipsum');
            set({ history: [] });
        } catch (error) {
            console.error('Error clearing history:', error);
        }
    },

    loadHistory: async () => {
        try {
            const history = await db.getHistory('lorem-ipsum');
            set({ history });
        } catch (error) {
            console.error('Error loading history:', error);
            set({ history: [] });
        }
    },
})); 