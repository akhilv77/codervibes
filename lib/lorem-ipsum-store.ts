import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LoremIpsumState {
  paragraphs: number;
  words: number;
  sentences: number;
  startWithLorem: boolean;
  generatedText: string;
  setParagraphs: (paragraphs: number) => void;
  setWords: (words: number) => void;
  setSentences: (sentences: number) => void;
  setStartWithLorem: (startWithLorem: boolean) => void;
  setGeneratedText: (text: string) => void;
  reset: () => void;
}

const initialState = {
  paragraphs: 3,
  words: 50,
  sentences: 5,
  startWithLorem: true,
  generatedText: '',
};

export const useLoremIpsumStore = create<LoremIpsumState>()(
  persist(
    (set) => ({
      ...initialState,
      setParagraphs: (paragraphs) => set({ paragraphs }),
      setWords: (words) => set({ words }),
      setSentences: (sentences) => set({ sentences }),
      setStartWithLorem: (startWithLorem) => set({ startWithLorem }),
      setGeneratedText: (generatedText) => set({ generatedText }),
      reset: () => set(initialState),
    }),
    {
      name: 'lorem-ipsum-storage',
    }
  )
); 