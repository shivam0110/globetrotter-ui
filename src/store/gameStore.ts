import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
  username: string | null;
  bestTry: number;
  tries: number;
  correctAnswers: number;
  incorrectAnswers: number;
  
  setUsername: (username: string) => void;
  setBestTry: (bestTry: number) => void;
  incrementTries: () => void;
  resetGame: () => void;
  setCorrectAnswers: (count: number) => void;
  setIncorrectAnswers: (count: number) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      username: null,
      bestTry: 0,
      tries: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      
      setUsername: (username) => set({ username }),
      setBestTry: (bestTry) => set({ bestTry }),
      incrementTries: () => set((state) => ({ tries: state.tries + 1 })),
      resetGame: () => set({ tries: 0 }),
      setCorrectAnswers: (count) => set({ correctAnswers: count }),
      setIncorrectAnswers: (count) => set({ incorrectAnswers: count }),
    }),
    {
      name: 'globetrotter-storage',
    }
  )
); 