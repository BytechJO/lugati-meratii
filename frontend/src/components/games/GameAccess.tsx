import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";
import type { GameType } from "../../types/games";
import { GamePreview } from "./GamePreview";

// Unmount gameplay during preview so timers and result effects cannot run.
export function GameAccess({ gameType, children }: { gameType: GameType; children: ReactNode }) {
  const user = useAppSelector((state) => state.auth.user);
  if (user?.type === "teacher") return <GamePreview gameType={gameType} />;
  if (user?.type !== "student") return <Navigate to="/" replace />;
  return <>{children}</>;
}
