import api from "./axios";

export const getVideoLessonsByLetterAndLesson = async (
  letter_id: number,
  lesson_id: number
) => {
  const res = await api.get(
    `/lessons/video-lessons/${letter_id}/${lesson_id}`
  );


  return res.data;
};