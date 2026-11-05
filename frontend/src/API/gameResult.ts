import api from "./axios";
import { completeGamesLessonIfPlayed } from "./games";

interface SaveGameResultPayload {
  games_lessons_id: number;
  score: number;
  duration: number;
  letter_id: number;
}

export const saveGameResult = async (payload: SaveGameResultPayload) => {
  const { letter_id, ...result } = payload;
  const res = await api.post("/lessons/saveGameResult", result);
  // Wait for the result to persist before counting played games. This also
  // updates progress when the student stays on the final game's result screen.
  await completeGamesLessonIfPlayed(letter_id);
  return res.data.data;
};
