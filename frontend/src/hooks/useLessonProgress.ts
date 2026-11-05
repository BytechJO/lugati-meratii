import { useCallback, useEffect, useRef, useState } from "react";
import { completeActivity, type LearningActivity } from "../API/userProgress";
import { useAppSelector } from "../redux/hooks";

export function useLessonProgress(letterId: number | undefined, activity: LearningActivity) {
  const user = useAppSelector((state) => state.auth.user);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef<{ key: string; promise: Promise<boolean> } | null>(null);
  const saved = useRef(new Set<string>());
  const lastScore = useRef(0);
  const key = `${user?.id}:${letterId}:${activity}`;
  const currentKey = useRef(key);
  currentKey.current = key;
  useEffect(() => { setError(null); }, [key]);

  const saveProgress = useCallback((score: number): Promise<boolean> => {
    if (user?.type !== "student") return Promise.resolve(true);
    if (!letterId) return Promise.resolve(false);
    lastScore.current = score;
    if (saved.current.has(key)) return Promise.resolve(true);
    if (pending.current?.key === key) return pending.current.promise;
    const promise = (async () => {
      try {
        await completeActivity(activity, letterId, score);
        saved.current.add(key);
        if (currentKey.current === key) setError(null);
        return true;
      } catch (cause: any) {
        const status = cause?.response?.status;
        if (currentKey.current === key) setError(status === 401 || status === 403
          ? "تعذر حفظ تقدمك. سجّل الدخول مجدداً ثم أعد المحاولة."
          : "تعذر حفظ تقدمك على الخادم. أعد محاولة الحفظ قبل المتابعة.");
        console.error(`Failed to save ${activity} progress`, cause);
        return false;
      } finally {
        if (pending.current?.key === key) pending.current = null;
      }
    })();
    pending.current = { key, promise };
    return promise;
  }, [user?.type, key, letterId, activity]);

  const retry = () => { void saveProgress(lastScore.current); };
  return { saveProgress, progressError: error, retryProgress: retry };
}
