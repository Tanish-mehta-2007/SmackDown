export interface ScoreEntry {
  id: string;
  playerName: string;
  score: number;
  timestamp: number;
}

export type Page = 'play' | 'settings';

export type SerialStatus = 'disconnected' | 'connecting' | 'connected' | 'finished' | 'error';
