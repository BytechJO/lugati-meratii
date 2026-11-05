import { useEffect, useState } from "react";
import { getLetterGameTypes } from "../API/games";
import type { GameType } from "../types/games";

interface GamesState {
  letterId?: number;
  availableGames: GameType[];
  loading: boolean;
}

export function useLetterGames(letterId?: number) {
  const [state, setState] = useState<GamesState>({ availableGames: [], loading: true });

  useEffect(() => {
    if (letterId === undefined) return;
    const controller = new AbortController();
    setState({ letterId, availableGames: [], loading: true });

    async function loadGames(targetLetterId: number) {
      try {
        const availableGames = await getLetterGameTypes(targetLetterId, controller.signal);
        if (!controller.signal.aborted) {
          setState({ letterId, availableGames, loading: false });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Error fetching games:", error);
          setState({ letterId, availableGames: [], loading: false });
        }
      }
    }

    void loadGames(letterId);
    return () => controller.abort();
  }, [letterId]);

  return {
    availableGames: state.letterId === letterId ? state.availableGames : [],
    loadingGames: state.letterId !== letterId || state.loading,
  };
}
