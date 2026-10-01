import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Award, RotateCcw, X } from "lucide-react";
import stars from "../../assets/Star.svg";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from "../../API/axios";
import { saveGameResult } from "../../API/gameResult";
import { RootState } from "../../redux/store";
import { fetchLetters } from "../../redux/reducers/lettersSlice";
import { GameLoadingScreen } from "./WordCatchWelcom";
import vectorEnd from "../../assets/vector_end.svg";
import badegEnd from "../../assets/badeg_end.svg";
import background from "../../assets/background-game-catch.png";
import restart from "../../assets/Repeat.svg";
/* ===================== Types ===================== */

interface FallingWord {
  id: number;
  word: string;
  startsWithAlef: boolean;
  x: number;
  speed: number;
}

interface WordCatchConfig {
  correctWords: string[];
  wrongWords: string[];
  maxMistakes: number;
  scorePerCorrect: number;
  spawnIntervalMs: number;
  minSpeed: number;
  maxSpeed: number;
  instruction: string;
}

/* ===================== Bubble colors ===================== */

const BUBBLE_COLORS = ["#FDB813", "#4FC3F7", "#8BC34A", "#EF5350", "#5C6BC0"];
const TEXT_DARK = "#28345F";
/* ===================== Toast ===================== */
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
function FallingBubble({
  word,
  onComplete,
  onClick,
}: {
  word: FallingWord;
  onComplete: () => void;
  onClick: () => void;
}) {
  const duration = word.speed * 5;

  const fallHeight =
    typeof window !== "undefined" ? window.innerHeight + 100 : 900;

  const borderColor = BUBBLE_COLORS[word.id % BUBBLE_COLORS.length];

  return (
    <div
      className="absolute top-0"
      style={{
        left: `${word.x}%`,
        transform: "translateX(-50%)",
      }}
    >
      <motion.button
        initial={{ y: -60, scale: 1.15, opacity: 1 }}
        animate={{
          y: fallHeight,
          scale: 0,
          opacity: 0,
        }}
        transition={{
          duration,
          ease: "linear",
        }}
        onAnimationComplete={onComplete}
        onClick={onClick}
        className="flex items-center justify-center cursor-pointer rounded-full aspect-square min-w-[5rem] min-h-[5rem] p-3"
        style={{
          backgroundColor: "#FFFFFF",
          border: `2px dashed ${borderColor}`,
          height: "90px",
          width: "90px",
          color: "#28345F",
          fontSize: "clamp(1rem, 2.5vw, 1.75rem)",
          fontFamily: "inherit",
          boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {word.word}
      </motion.button>
    </div>
  );
}

/* ===================== Game ===================== */

export function WordCatchGame() {
  /* ---------- State ---------- */
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const [words, setWords] = useState<FallingWord[]>([]);

  const [mistakeText, setMistakeText] = useState<string | null>(null);
  const [config, setConfig] = useState<WordCatchConfig | null>(null);
  const [gameLessonId, setGameLessonId] = useState<number | null>(null);
  const [minLoadElapsed, setMinLoadElapsed] = useState(false);

  /* ---------- Refs (مصدر الحقيقة للعدّادات، ما بتتأثر بالـ closures القديمة) ---------- */
  const mistakesRef = useRef(0);
  const correctRef = useRef(0);
  const gameOverRef = useRef(false);
  const nextIdRef = useRef(0);
  // الكلمات اللي انحسبت (انكبست أو فاتت): كل كلمة بتنحسب مرة وحدة بس
  const resolvedRef = useRef<Set<number>>(new Set());
  const startTimeRef = useRef(Date.now());

  /* ---------- Constants ---------- */
  const MAX_CORRECT_WORDS = 10;
  // ✅ نفس القيمة بالمنطق وبالعرض (قبل: ثابت 3 بالمنطق و config.maxMistakes بالعرض)
  const maxMistakes = config?.maxMistakes ?? 3;

  /* ---------- Router / Redux ---------- */
  const { letter } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();

  const { letters } = useSelector((state: RootState) => state.letters);
  const currentLetter = letters.find((l) => l.symbol === letter);
  const letterId = currentLetter?.id;
  const letterName = currentLetter?.name;

  /* ---------- Helpers ---------- */

  const getDuration = () =>
    Math.floor((Date.now() - startTimeRef.current) / 1000);

  const getSpeedMultiplier = (count: number) => {
    if (count < 3) return 1;
    if (count < 6) return 1.2;
    if (count < 9) return 1.4;
    return 1.6;
  };

  const endGame = () => {
    if (gameOverRef.current) return;
    gameOverRef.current = true;
    setGameOver(true);
  };

  // ✅ بتأكد إنو كل كلمة بتنحسب مرة وحدة (كبسة أو فوات)، وبتشيلها من الشاشة
  const resolveWord = (id: number) => {
    if (resolvedRef.current.has(id)) return false;
    resolvedRef.current.add(id);
    setWords((prev) => prev.filter((w) => w.id !== id));
    return true;
  };

  // ✅ بدون side effects داخل setState updater
  const triggerMistake = () => {
    if (gameOverRef.current) return;

    const next = Math.min(mistakesRef.current + 1, maxMistakes);
    mistakesRef.current = next;
    setMistakes(next);

    setMistakeText(`خطأ ❌ ${next} / ${maxMistakes}`);
    setTimeout(() => setMistakeText(null), 1200);

    if (next >= maxMistakes) endGame();
  };

  const resetGame = () => {
    mistakesRef.current = 0;
    correctRef.current = 0;
    gameOverRef.current = false;
    nextIdRef.current = 0;
    resolvedRef.current = new Set();
    startTimeRef.current = Date.now();

    setScore(0);
    setMistakes(0);
    setCorrectCount(0);
    setWords([]);
    setMistakeText(null);
    setGameOver(false);
  };

  /* ---------- Effects ---------- */
  // Minimum loader duration (3 seconds)
  useEffect(() => {
    const timer = setTimeout(() => setMinLoadElapsed(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch letters
  useEffect(() => {
    if (!letters.length) {
      dispatch(fetchLetters());
    }
  }, [dispatch, letters.length]);

  // Fetch game config
  useEffect(() => {
    if (!letter || !letterId) return;

    const fetchConfig = async () => {
      try {
        const res = await api.get("/lessons/games-lessons/by-letter-and-type", {
          params: { letter, gameType: "word_catch" },
        });

        setGameLessonId(res.data.data.game_lesson_id);
        setConfig(res.data.data.data);
      } catch (err) {
        console.error("Error fetching game config", err);
      }
    };

    fetchConfig();
  }, [letter, letterId]);

  // Spawn words — دفعة من 1 إلى 3 كلمات مع بعض، كلها ضمن نطاق الهيدر
  useEffect(() => {
    if (!config || gameOver) return;

    const interval = setInterval(() => {
      if (gameOverRef.current) return;

      const allWords = [
        ...config.correctWords.map((w) => ({
          word: w,
          startsWithAlef: true,
        })),
        ...config.wrongWords.map((w) => ({
          word: w,
          startsWithAlef: false,
        })),
      ];

      const multiplier = getSpeedMultiplier(correctCount);

      // كم كلمة رح تنزل مع بعض بهالدفعة (1 - 3)
      const batchSize = Math.floor(Math.random() * 3) + 1;

      // نقسم عرض المنطقة لسلوتات بعدد الكلمات عشان ما تتزاحم
      const slotWidth = 100 / batchSize;

      // ✅ الـ ids من ref (مش من داخل setState updater) عشان ما يتكرروا
      const startId = nextIdRef.current;
      nextIdRef.current += batchSize;

      const newWords: FallingWord[] = Array.from(
        { length: batchSize },
        (_, i) => {
          const randomWord =
            allWords[Math.floor(Math.random() * allWords.length)];

          const slotStart = slotWidth * i;
          const rawX = slotStart + Math.random() * slotWidth;
          const x = Math.min(Math.max(rawX, 8), 92);

          return {
            id: startId + i,
            word: randomWord.word,
            startsWithAlef: randomWord.startsWithAlef,
            x,
            speed:
              (Math.random() * (config.maxSpeed - config.minSpeed) +
                config.minSpeed) /
              multiplier,
          };
        },
      );

      setWords((prev) => [...prev, ...newWords]);
    }, config.spawnIntervalMs);

    return () => clearInterval(interval);
  }, [config, gameOver, correctCount]);

  // Save result on game over
  useEffect(() => {
    if (!gameOver || !gameLessonId) return;

    saveGameResult({
      games_lessons_id: gameLessonId,
      score,
      duration: getDuration(),
    }).catch(console.error);
  }, [gameOver, gameLessonId]);

  /* ---------- Handlers ---------- */

  const handleWordClick = (word: FallingWord) => {
    if (gameOverRef.current) return;
    // ✅ كل كلمة بتنحسب مرة وحدة (بيمنع الكبس المتكرر على نفس الكلمة)
    if (!resolveWord(word.id)) return;

    if (word.startsWithAlef) {
      setScore((s) => s + config!.scorePerCorrect);

      const next = correctRef.current + 1;
      correctRef.current = next;
      setCorrectCount(next);
      if (next >= MAX_CORRECT_WORDS) endGame();
    } else {
      // كلمة غلط: خطأ واحد وبتختفي
      triggerMistake();
    }
  };

  // ✅ بناخد الكلمة نفسها (مش بنبحث عنها بالـ words القديمة)
  const handleWordMiss = (word: FallingWord) => {
    if (gameOverRef.current) return;
    if (!resolveWord(word.id)) return;

    // فاتتك كلمة صحيحة = خطأ. فوات كلمة غلط عادي.
    if (word.startsWithAlef) {
      triggerMistake();
    }
  };

  /* ---------- Loading ---------- */

  if (!config || !minLoadElapsed) {
    return <GameLoadingScreen game_name={"catchWord"} />;
  }

  /* ---------- Render ---------- */

  return (
    <div
      className="h-screen relative overflow-hidden"
      dir="rtl"
      style={{
        backgroundImage: `url("${background}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Header — بار عائم دائري */}
      <div className="absolute top-4 left-4 right-4 z-30">
        <div
          className="max-w-6xl mx-auto flex items-center gap-3 px-3 py-2 rounded-full"
          style={{
            backgroundColor: "#FFFFFF",
            boxShadow: "0 14px 30px rgba(40, 52, 95, 0.16)",
          }}
        >
          {/* Close */}
          <button
            onClick={() => navigate(`/letter/${letter}/games`)}
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#ff0a12" }}
          >
            <X className="w-8 h-8 text-white" />
          </button>

          {/* Instruction */}
          <p
            className="flex-1 text-center text-base md:text-xl lg:text-2xl px-2 truncate"
            style={{
              color: "#28345F",
              fontFamily: "tajawal",
              fontWeight: "700",
            }}
          >
            {config.instruction}
          </p>

          {/* Score */}
          <div
            className="flex items-center gap-2 px-5 py-2 rounded-full shrink-0"
            style={{
              background: "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)",
            }}
          >
            <span
              className="text-xl"
              style={{
                color: "#F9F9F9",
                fontFamily: "tajawal",
                fontSize: "20px",
                fontWeight: "700",
              }}
            >
              {score}
            </span>
            <Star className="w-8 h-8" color="#ffffff" strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* Errors — تحت الهيدر مباشرة */}
      <div
        className="absolute z-20 text-xl font-medium"
        style={{
          top: "84px",
          left: "28px",
          color: "#EE0000",
          fontFamily: "tajawal",
          fontSize: "18px",
          fontWeight: "700",
        }}
      >
        أخطاء {mistakes}/{maxMistakes}
      </div>

      {/* Game Area — نفس عرض الهيدر بالضبط (max-w-6xl + نفس الهوامش الجانبية) */}
      <div className="absolute inset-0 pt-24 pb-24 px-4">
        <div className="h-full relative max-w-6xl mx-auto">
          <AnimatePresence>
            {words.map((word) => (
              <FallingBubble
                key={word.id}
                word={word}
                onComplete={() => handleWordMiss(word)}
                onClick={() => handleWordClick(word)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Game Over */}
      {gameOver && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
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

            {/* العنوان */}
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
            {/* التفاصيل */}
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
              عددالاخطاء :{" "}
              <span
                className="font-semibold"
                style={{
                  color: "#EE0000",
                  fontFamily: "tajawal",
                  fontSize: "20px",
                  fontWeight: "500",
                }}
              >
                {mistakes}
              </span>
            </p>
            <div
              className="flex gap-4 justify-center"
              style={{ marginTop: "20px" }}
            >
              <button
                onClick={resetGame}
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
    </div>
  );
}