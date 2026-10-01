import api from "./axios";

export const submitAnswer = async (
  lessons_id: number,
  question_id: number,
  answer: string
) => {
  const res = await api.post("/progress/student-answers/submit", {
    lessons_id,
    question_id,
    answer,
  });

  return res.data.data;
};

export const calculateLessonResult = async (lessons_id: number) => {
  const res = await api.post("/progress/student-lesson-result/calculate", {
    lessons_id,
  });

  return res.data.data;
};
