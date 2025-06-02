import { create } from 'zustand';
import { db } from './db/indexed-db';

interface CaseConverterHistory {
    input: string;
    output: string;
    type: 'camel' | 'pascal' | 'snake' | 'kebab' | 'title' | 'sentence' | 'lower' | 'upper';
    timestamp: string;
}

interface CaseConverterStore {
    history: CaseConverterHistory[];
    addToHistory: (item: CaseConverterHistory) => Promise<void>;
    clearHistory: () => Promise<void>;
    loadHistory: () => Promise<void>;
}

export const useCaseConverterStore = create<CaseConverterStore>((set) => ({
    history: [],

    addToHistory: async (item: CaseConverterHistory) => {
        try {
            await db.addToHistory('caseConverter', item);
            const history = await db.getHistory('caseConverter');
            set({ history });
        } catch (error) {
            console.error('Error adding to history:', error);
        }
    },

    clearHistory: async () => {
        try {
            await db.clearHistory('caseConverter');
            set({ history: [] });
        } catch (error) {
            console.error('Error clearing history:', error);
        }
    },

    loadHistory: async () => {
        try {
            const history = await db.getHistory('caseConverter');
            set({ history });
        } catch (error) {
            console.error('Error loading history:', error);
            set({ history: [] });
        }
    },
})); 