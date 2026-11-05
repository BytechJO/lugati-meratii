import { motion } from "motion/react";
import gameButton from "../../assets/game_botton.svg";
import type { GameCardData } from "../../types/games";

interface GameSelectionCardProps {
  game: GameCardData;
  index: number;
  available: boolean;
  preview?: boolean;
  onSelect: () => void;
}

export function GameSelectionCard({
  game,
  index,
  available,
  preview = false,
  onSelect,
}: GameSelectionCardProps) {
  return (
    <motion.button
      onClick={() => {
        if (available) onSelect();
      }}
      aria-disabled={!available}
      aria-label={`${game.title}: ${game.description}`}
      className="rounded-[32px] text-right relative overflow-hidden disabled:opacity-50"
    >
      <motion.div
        className="absolute flex justify-between"
        style={{
          left: "5%",
          top: "6%",
          width: "90%",
          justifyContent: "space-between",
        }}
      >
        <motion.p
          className="z-10 font-tajawal"
          style={{ color: "#6D2181", fontSize: "30px", fontWeight: "bold" }}
        >
          {game.title}
        </motion.p>
        <motion.div
          className="inline-flex items-center gap-2 rounded-full mb-3 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02, y: -3 }}
          whileTap={{ scale: 0.98 }}
        >
          {preview ? (
            <span
              className="rounded-full px-6 py-3 font-tajawal font-bold"
              style={{ color: "white" ,backgroundColor: "#652B82"}}
            >
              معاينة اللعبة
            </span>
          ) : (
            <img
              src={gameButton}
              alt=""
              style={{ height: "auto", width: "130px", objectFit: "contain" }}
            />
          )}
        </motion.div>
      </motion.div>
      <div className="relative rounded-3xl overflow-hidden flex items-center justify-center">
        <img
          src={game.icon}
          alt=""
          style={{ height: "auto", width: "100%", objectFit: "contain" }}
        />
      </div>
    </motion.button>
  );
}
