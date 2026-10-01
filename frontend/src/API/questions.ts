// src/api/questions.ts
import api from "./axios";

export const getLetterPositionQuestions = async (
  letterId: number,
  lessonId: number
) => {
  const res = await api.get(
    `/lessons/questions?letter_id=${letterId}&lesson_id=${lessonId}`
  );
 
  return res.data.data; // حسب response تبعك
};
