import axios from "axios";
import api from "./axios";
import { upsertUserProgress } from "./userProgress";
import type { GameType, LetterGameProgress } from "../types/games";

// The fifth lesson is the shared games lesson for every letter.
const GAMES_LESSON_ID = 5;

const isGameType = (value: unknown): value is GameType =>
  value === "word_catch" || value === "sorting" ||
  value === "memory_match" || value === "balloon_pop";

export async function getLetterGameTypes(letterId: number, signal: AbortSignal) {
  try {
    const response = await api.get<{ data: { game_type: unknown }[] }>(
      `/lessons/game-lesson/${letterId}/letter-id`, { signal },
    );
    const games = Array.isArray(response.data?.data) ? response.data.data : [];
    return games.map((game) => game.game_type).filter(isGameType);
  } catch (error) {
    // This endpoint uses 404 when a letter has no configured games.
    if (axios.isAxiosError(error) && error.response?.status === 404) return [];
    throw error;
  }
}

export async function getLetterGameProgress(letterId: number, signal?: AbortSignal) {
  const response = await api.get<LetterGameProgress>(
    `/lessons/${letterId}/games/progress`, { signal },
  );
  return response.data;
}

export function completeGamesLesson(letterId: number, signal?: AbortSignal) {
  return upsertUserProgress({
    letter_id: letterId,
    lesson_id: GAMES_LESSON_ID,
    lesson_type: "game",
    score: 1,
    completed: true,
  }, signal);
}

export async function completeGamesLessonIfPlayed(letterId: number, signal?: AbortSignal) {
  const progress = await getLetterGameProgress(letterId, signal);
  if (signal?.aborted) return false;
  if (progress.totalGames > 0 && progress.playedGamesCount === progress.totalGames) {
    await completeGamesLesson(letterId, signal);
    return true;
  }
  return false;
}
