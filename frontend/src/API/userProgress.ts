import api from "./axios";

export const upsertUserProgress = async ({
  letter_id,
  lesson_id,
  lesson_type,
  score,
  completed,
}: {
  letter_id: number;
  lesson_id: number;
  lesson_type: string;
  score: number;
  completed: boolean;
}) => {
  const res = await api.post("/progress/upsertProgress", {
    letter_id,
    lesson_id,
    lesson_type,
    score,
    completed,
  });

  return res.data;
};
