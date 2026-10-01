import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Star, X } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import api from "../../API/axios";
import { saveGameResult } from "../../API/gameResult";
import { RootState } from "../../redux/store";
import { fetchLetters } from "../../redux/reducers/lettersSlice";
import backImg from "../../assets/background_imgMatch.svg";
import vectorEnd from "../../assets/vector_end.svg";
import badegEnd from "../../assets/badeg_end.svg";
import restart from "../../assets/Repeat.svg";
import background from "../../assets/background-game-match.png";
import { GameLoadingScreen } from "./WordCatchWelcom";

/* ===================== Types ===================== */

interface Card {
  id: number;
  content: string;
  type: "letter" | "word";
  matched: boolean;
  flipped: boolean;
}

/* ===================== Theme / Sizes (inline، لا تعتمد على Tailwind) ===================== */

const TEXT_DARK = "#28345F";
const PURPLE = "#652b82";

const CARD_SIZE = "clamp(100px, min(13.5vw, 21vh), 200px)";
const CARD_RADIUS = "clamp(14px, 2vw, 24px)";
const GRID_GAP = "clamp(14px, 2.8vw, 34px)";
const HEADER_H = "clamp(48px, 5.5vw, 64px)";

/* ===================== Flip Card ===================== */

/** حجم الخط حسب طول الكلمة */
const getFontSize = (text: string) => {
  const len = text.trim().length;
  if (len <= 3) return "clamp(24px, 3.4vw, 46px)";
  if (len <= 6) return "clamp(20px, 2.7vw, 38px)";
  if (len <= 9) return "clamp(16px, 2.1vw, 30px)";
  return "clamp(13px, 1.7vw, 24px)";
};

function GameCard({
  card,
  index,
  onClick,
  disabled,
}: {
  card: Card;
  index: number;
  onClick: () => void;
  disabled?: boolean;
}) {
  const isFlipped = card.flipped || card.matched;
  const canClick = !disabled && !card.matched && !card.flipped;

  return (
    <motion.div
      style={{
        width: CARD_SIZE,
        height: CARD_SIZE,
        perspective: "800px",
        cursor: canClick ? "pointer" : "default",
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={canClick ? onClick : undefined}
    >
      <motion.div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.5,
          type: "spring",
          stiffness: 120,
          damping: 15,
        }}
      >
        {/* ظهر البطاقة (علامة الاستفهام) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: CARD_RADIUS,
            boxShadow: "0 6px 12px rgba(0,0,0,0.18)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(0deg)",
          }}
        >
          <img
            src={backImg}
            alt=""
            draggable={false}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              objectFit: "fill",
              borderRadius: CARD_RADIUS,
              userSelect: "none",
            }}
          />
        </div>

        {/* واجهة البطاقة (المحتوى) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            boxSizing: "border-box",
            borderRadius: CARD_RADIUS,
            backgroundColor: "#ffffff",
            border: `3px solid ${card.matched ? "#fad656" : "#e6d9ef"}`,
            boxShadow: "0 6px 12px rgba(0,0,0,0.18)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 8,
            textAlign: "center",
          }}
        >
          <span
            style={{
              color: PURPLE,
              fontFamily: "tajawal",
              fontWeight: 700,
              lineHeight: 1.1,
              fontSize: getFontSize(card.content),
              wordBreak: "break-word",
            }}
          >
            {card.content}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ===================== Toast ===================== */

function MovesToast({ text }: { text: string | null }) {
  if (!text) return null;

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 110,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        padding: "12px 24px",
        borderRadius: 16,
        border: `4px solid ${PURPLE}`,
        backgroundColor: "#ffffff",
        color: PURPLE,
        fontSize: 20,
        fontFamily: "tajawal",
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
      }}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
    >
      {text}
    </motion.div>
  );
}

