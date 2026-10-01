import api from "./axios";

interface SaveGameResultPayload {
  games_lessons_id: number;
  score: number;
  duration: number;
}

export const saveGameResult = async (payload: SaveGameResultPayload) => {
  const res = await api.post("/lessons/saveGameResult", payload);
  return res.data.data;
};
