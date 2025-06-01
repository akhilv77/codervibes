'use client';

import { create } from 'zustand';
import { db } from './db/indexed-db';

interface JWTHistory {
    token: string;
    timestamp: number;
}

interface JWTDecoderState {
    history: JWTHistory[];
    addToHistory: (token: string) => Promise<void>;
    loadHistory: () => Promise<void>;
    clearHistory: () => Promise<void>;
}

export const useJWTDecoderStore = create<JWTDecoderState>((set) => ({
    history: [],
    addToHistory: async (token: string) => {
        try {
            console.log('Adding token to history:', token);
            // Initialize the database if needed
            await db.init();
            
            // Get existing history
            const history = await db.get<JWTHistory[]>('jwtDecoder', 'history') || [];
            console.log('Current history:', history);

            // Create new history array with the new token
            const newHistory = [
                { token, timestamp: Date.now() },
                ...history
            ].slice(0, 10); // Keep only last 10 entries
            console.log('New history:', newHistory);

            // Save to IndexedDB
            await db.set('jwtDecoder', 'history', newHistory);
            
            // Update state
            set({ history: newHistory });
            console.log('History updated in store');
        } catch (error) {
            console.error('Failed to add to history:', error);
        }
    },
    loadHistory: async () => {
        try {
            console.log('Loading history...');
            // Initialize the database if needed
            await db.init();
            
            const history = await db.get<JWTHistory[]>('jwtDecoder', 'history') || [];
            console.log('Loaded history:', history);
            set({ history });
        } catch (error) {
            console.error('Failed to load history:', error);
            set({ history: [] });
        }
    },
    clearHistory: async () => {
        try {
            console.log('Clearing history...');
            // Initialize the database if needed
            await db.init();
            
            await db.set('jwtDecoder', 'history', []);
            set({ history: [] });
            console.log('History cleared');
        } catch (error) {
            console.error('Failed to clear history:', error);
        }
    }
})); 