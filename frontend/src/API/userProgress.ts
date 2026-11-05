import api from "./axios";

export const activityLessons = {
  learn: 1, write: 2, tashkeel: 3, video: 4, game: 5, position: 12,
} as const;
export type LearningActivity = keyof typeof activityLessons;

export function completeActivity(activity: LearningActivity, letterId: number, score: number) {
  if (!Number.isInteger(letterId) || letterId <= 0) throw new Error("لم يتم تحديد الحرف لحفظ التقدم.");
  return upsertUserProgress({ letter_id: letterId, lesson_id: activityLessons[activity], lesson_type: activity, score, completed: true });
}

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
}, signal?: AbortSignal) => {
  const res = await api.post("/progress/upsertProgress", {
    letter_id,
    lesson_id,
    lesson_type,
    score,
    completed,
  }, { signal });

  return res.data;
};
