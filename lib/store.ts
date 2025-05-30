"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import md5 from "md5";
import { type AppState, Game, Player, Score } from "@/types";

const STORAGE_KEY = "scorecard-app-storage";

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
  persist(
    (set, get) => ({
      maxScore: 200,
      games: [],
      players: [],
      scores: [],
      
      setMaxScore: (score) => set({ maxScore: score }),
      
      addGame: (name, selectedPlayers, maxScore) => {
        const newGame = {
          id: uuidv4(),
          name: name || `Game ${get().games.length + 1}`,
          createdAt: Date.now(),
          players: selectedPlayers,
          maxScore: maxScore ?? get().maxScore // Use provided maxScore or fall back to default
        };
        
        set((state) => ({
          games: [...state.games, newGame]
        }));
        
        return newGame;
      },
      
      addPlayer: (name) => {
        if (!name.trim()) return;
        
        // Generate avatar URL using Gravatar (md5 hash of name)
        const hash = md5(name.toLowerCase().trim());
        const avatarUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon`;
        
        const newPlayer = {
          id: uuidv4(),
          name: name.trim(),
          avatarUrl,
          gameOver: false,
          totalScore: 0
        };
        
        set((state) => ({
          players: [...state.players, newPlayer]
        }));
      },
      
      addScore: (gameId, playerId, value) => {
        const newScore = {
          gameId,
          playerId,
          value
        };
        
        set((state) => ({
          scores: [...state.scores, newScore]
        }));
        
        // Update player's total score and game over status
        get().updatePlayerGameOverStatus();
      },
      
      resetAll: () => {
        set({
          maxScore: 200,
          games: [],
          players: [],
          scores: []
        });
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
          
          // Find the game this player is in
          const game = games.find(g => g.players.includes(player.id));
          const gameMaxScore = game?.maxScore ?? maxScore;
          
          return {
            ...player,
            totalScore,
            gameOver: totalScore > gameMaxScore
          };
        });
        
        set({ players: updatedPlayers });
      },
      
      deletePlayer: (playerId) => {
        set((state) => ({
          players: state.players.filter(p => p.id !== playerId),
          games: state.games.map(game => ({
            ...game,
            players: game.players.filter(id => id !== playerId)
          })),
          scores: state.scores.filter(score => score.playerId !== playerId)
        }));
      },
      
      updatePlayerName: (playerId, name) => {
        if (!name.trim()) return;
        
        const hash = md5(name.toLowerCase().trim());
        const avatarUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon`;
        
        set((state) => ({
          players: state.players.map(player =>
            player.id === playerId
              ? { ...player, name: name.trim(), avatarUrl }
              : player
          )
        }));
      },
      
      deleteGame: (gameId) => {
        set((state) => ({
          games: state.games.filter(g => g.id !== gameId),
          scores: state.scores.filter(score => score.gameId !== gameId)
        }));
      },

      updateGame: (gameId: string, name: string, selectedPlayers: string[], maxScore?: number) => {
        set((state) => ({
          games: state.games.map(game =>
            game.id === gameId
              ? { 
                  ...game, 
                  name: name || game.name, 
                  players: selectedPlayers,
                  maxScore: maxScore !== undefined ? maxScore : game.maxScore
                }
              : game
          )
        }));
      }
    }),
    {
      name: STORAGE_KEY,
    }
  )
);