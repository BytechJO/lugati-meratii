export type GameType = "word_catch" | "sorting" | "memory_match" | "balloon_pop";

export interface GameCardData {
  id: GameType;
  title: string;
  description: string;
  icon: string;
}

export interface LetterGameProgress {
  totalGames: number;
  playedGamesCount: number;
}
