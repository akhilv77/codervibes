export interface Player {
  id: string;
  name: string;
  avatarUrl: string;
  gameOver: boolean;
  totalScore: number;
}

export interface Game {
  id: string;
  name: string;
  createdAt: number;
  players: string[]; // Player IDs
  maxScore?: number; // Optional max score specific to this game
}

export interface Score {
  id: string;
  gameId: string;
  playerId: string;
  value: number;
  timestamp: number;
}

export interface AppState {
  maxScore: number;
  games: Game[];
  players: Player[];
  scores: Score[];
}