import { useEffect, useRef } from "react";
import { completeGamesLessonIfPlayed } from "../API/games";
import type { User } from "../types";

export function useGameProgress(letterId: number | undefined, user: User | null) {
  const savedProgress = useRef(new Set<string>());
  const userId = user?.id;
  const userType = user?.type;

  useEffect(() => {
    if (letterId === undefined || !userId || userType !== "student") return;
    const progressKey = `${userId}:${letterId}`;
    if (savedProgress.current.has(progressKey)) return;
    const controller = new AbortController();

    async function saveCompletedGames(targetLetterId: number) {
      try {
        if (await completeGamesLessonIfPlayed(targetLetterId, controller.signal)) {
          savedProgress.current.add(progressKey);
        }
      } catch (error) {
        if (!controller.signal.aborted) console.error("Error checking games progress:", error);
      }
    }

    void saveCompletedGames(letterId);
    return () => controller.abort();
  }, [letterId, userId, userType]);
}
