import { create } from 'zustand';

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

export const useCaseConverterStore = create<CaseConverterState>()((set) => ({
  ...initialState,
  setInputText: (inputText) => set({ inputText }),
  setConvertedText: (convertedText) => set({ convertedText }),
  setSelectedCase: (selectedCase) => set({ selectedCase }),
  reset: () => set(initialState),
})); 