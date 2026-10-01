import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Star, X } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import api from "../../API/axios";
import redBalloon from "../../assets/pink.svg";
import pinkBalloon from "../../assets/pink_balloon copy.svg";
import yellowBalloon from "../../assets/yallow.svg";
import blueBalloon from "../../assets/blue_balloon copy.svg";
import vectorEnd from "../../assets/vector_end.svg";
import badegEnd from "../../assets/badeg_end.svg";
import restart from "../../assets/Repeat.svg";
import { saveGameResult } from "../../API/gameResult";
import { RootState } from "../../redux/store";
import { fetchLetters } from "../../redux/reducers/lettersSlice";
import { GameLoadingScreen } from "./WordCatchWelcom";
import balloon_burst from "../../assets/balloon pop.mp3";
import background from "../../assets/background-game-balloon.png";
import "./BalloonPopGame.css";

/* ===================== Types ===================== */
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
interface Balloon {
  id: number;
  word: string;
  startsWithAlef: boolean;
  x: number;
  y: number;
  imageSrc: string;
  handled?: boolean;
  popped?: boolean;
}

interface BalloonWord {
  word: string;
  startsWithTarget: boolean;
}

interface BalloonPopConfig {
  title: string;
  instruction: string;
  targetLetter: string;
  scorePerCorrect: number;
  maxMistakes: number;
  spawn: {
    baseInterval: number;
    levelFactor: number;
    minInterval: number;
  };
  speed: {
    baseDuration: number;
    levelIncrease: number;
    minDuration: number;
  };
  words: BalloonWord[];
}

/* ===================== Constants ===================== */

const BALLOON_IMAGES = [redBalloon, pinkBalloon, yellowBalloon, blueBalloon];
const POP_DISAPPEAR_DELAY_MS = 0;

// أحجام inline (لا تعتمد على Tailwind)
const TEXT_DARK = "#28345F";
const PURPLE = "#652b82";
const HEADER_H = "clamp(48px, 5.5vw, 64px)";
const BALLOON_SIZE = "clamp(110px, 12vw, 170px)";

const playPopSound = () => {
  const audio = new Audio(balloon_burst);
  audio.volume = 0.5;
  audio.play();
};

/* ===================== Toast ===================== */