/* ===================== Game ===================== */
const pillBase: React.CSSProperties = {
  height: 58,
  padding: "0 28px",
  borderRadius: 9999,
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  fontFamily: "tajawal",
  fontWeight: 700,
  fontSize: 18,
  whiteSpace: "nowrap",
  boxShadow: "0 6px 14px rgba(0,0,0,0.18)",
};
export function MemoryMatchGame() {
  /* ---------- State ---------- */
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [pairs, setPairs] = useState<{ letter: string; word: string }[]>([]);

  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [movesToastText, setMovesToastText] = useState<string | null>(null);
  const [minLoadElapsed, setMinLoadElapsed] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);

  const [gameLessonId, setGameLessonId] = useState<number | null>(null);
  const [startTime] = useState(Date.now());

  /* ---------- Router / Redux ---------- */
  const { letter } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();

  const { letters } = useSelector((state: RootState) => state.letters);
  const currentLetter = letters.find((l) => l.symbol === letter);
  const letterId = currentLetter?.id;
  const letterName = currentLetter?.name;

  /* ---------- Helpers ---------- */

  const getDuration = () => Math.floor((Date.now() - startTime) / 1000);

  /* ---------- Effects ---------- */
  // Minimum loader duration (2 seconds)
  useEffect(() => {
    const timer = setTimeout(() => setMinLoadElapsed(true), 2000);
    return () => clearTimeout(timer);
  }, []);
  // Fetch letters if not loaded
  useEffect(() => {
    if (!letters.length) {
      dispatch(fetchLetters());
    }
  }, [dispatch, letters.length]);

  // Fetch game data
  useEffect(() => {
    if (!letterId) return;

    const fetchGameData = async () => {
      try {
        const res = await api.get("/lessons/games-lessons/by-letter-and-type", {
          params: {
            letter,
            gameType: "memory_match",
          },
        });

        const game = res.data.data;
        if (!game || !game.data?.pairs) return;

        const formatted = game.data.pairs.map((pair: any) => ({
          letter: pair.letter.trim(),
          word: pair.word,
        }));

        setGameLessonId(game.game_lesson_id);
        setPairs(formatted);
        initializeGame(formatted);
      } catch (error) {
        console.error("Error fetching memory match game", error);
      }
    };

    fetchGameData();
  }, [letterId]);

  // Save result on end
  useEffect(() => {
    if ((!gameWon && !gameLost) || !gameLessonId) return;

    saveGameResult({
      games_lessons_id: gameLessonId,
      score,
      duration: getDuration(),
    }).catch(console.error);
  }, [gameWon, gameLost, gameLessonId]);

  // Lose condition
  useEffect(() => {
    if (moves >= 10 && !gameWon) {
      setGameLost(true);
    }
  }, [moves, gameWon]);

  /* ---------- Game Logic ---------- */

  const initializeGame = (gamePairs = pairs) => {
    setGameLost(false);
    setGameWon(false);

    const selectedPairs = gamePairs.slice(0, 6);
    const gameCards: Card[] = [];

    selectedPairs.forEach((pair, index) => {
      gameCards.push({
        id: index * 2,
        content: pair.letter,
        type: "letter",
        matched: false,
        flipped: false,
      });

      gameCards.push({
        id: index * 2 + 1,
        content: pair.word,
        type: "word",
        matched: false,
        flipped: false,
      });
    });

    setCards(gameCards.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setScore(0);
    setMoves(0);
  };

  const handleCardClick = (cardId: number) => {
    if (gameLost) return;
    if (flippedCards.length === 2) return;
    if (flippedCards.includes(cardId)) return;
    if (cards.find((c) => c.id === cardId)?.matched) return;

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, flipped: true } : card,
      ),
    );

    if (newFlipped.length === 2) {
      setMoves((prev) => {
        const next = prev + 1;
        setMovesToastText(`حركة: ${next} / 10`);
        setTimeout(() => setMovesToastText(null), 1200);
        return next;
      });

      checkMatch(newFlipped);
    }
  };

  const checkMatch = (flipped: number[]) => {
    const [first, second] = flipped;
    const firstCard = cards.find((c) => c.id === first);
    const secondCard = cards.find((c) => c.id === second);

    if (!firstCard || !secondCard) return;

    setTimeout(() => {
      const isMatch =
        (firstCard.type === "letter" &&
          secondCard.type === "word" &&
          secondCard.content.startsWith(firstCard.content)) ||
        (secondCard.type === "letter" &&
          firstCard.type === "word" &&
          firstCard.content.startsWith(secondCard.content));

      if (isMatch) {
        setCards((prev) =>
          prev.map((card) =>
            card.id === first || card.id === second
              ? { ...card, matched: true, flipped: true }
              : card,
          ),
        );
        setScore((s) => s + 10);

        const allMatched = cards
          .filter((c) => c.id !== first && c.id !== second)
          .every((c) => c.matched);

        if (allMatched) {
          setTimeout(() => setGameWon(true), 500);
        }
      } else {
        setCards((prev) =>
          prev.map((card) =>
            card.id === first || card.id === second
              ? { ...card, flipped: false }
              : card,
          ),
        );
      }

      setFlippedCards([]);
    }, 1000);
  };

  /* ---------- Loading ---------- */

  const isGameReady = pairs.length > 0;
  if (!isGameReady || !minLoadElapsed) {
    return <GameLoadingScreen game_name={"wordMatch"} />;
  }

  /* ---------- Render ---------- */

  return (
    <div
      dir="rtl"
      style={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#E6DBFF",
        backgroundImage: `url("${background}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* ------------------------------ Header ------------------------------ */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          padding: "16px clamp(16px, 3vw, 40px) 0",
          boxSizing: "border-box",
        }}
      >
        <div style={{ position: "relative", maxWidth: 1152, margin: "0 auto" }}>
          {/* الشريط الأبيض */}
          <div
            style={{
              height: HEADER_H,
              borderRadius: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 12px",
              boxSizing: "border-box",
              backgroundColor: "rgba(255,255,255,0.92)",
              boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
            }}
          >
            <button
              onClick={() => navigate(`/letter/${letter}/games`)}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                backgroundColor: "#FF6B6B",
                color: "white",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              }}
            >
              <X size={30} />
            </button>

            <h2
              style={{
                margin: 0,
                padding: "0 8px",
                textAlign: "center",
                color: TEXT_DARK,
                fontFamily: "tajawal",
                fontWeight: 400,
                fontSize: "clamp(12px, 1.5vw, 20px)",
              }}
            >
              اقلب البطاقات وطابق ال{letterName} مع الكلمات
            </h2>

            {/* مساحة فاضية بمكان كبسولة النقاط */}
            <div
              style={{ width: "clamp(100px, 11vw, 150px)", flexShrink: 0 }}
            />
          </div>

          {/* كبسولة النقاط (يسار) */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: HEADER_H,
              padding: "0 clamp(16px, 2vw, 28px)",
              borderRadius: 9999,
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "white",
              background: "linear-gradient(90deg, #6B2F8E 0%, #C98BF5 100%)",
              boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
            }}
          >
            <Star size={26} color="white" />
            <span
              style={{
                fontFamily: "tajawal",
                fontWeight: 500,
                fontSize: "clamp(20px, 2.4vw, 32px)",
              }}
            >
              {score}
            </span>
          </div>

          {/* عداد الحركات تحت الكبسولة */}
          <div
            style={{
              position: "absolute",
              left: 24,
              top: "100%",
              marginTop: 4,
              color: PURPLE,
              fontFamily: "tajawal",
              fontWeight: 500,
              fontSize: "clamp(12px, 1.2vw, 16px)",
            }}
          >
            حركة: {moves}/10
          </div>
        </div>
      </div>

      {/* ---------------------------- Game Area ---------------------------- */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxSizing: "border-box",
          paddingTop: "clamp(120px, 12.5vw, 170px)",
          paddingBottom: 24,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(4, ${CARD_SIZE})`,
            gap: GRID_GAP,
            justifyContent: "center",
          }}
        >
          {cards.map((card, index) => (
            <GameCard
              key={card.id}
              card={card}
              index={index}
              disabled={gameLost || flippedCards.length >= 2}
              onClick={() => handleCardClick(card.id)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        <MovesToast text={movesToastText} />
      </AnimatePresence>

      {/* Game Won */}
      {gameWon && !gameLost && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white rounded-[28px] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] text-center max-w-md w-full mx-4 relative overflow-hidden"
            initial={{ scale: 0.7, y: 80 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.7, y: 80 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{ borderRadius: "20px" }}
            dir="rtl"
          >
            {/* الزخرفة الصفراء */}
            <img className="absolute top-0 left-0" src={vectorEnd} />

            {/* أيقونة الوسام */}
            <div className="relative z-10 flex justify-center mb-4">
              <div className="text-[#FDC333] text-5xl">
                <img src={badegEnd} />
              </div>
            </div>
            <motion.h2
              className="text-2xl md:text-3xl mb-2"
              style={{
                color: "#28345F",
                fontFamily: "tajawal",
                fontSize: "30px",
                fontWeight: "500",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              احسنت
            </motion.h2>
            <p
              className="text-[#28345F] text-base mb-1"
              style={{
                color: "#28345F",
                fontFamily: "tajawal",
                fontSize: "20px",
                fontWeight: "500",
              }}
            >
              نقاطك:{" "}
              <span
                className="font-semibold"
                style={{
                  color: "#28345F",
                  fontFamily: "tajawal",
                  fontSize: "20px",
                  fontWeight: "500",
                }}
              >
                {score}
              </span>
            </p>
            <p
              className="text-[#28345F] text-base mb-1"
              style={{
                color: "#EE0000",
                fontFamily: "tajawal",
                fontSize: "20px",
                fontWeight: "500",
              }}
            >
              عدد الحركات: {moves}
            </p>

            <div
              className="flex gap-4 justify-center"
              style={{ marginTop: "20px" }}
            >
              <button
                onClick={() => initializeGame()}
                style={{
                  ...pillBase,
                  color: "#ffffff",
                  background:
                    "linear-gradient(90deg, #D08FF7 0%, #652B82 100%)",
                }}
              >
                <img src={restart} className="w-6 h-6" />
                <span>العب مرة أخرى</span>
              </button>

              <button
                onClick={() => navigate(`/letter/${letter}/games`)}
                style={{
                  ...pillBase,
                  color: TEXT_DARK,
                  background:
                    "linear-gradient(90deg, #FFD93D 0%, #FDB913 100%)",
                }}
              >
                رجوع
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Game Lost */}
      {gameLost && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white rounded-[28px] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] text-center max-w-md w-full mx-4 relative overflow-hidden"
            initial={{ scale: 0.7, y: 80 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.7, y: 80 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{ borderRadius: "20px" }}
            dir="rtl"
          >
            {/* الزخرفة الصفراء */}
            <img className="absolute top-0 left-0" src={vectorEnd} />

            {/* أيقونة الوسام */}
            <div className="relative z-10 flex justify-center mb-4">
              <div className="text-[#FDC333] text-5xl">
                <img src={badegEnd} />
              </div>
            </div>
            <motion.h2
              className="text-2xl md:text-3xl mb-2"
              style={{
                color: "#28345F",
                fontFamily: "tajawal",
                fontSize: "30px",
                fontWeight: "500",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              انتهت اللعبه
            </motion.h2>
            <p
              className="mb-2"
              style={{
                color: "#28345fae",
                fontFamily: "tajawal",
                fontSize: "20px",
                fontWeight: "400",
              }}
            >
              وصلت إلى الحد الأقصى من المحاولات
            </p>
            <p
              className="text-[#28345F] text-base mb-4"
              style={{
                color: "#EE0000",
                fontFamily: "tajawal",
                fontSize: "20px",
                fontWeight: "500",
              }}
            >
              عدد الحركات: {moves}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => initializeGame()}
                style={{ backgroundColor: "#652B82" }}
                className="px-6 py-4 flex rounded-xl text-white font-medium shadow-md hover:scale-105 transition"
              >
                <img src={restart} className="w-6 h-6" />
                <span>العب مرة أخرى</span>
              </button>

              <button
                onClick={() => navigate(`/letter/${letter}/games`)}
                style={{ backgroundColor: "#FDC333", color: "#652B82" }}
                className="px-6 py-2.5 rounded-xl text-[#28345F] font-medium shadow-md hover:scale-105 transition"
              >
                رجوع
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
