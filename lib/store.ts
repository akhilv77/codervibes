"use client";

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import md5 from "md5";
import { type AppState, Game, Player, Score } from "@/types";
import { db } from "@/lib/db/indexed-db";

// Custom storage adapter for IndexedDB
const storage = {
  getItem: async (name: string) => {
    try {
      const data = await db.get('scorecard', name);
      return data ? JSON.stringify(data) : null;
    } catch (error) {
      console.error('Error reading from IndexedDB:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string) => {
    try {
      await db.set('scorecard', name, JSON.parse(value));
    } catch (error) {
      console.error('Error writing to IndexedDB:', error);
    }
  },
  removeItem: async (name: string) => {
    try {
      await db.delete('scorecard', name);
    } catch (error) {
      console.error('Error deleting from IndexedDB:', error);
    }
  }
};

export const useStore = create<AppState & {
  setMaxScore: (score: number) => void;
  addGame: (name: string, selectedPlayers: string[], maxScore?: number) => Game;
  addPlayer: (name: string) => void;
  addScore: (gameId: string, playerId: string, value: number) => void;
  resetAll: () => void;
  isPlayerGameOver: (playerId: string) => boolean;
  getPlayerScoreInGame: (gameId: string, playerId: string) => number;
  getPlayerTotalScore: (playerId: string) => number;
  getActivePlayers: () => Player[];
  getGameOverPlayers: () => Player[];
  getGames: () => Game[];
  updatePlayerGameOverStatus: () => void;
  deletePlayer: (playerId: string) => void;
  updatePlayerName: (playerId: string, name: string) => void;
  deleteGame: (gameId: string) => void;
  updateGame: (gameId: string, name: string, selectedPlayers: string[], maxScore?: number) => void;
}>()(
  (set, get) => ({
    maxScore: 200,
    games: [],
    players: [],
    scores: [],
    
    setMaxScore: (score) => {
      set({ maxScore: score });
      storage.setItem('maxScore', JSON.stringify(score));
    },
    
    addGame: (name, selectedPlayers, maxScore) => {
      const newGame = {
        id: uuidv4(),
        name: name || `Game ${get().games.length + 1}`,
        createdAt: Date.now(),
        players: selectedPlayers,
        maxScore: maxScore ?? get().maxScore
      };
      
      set((state) => {
        const updatedGames = [...state.games, newGame];
        storage.setItem('games', JSON.stringify(updatedGames));
        return { games: updatedGames };
      });
      
      return newGame;
    },
    
    addPlayer: (name) => {
      if (!name.trim()) return;
      
      const hash = md5(name.toLowerCase().trim());
      const avatarUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon`;
      
      const newPlayer = {
        id: uuidv4(),
        name: name.trim(),
        avatarUrl,
        gameOver: false,
        totalScore: 0
      };
      
      set((state) => {
        const updatedPlayers = [...state.players, newPlayer];
        storage.setItem('players', JSON.stringify(updatedPlayers));
        return { players: updatedPlayers };
      });
    },
    
    addScore: (gameId, playerId, value) => {
      const newScore = {
        gameId,
        playerId,
        value
      };
      
      set((state) => {
        const updatedScores = [...state.scores, newScore];
        storage.setItem('scores', JSON.stringify(updatedScores));
        return { scores: updatedScores };
      });
      
      get().updatePlayerGameOverStatus();
    },
    
    resetAll: () => {
      set({
        maxScore: 200,
        games: [],
        players: [],
        scores: []
      });
      
      storage.setItem('maxScore', '200');
      storage.setItem('games', '[]');
      storage.setItem('players', '[]');
      storage.setItem('scores', '[]');
    },
    
    isPlayerGameOver: (playerId) => {
      const player = get().players.find(p => p.id === playerId);
      if (!player) return false;

      const totalScore = get().getPlayerTotalScore(playerId);
      const game = get().games.find(g => g.players.includes(playerId));
      const gameMaxScore = game?.maxScore ?? get().maxScore;

      return totalScore > gameMaxScore;
    },
    
    getPlayerScoreInGame: (gameId, playerId) => {
      return get().scores
        .filter(score => score.gameId === gameId && score.playerId === playerId)
        .reduce((sum, score) => sum + score.value, 0);
    },
    
    getPlayerTotalScore: (playerId) => {
      return get().scores
        .filter(score => score.playerId === playerId)
        .reduce((sum, score) => sum + score.value, 0);
    },
    
    getActivePlayers: () => {
      return get().players.filter(p => !p.gameOver)
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    
    getGameOverPlayers: () => {
      return get().players.filter(p => p.gameOver)
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    
    getGames: () => {
      return [...get().games].sort((a, b) => b.createdAt - a.createdAt);
    },
    
    updatePlayerGameOverStatus: () => {
      const { players, scores, games, maxScore } = get();
      
      const updatedPlayers = players.map(player => {
        const totalScore = scores
          .filter(score => score.playerId === player.id)
          .reduce((sum, score) => sum + score.value, 0);
        
        const game = games.find(g => g.players.includes(player.id));
        const gameMaxScore = game?.maxScore ?? maxScore;
        
        return {
          ...player,
          totalScore,
          gameOver: totalScore > gameMaxScore
        };
      });
      
      set({ players: updatedPlayers });
      storage.setItem('players', JSON.stringify(updatedPlayers));
    },
    
    deletePlayer: (playerId) => {
      set((state) => {
        const newState = {
          players: state.players.filter(p => p.id !== playerId),
          games: state.games.map(game => ({
            ...game,
            players: game.players.filter(id => id !== playerId)
          })),
          scores: state.scores.filter(score => score.playerId !== playerId)
        };
        
        storage.setItem('players', JSON.stringify(newState.players));
        storage.setItem('games', JSON.stringify(newState.games));
        storage.setItem('scores', JSON.stringify(newState.scores));
        
        return newState;
      });
    },
    
    updatePlayerName: (playerId, name) => {
      if (!name.trim()) return;
      
      const hash = md5(name.toLowerCase().trim());
      const avatarUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon`;
      
      set((state) => {
        const newPlayers = state.players.map(player =>
          player.id === playerId
            ? { ...player, name: name.trim(), avatarUrl }
            : player
        );
        
        storage.setItem('players', JSON.stringify(newPlayers));
        return { players: newPlayers };
      });
    },
    
    deleteGame: (gameId) => {
      set((state) => {
        const newState = {
          games: state.games.filter(g => g.id !== gameId),
          scores: state.scores.filter(score => score.gameId !== gameId)
        };
        
        storage.setItem('games', JSON.stringify(newState.games));
        storage.setItem('scores', JSON.stringify(newState.scores));
        
        return newState;
      });
    },

    updateGame: (gameId: string, name: string, selectedPlayers: string[], maxScore?: number) => {
      set((state) => {
        const newGames = state.games.map(game =>
          game.id === gameId
            ? { 
                ...game, 
                name: name || game.name, 
                players: selectedPlayers,
                maxScore: maxScore !== undefined ? maxScore : game.maxScore
              }
            : game
        );
        
        storage.setItem('games', JSON.stringify(newGames));
        return { games: newGames };
      });
    }
  })
);

// Initialize store from IndexedDB
if (typeof window !== 'undefined') {
  Promise.all([
    storage.getItem('maxScore'),
    storage.getItem('games'),
    storage.getItem('players'),
    storage.getItem('scores')
  ]).then(([maxScore, games, players, scores]) => {
    const state = {
      maxScore: maxScore ? JSON.parse(maxScore) : 200,
      games: games ? JSON.parse(games) : [],
      players: players ? JSON.parse(players) : [],
      scores: scores ? JSON.parse(scores) : []
    };
    
    useStore.setState(state);
  }).catch(console.error);
}