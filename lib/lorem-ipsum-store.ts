import { create } from 'zustand';

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

export const useLoremIpsumStore = create<LoremIpsumState>()((set) => ({
  ...initialState,
  setParagraphs: (paragraphs) => set({ paragraphs }),
  setWords: (words) => set({ words }),
  setSentences: (sentences) => set({ sentences }),
  setStartWithLorem: (startWithLorem) => set({ startWithLorem }),
  setGeneratedText: (generatedText) => set({ generatedText }),
  reset: () => set(initialState),
})); 