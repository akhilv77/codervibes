'use client';

import { create } from 'zustand';
import { db } from '@/lib/db/indexed-db';

interface QRHistory {
    type: string;
    content: string;
    timestamp: number;
}

interface QRCodeState {
    history: QRHistory[];
    addToHistory: (type: string, content: string) => void;
    clearHistory: () => void;
    loadHistory: () => Promise<void>;
}

export const useQRCodeStore = create<QRCodeState>((set) => ({
    history: [],

    addToHistory: async (type: string, content: string) => {
        set((state) => {
            const newHistory = [
                { type, content, timestamp: Date.now() },
                ...state.history
            ].slice(0, 10);
            db.set('qrCode', 'history', newHistory);
            return { history: newHistory };
        });
    },

    clearHistory: async () => {
        set({ history: [] });
        await db.delete('qrCode', 'history');
    },

    loadHistory: async () => {
        try {
            const history = (await db.get<QRHistory[]>('qrCode', 'history')) || [];
            set({ history });
        } catch (error) {
            console.error('Error loading QR code history:', error);
            set({ history: [] });
        }
    },
})); 