function MistakeToast({ text }: { text: string | null }) {
  if (!text) return null;

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 130,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        padding: "12px 24px",
        borderRadius: 16,
        border: "4px solid #ef4444",
        backgroundColor: "#ffffff",
        color: "#ef4444",
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

export function BalloonPopGame() {
  /* ---------- State ---------- */
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);

  const [balloons, setBalloons] = useState<Balloon[]>([]);
  // نستخدم ref بدل الـ state جوا الـ interval لتفادي إعادة تشغيل الـ effect مع كل بالون
  const nextIdRef = useRef(0);

  const [gameOver, setGameOver] = useState(false);
  const [mistakeToastText, setMistakeToastText] = useState<string | null>(null);
  const [minLoadElapsed, setMinLoadElapsed] = useState(false);

  const [config, setConfig] = useState<BalloonPopConfig | null>(null);
  const [loading, setLoading] = useState(true);
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

  // Fetch letters
  useEffect(() => {
    if (!letters.length) {
      dispatch(fetchLetters());
    }
  }, [dispatch, letters.length]);

  // Fetch game config
  useEffect(() => {
    if (!letter || !letterId) return;

    const fetchGame = async () => {
      try {
        const res = await api.get("/lessons/games-lessons/by-letter-and-type", {
          params: {
            letter,
            gameType: "balloon_pop",
          },
        });

        const game = res.data.data;
        setGameLessonId(game.game_lesson_id);
        setConfig(game.data);
      } catch (err) {
        console.error("Error loading balloon game", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [letter, letterId]);

  // Spawn balloons
  useEffect(() => {
    if (!config || gameOver || lives <= 0 || correctCount >= 10) return;

    const spawnInterval = Math.max(
      config.spawn.baseInterval - level * config.spawn.levelFactor,
      config.spawn.minInterval,
    );

    const spawnBalloon = () => {
      const randomWord =
        config.words[Math.floor(Math.random() * config.words.length)];

      const id = nextIdRef.current;
      nextIdRef.current += 1;

      setBalloons((prev) => [
        ...prev,
        {
          id,
          word: randomWord.word,
          startsWithAlef: randomWord.startsWithTarget,
          // توزيع البالونات على عرض الشاشة كامل (متل الصورة)
          x: Math.random() * 84 + 8,
          y: 120,
          imageSrc:
            BALLOON_IMAGES[Math.floor(Math.random() * BALLOON_IMAGES.length)],
        },
      ]);
    };

    // أول بالون يطلع فوراً بدل ما ينتظر spawnInterval كامل
    spawnBalloon();

    const interval = setInterval(spawnBalloon, spawnInterval);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, gameOver, lives, level, correctCount]);

  // Level up
  useEffect(() => {
    if (score >= level * 50) {
      setLevel((prev) => prev + 1);
    }
  }, [score, level]);

  // Game over condition
  useEffect(() => {
    if (lives <= 0 || correctCount >= 10) {
      setGameOver(true);
    }
  }, [lives, correctCount]);

  // Save result
  useEffect(() => {
    if (!gameOver || !gameLessonId) return;

    saveGameResult({
      games_lessons_id: gameLessonId,
      score,
      duration: getDuration(),
    }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver]);

  /* ---------- Handlers ---------- */

  const showMistakeToast = (nextLives: number) => {
    if (!config) return;

    setMistakeToastText(
      `خطأ ❌ ${config.maxMistakes - nextLives} / ${config.maxMistakes}`,
    );
    setTimeout(() => setMistakeToastText(null), 1200);
  };

  const handleBalloonClick = (balloon: Balloon) => {
    if (!config || gameOver || balloon.handled) return;

    playPopSound();

    if (balloon.startsWithAlef) {
      setCorrectCount((c) => c + 1);
      setScore((s) => s + config.scorePerCorrect);

      // تشغيل الانفجار
      setBalloons((prev) =>
        prev.map((b) =>
          b.id === balloon.id ? { ...b, popped: true, handled: true } : b,
        ),
      );

      // حذف بعد الانيميشن
      setTimeout(() => {
        setBalloons((prev) => prev.filter((b) => b.id !== balloon.id));
      }, 1500);
    } else {
      setLives((prev) => {
        const next = prev - 1;
        showMistakeToast(next);
        return next;
      });
    }
  };

  const handleBalloonEscape = (balloonId: number) => {
    const balloon = balloons.find((b) => b.id === balloonId);
    if (!balloon || gameOver || balloon.handled) return;

    if (balloon.startsWithAlef) {
      setLives((prev) => {
        const next = prev - 1;
        showMistakeToast(next);
        return next;
      });
    }

    setBalloons((prev) => prev.filter((b) => b.id !== balloonId));
  };

  const resetGame = () => {
    setScore(0);
    setCorrectCount(0);
    setLives(config?.maxMistakes ?? 3);
    setBalloons([]);
    nextIdRef.current = 0;
    setGameOver(false);
    setLevel(1);
  };

  /* ---------- Render Guards ---------- */

  if (loading || !minLoadElapsed) {
    return <GameLoadingScreen game_name={"balloon"} />;
  }

  if (!config) {
    return <div className="text-center mt-20">لا توجد بيانات للعبة</div>;
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
                backgroundColor: "#ff0000",
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
              افرقع البالونات التي تحتوي على كلمات تبدأ بحرف ال{letterName}
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

          {/* المستوى + الأرواح تحت الكبسولة */}
          <div
            dir="rtl"
            style={{
              position: "absolute",
              left: 28,
              top: "100%",
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              gap: "clamp(14px, 2vw, 28px)",
            }}
          >
            <span
              style={{
                color: PURPLE,
                fontFamily: "tajawal",
                fontWeight: 500,
                fontSize: "clamp(14px, 1.6vw, 20px)",
                whiteSpace: "nowrap",
              }}
            >
              المستوى {level}
            </span>

            <div style={{ display: "flex", gap: 8 }}>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: "clamp(16px, 1.8vw, 22px)",
                    height: "clamp(16px, 1.8vw, 22px)",
                    borderRadius: "50%",
                    backgroundColor: i < lives ? "#FC4637" : "#d1d5db",
                    transition: "background-color 0.2s ease",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------ Balloons ------------------------------ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxSizing: "border-box",
          paddingTop: "clamp(90px, 10vw, 120px)",
          paddingBottom: 32,
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <AnimatePresence>
            {balloons.map((balloon) => (
              <motion.button
                key={balloon.id}
                initial={{ y: "100vh", scale: 1 }}
                animate={
                  balloon.popped
                    ? { y: 0, scale: [1, 1.3, 0], opacity: [1, 1, 0] }
                    : { y: "-90vh" }
                }
                transition={
                  balloon.popped
                    ? {
                        duration: 1.4,
                        times: [0, 0.5, 1],
                        ease: "easeOut",
                      }
                    : {
                        duration: 14 - level * 0.3,
                        ease: "linear",
                      }
                }
                onAnimationComplete={() => handleBalloonEscape(balloon.id)}
                onClick={() => handleBalloonClick(balloon)}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: `${balloon.x}%`,
                  // تمركز البالون على نقطة x (بدون transform حتى ما يتعارض مع framer-motion)
                  marginLeft: `calc(${BALLOON_SIZE} / -2)`,
                  width: BALLOON_SIZE,
                  height: BALLOON_SIZE,
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  zIndex: 0,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.8 }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <img
                    src={balloon.imageSrc}
                    alt=""
                    draggable={false}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      pointerEvents: "none",
                      userSelect: "none",
                      display: "block",
                    }}
                  />

                  {/* شظايا الانفجار */}
                  {balloon.popped && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                      }}
                    >
                      {[...Array(10)].map((_, i) => (
                        <motion.span
                          key={i}
                          style={{
                            position: "absolute",
                            top: "35%",
                            left: "50%",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: [
                              "#ffffff",
                              "#FFD93D",
                              "#FF6B6B",
                              "#6BCB77",
                            ][i % 4],
                          }}
                          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                          animate={{
                            x: (Math.random() - 0.5) * 120,
                            y: (Math.random() - 0.5) * 120,
                            opacity: 0,
                            scale: 0.5,
                          }}
                          transition={{ duration: 1 }}
                        />
                      ))}
                    </div>
                  )}

                  {/* الكلمة داخل جسم البالون */}
                  <span
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "32%",
                      transform: "translate(-50%, -50%)",
                      whiteSpace: "nowrap",
                      color: "#ffffff",
                      fontFamily: "tajawal",
                      fontWeight: 500,
                      lineHeight: 1,
                      fontSize: "clamp(18px, 2.2vw, 30px)",
                      textShadow: "1px 2px 4px rgba(0,0,0,0.35)",
                      pointerEvents: "none",
                    }}
                  >
                    {balloon.word}
                  </span>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        <MistakeToast text={mistakeToastText} />
      </AnimatePresence>

      {/* Game Over */}
      {gameOver && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
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
              وصلت للمستوى :{" "}
              <span
                className="font-semibold"
                style={{
                  color: "#EE0000",
                  fontFamily: "tajawal",
                  fontSize: "20px",
                  fontWeight: "500",
                }}
              >
                {level}
              </span>
            </p>
            <div className="flex gap-4 justify-center">
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
