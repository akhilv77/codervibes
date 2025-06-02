import { create } from 'zustand';
import { db } from './db/indexed-db';

interface DiffHistoryItem {
    left: string;
    right: string;
    type: string;
    timestamp: number;
}

interface DiffCheckerStore {
    history: DiffHistoryItem[];
    addToHistory: (item: Omit<DiffHistoryItem, 'timestamp'>) => Promise<void>;
    clearHistory: () => Promise<void>;
    loadHistory: () => Promise<void>;
}

const MAX_HISTORY_ITEMS = 5;

export const useDiffCheckerStore = create<DiffCheckerStore>((set) => ({
    history: [],
    addToHistory: async (item) => {
        try {
            const historyItem: DiffHistoryItem = {
                ...item,
                timestamp: Date.now(),
            };

            // Get all items
            const items = await db.getAll<DiffHistoryItem>('diffChecker');
            
            // Add new item
            await db.set('diffChecker', historyItem.timestamp.toString(), historyItem);

            // If we exceed the limit, remove the oldest items
            if (items.length >= MAX_HISTORY_ITEMS) {
                const itemsToDelete = items
                    .sort((a: DiffHistoryItem, b: DiffHistoryItem) => a.timestamp - b.timestamp)
                    .slice(0, items.length - MAX_HISTORY_ITEMS + 1);

                for (const item of itemsToDelete) {
                    await db.delete('diffChecker', item.timestamp.toString());
                }
            }

            // Update state with new history
            const newItems = await db.getAll<DiffHistoryItem>('diffChecker');
            set({ history: newItems });
        } catch (error) {
            console.error('Error adding to history:', error);
        }
    },
    clearHistory: async () => {
        try {
            await db.clear('diffChecker');
            set({ history: [] });
        } catch (error) {
            console.error('Error clearing history:', error);
        }
    },
    loadHistory: async () => {
        try {
            const items = await db.getAll<DiffHistoryItem>('diffChecker');
            set({ history: items });
        } catch (error) {
            console.error('Error loading history:', error);
        }
    },
})); 