import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CaseConverterState {
  inputText: string;
  convertedText: string;
  selectedCase: string;
  setInputText: (text: string) => void;
  setConvertedText: (text: string) => void;
  setSelectedCase: (caseType: string) => void;
  reset: () => void;
}

const initialState = {
  inputText: '',
  convertedText: '',
  selectedCase: 'camelCase',
};

export const useCaseConverterStore = create<CaseConverterState>()(
  persist(
    (set) => ({
      ...initialState,
      setInputText: (inputText) => set({ inputText }),
      setConvertedText: (convertedText) => set({ convertedText }),
      setSelectedCase: (selectedCase) => set({ selectedCase }),
      reset: () => set(initialState),
    }),
    {
      name: 'case-converter-storage',
    }
  )
); 