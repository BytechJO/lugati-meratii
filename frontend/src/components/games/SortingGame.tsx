import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Star, X } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../API/axios";
import { saveGameResult } from "../../API/gameResult";
import { RootState } from "../../redux/store";
import { fetchLetters } from "../../redux/reducers/lettersSlice";
import { useDispatch, useSelector } from "react-redux";
import vectorEnd from "../../assets/vector_end.svg";
import badegEnd from "../../assets/badeg_end.svg";
import restart from "../../assets/Repeat.svg";
import background from "../../assets/background-game-sort.png";
import wordCard from "../../assets/wordCard-sortGame.svg";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  useDraggable,
  useDroppable,
  DragOverlay,
  pointerWithin,
} from "@dnd-kit/core";
import { GameLoadingScreen } from "./WordCatchWelcom";

interface Item {
  id: number;
  word: string;
  startsWithAlef: boolean;
  placed: boolean;
  position: "alif" | "other" | null;
}
interface SortingGameConfig {
  title: string;
  instruction: string;
  targetLetter: string;
  scorePerCorrect: number;
  maxMistakes: number;
  items: { word: string; startsWithTarget: boolean }[];
}

/* ------------------------------- Theme ------------------------------- */

const TEXT_DARK = "#28345F";

const ZONE_THEMES = {
  yellow: {
    border: "#FFC94D",
    outerBg: "linear-gradient(180deg, #FFF6CC 0%, #FFE9A3 100%)",
    innerBorder: "#FFD877",
    pillBg: "linear-gradient(90deg, #FFF3B0 0%, #FFB800 100%)",
    pillColor: "#28345F",
  },
  purple: {
    border: "#6B2F8E",
    outerBg: "linear-gradient(180deg, #F0D9FF 0%, #D9A8F5 100%)",
    innerBorder: "#7B4A9C",
    pillBg: "linear-gradient(90deg, #C98BF5 0%, #6B2F8E 100%)",
    pillColor: "#FFFFFF",
  },
} as const;

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
/* ------------------------- Sizes (inline, لا تعتمد على Tailwind) ------------------------- */

const CARD_SIZE = "clamp(52px, 7.5vw, 96px)";
const PLACED_SIZE = "clamp(56px, 6vw, 80px)";
const OVERLAY_SIZE = "clamp(64px, 8.5vw, 108px)";
const HEADER_H = "clamp(48px, 5.5vw, 64px)";

/* ------------------------- UI Helpers ------------------------- */

function MistakeToast({ text }: { text: string | null }) {
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

/** ستايل بطاقة الكلمة (خلفية wordCard) */
const cardStyle = (size: string): React.CSSProperties => ({
  width: size,
  height: size,
  flexShrink: 0,
  position: "relative",
  backgroundImage: `url("${wordCard}")`,
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
  color: TEXT_DARK,
  fontFamily: "tajawal",
  filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.18))",
});

/** الكلمة بنص الدائرة تبع البطاقة */
function CardWord({ word, fontSize }: { word: string; fontSize: string }) {
  return (
    <span
      style={{
        position: "absolute",
        left: "50%",
        top: "52%",
        transform: "translate(-50%, -50%)",
        whiteSpace: "nowrap",
        fontSize,
        fontWeight: 500,
        lineHeight: 1,
        pointerEvents: "none",
      }}
    >
      {word}
    </span>
  );
}

function DraggableItem({ item, isActive }: { item: Item; isActive: boolean }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: item.id,
    disabled: item.placed, // بعد ما تنحط بمكانها الصح بتصير disabled
  });

  const disabled = item.placed;

  return (
    <motion.div
      ref={setNodeRef}
      {...(disabled ? {} : listeners)}
      {...attributes}
      aria-disabled={disabled}
      style={{
        ...cardStyle(CARD_SIZE),
        opacity: isActive ? 0 : disabled ? 0.4 : 1,
        touchAction: "none",
        cursor: disabled ? "not-allowed" : "grab",
        pointerEvents: disabled ? "none" : "auto",
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={disabled ? undefined : { scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 1.1 }}
    >
      <CardWord word={item.word} fontSize="clamp(13px, 1.7vw, 24px)" />
    </motion.div>
  );
}

function DroppableZone({
  id,
  title,
  variant,
  children,
}: {
  id: "alif" | "other";
  title: string;
  variant: keyof typeof ZONE_THEMES;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const theme = ZONE_THEMES[variant];

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        paddingTop: 16,
        boxSizing: "border-box",
      }}
    >
      {/* Title pill */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          padding: "4px clamp(18px, 2.2vw, 32px)",
          borderRadius: 9999,
          background: theme.pillBg,
          color: theme.pillColor,
          fontFamily: "tajawal",
          fontWeight: 700,
          fontSize: "clamp(12px, 1.3vw, 16px)",
          whiteSpace: "nowrap",
          boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
        }}
      >
        {title}
      </div>

      {/* Outer frame (هاد هو الـ droppable) */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          boxSizing: "border-box",
          padding: 10,
          border: `6px solid ${theme.border}`,
          borderRadius: "clamp(24px, 3vw, 36px)",
          background: theme.outerBg,
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          transform: isOver ? "scale(1.02)" : "scale(1)",
          transition: "transform 0.15s ease",
        }}
      >
        {/* Inner white area */}
        <div
          dir="rtl"
          style={{
            flex: 1,
            minHeight: 0,
            boxSizing: "border-box",
            padding: 12,
            borderRadius: 24,
            backgroundColor: "#ffffff",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              boxSizing: "border-box",
              minHeight: "100%",
              padding: 8,
              borderRadius: 20,
              border: `1.5px dotted ${theme.innerBorder}`,
              display: "flex",
              flexWrap: "wrap",
              alignContent: "flex-start",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlacedCard({ word }: { word: string }) {
  return (
    <motion.div
      style={cardStyle(PLACED_SIZE)}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
    >
      <CardWord word={word} fontSize="clamp(12px, 1.5vw, 20px)" />
    </motion.div>
  );
}

/* ------------------------------ Main Component ----------------------------- */

export function SortingGame() {
  const [items, setItems] = useState<Item[]>([]);
  const { letter } = useParams();
  const navigate = useNavigate();

  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  const [config, setConfig] = useState<SortingGameConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [minLoadElapsed, setMinLoadElapsed] = useState(false);
  const [startTime] = useState(Date.now());
  const [gameLessonId, setGameLessonId] = useState<number | null>(null);

  const [activeId, setActiveId] = useState<number | null>(null);
  const [mistakeToast, setMistakeToast] = useState<string | null>(null);

  const { letters } = useSelector((state: RootState) => state.letters);
  const dispatch = useDispatch<any>();
  const currentLetterFromRedux = letters.find((l) => l.symbol === letter);
  const letterName = currentLetterFromRedux?.name;
  const activeItem = useMemo(
    () => (activeId !== null ? items.find((i) => i.id === activeId) : null),
    [activeId, items],
  );

  const getDuration = () => Math.floor((Date.now() - startTime) / 1000);

  /* ------------------------------- Effects ------------------------------- */

  useEffect(() => {
    const timer = setTimeout(() => setMinLoadElapsed(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!letters.length) dispatch(fetchLetters());
  }, [dispatch, letters.length]);

  useEffect(() => {
    if (!letter) return;

    const fetchGame = async () => {
      try {
        const res = await api.get(`/lessons/games-lessons/by-letter-and-type`, {
          params: { letter, gameType: "sorting" },
        });

        const game = res.data.data;
        setGameLessonId(game.game_lesson_id);
        setConfig(game.data);

        const mappedItems: Item[] = game.data.items
          .slice(0, 10)
          .map((item: any, index: number) => ({
            id: index,
            word: item.word,
            startsWithAlef: item.startsWithTarget,
            placed: false,
            position: null,
          }))
          .sort(() => Math.random() - 0.5);

        setItems(mappedItems);
      } catch (error) {
        console.error("Error loading sorting game", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [letter]);

  useEffect(() => {
    if (!mistakeToast) return;
    const t = setTimeout(() => setMistakeToast(null), 1500);
    return () => clearTimeout(t);
  }, [mistakeToast]);

  // بنحفظ النتيجة مرة وحدة عند نهاية اللعبة (فوز أو 3 أخطاء)
  useEffect(() => {
    if (!gameWon) return;

    const saveResult = async () => {
      try {
        await saveGameResult({
          games_lessons_id: gameLessonId!,
          score,
          duration: getDuration(),
        });
      } catch (error) {
        console.error("Error saving game result", error);
      }
    };

    saveResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameWon]);

  /* ------------------------------- DnD Setup ------------------------------ */

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id));
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const itemId = Number(active.id);

    if (over && (over.id === "alif" || over.id === "other")) {
      handleDrop(over.id, itemId);
    }

    setActiveId(null);
  };

  /* -------------------------------- Logic -------------------------------- */

  const handleDrop = (zoneId: "alif" | "other", itemId: number) => {
    if (!config) return;

    const item = items.find((i) => i.id === itemId);
    if (!item || item.placed) return;

    setMoves((prev) => prev + 1);

    const isCorrect =
      (zoneId === "alif" && item.startsWithAlef) ||
      (zoneId === "other" && !item.startsWithAlef);

    if (isCorrect) {
      setScore((prev) => {
        const newScore = prev + config.scorePerCorrect;
        if (newScore >= config.items.length * config.scorePerCorrect)
          setGameWon(true);
        return newScore;
      });

      setItems((prev) => {
        const updated = prev.map((i) =>
          i.id === itemId ? { ...i, placed: true, position: zoneId } : i,
        );
        if (updated.every((i) => i.placed))
          setTimeout(() => setGameWon(true), 500);
        return updated;
      });
    } else {
      setMistakes((prev) => {
        const newMistakes = prev + 1;
        setMistakeToast(`خطأ! عدد المحاولات ${newMistakes}/3`);
        if (newMistakes >= 3) setGameWon(true);
        return newMistakes;
      });
    }
  };

  const resetGame = () => {
    if (!config?.items?.length) return;

    const resetItems: Item[] = config.items
      .slice(0, 10)
      .map((item, index) => ({
        id: index,
        word: item.word,
        startsWithAlef: item.startsWithTarget,
        placed: false,
        position: null,
      }))
      .sort(() => Math.random() - 0.5);

    setItems(resetItems);
    setScore(0);
    setMistakes(0);
    setMoves(0);
    setGameWon(false);
    setActiveId(null);
  };

  /* -------------------------------- Derived -------------------------------- */

  const alifItems = items.filter((i) => i.placed && i.position === "alif");
  const otherItems = items.filter((i) => i.placed && i.position === "other");

  if (loading || !minLoadElapsed)
    return <GameLoadingScreen game_name={"sorting"} />;
  if (!config)
    return <div className="text-center mt-20">لا توجد بيانات للعبة</div>;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
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
          <div
            style={{ position: "relative", maxWidth: 1152, margin: "0 auto" }}
          >
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
                  backgroundColor: "red",
                  color: "white",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                }}
              >
                <X size={30} />
              </button>

              <motion.h2
                style={{
                  margin: 0,
                  padding: "0 8px",
                  textAlign: "center",
                  color: TEXT_DARK,
                  fontFamily: "tajawal",
                  fontWeight: 400,
                  fontSize: "clamp(12px, 1.5vw, 20px)",
                }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                صنّف الكلمات، واسحب الكلمات التي تبدأ بحرف ال{letterName} إلى
                المكان الصحيح
              </motion.h2>

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
                color: "#652B82",
                fontFamily: "tajawal",
                fontWeight: 500,
                fontSize: "clamp(12px, 1.2vw, 16px)",
              }}
            >
              حركة: {moves}
            </div>
          </div>
        </div>

        <MistakeToast text={mistakeToast} />

        {/* ---------------------------- Game Area ---------------------------- */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            boxSizing: "border-box",
            paddingTop: "clamp(96px, 11vw, 136px)",
            paddingBottom: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* البطاقات فوق (صف واحد) */}
          <div
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0 16px",
              display: "flex",
              flexWrap: "nowrap",
              justifyContent: "center",
              gap: "clamp(6px, 1vw, 14px)",
              minHeight: CARD_SIZE,
            }}
          >
            {items.map((item) => (
              <DraggableItem
                key={item.id}
                item={item}
                isActive={activeId === item.id}
              />
            ))}
          </div>

          {/* صناديق الإسقاط: حرف الألف (يمين) - حروف أخرى (يسار) */}
          <div
            style={{
              marginTop: "80px",
              width: "min(820px, 92%)",
              height: "clamp(210px, 40vh, 340px)",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "clamp(16px, 3vw, 40px)",
            }}
          >
            <DroppableZone
              id="alif"
              variant="yellow"
              title={`حرف ال${currentLetterFromRedux?.name ?? ""} (${letter ?? ""})`}
            >
              {alifItems.map((item) => (
                <PlacedCard key={item.id} word={item.word} />
              ))}
            </DroppableZone>

            <DroppableZone id="other" variant="purple" title="حروف أخرى">
              {otherItems.map((item) => (
                <PlacedCard key={item.id} word={item.word} />
              ))}
            </DroppableZone>
          </div>
        </div>

        {/* --------------------------- Game Won Modal --------------------------- */}
        {gameWon && (
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
                className="text-base mb-1"
                style={{
                  color: "#28345F",
                  fontFamily: "tajawal",
                  fontSize: "20px",
                  fontWeight: "500",
                }}
              >
                نقاطك: <span style={{ fontWeight: "500" }}>{score}</span>
              </p>
              <p
                className="text-base mb-4"
                style={{
                  color: "#EE0000",
                  fontFamily: "tajawal",
                  fontSize: "20px",
                  fontWeight: "500",
                }}
              >
                عددالاخطاء :{" "}
                <span style={{ fontWeight: "500" }}>{mistakes}</span>
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

      {/* الكرت اللي بينسحب */}
      <DragOverlay dropAnimation={null}>
        {activeItem ? (
          <motion.div
            style={{ ...cardStyle(OVERLAY_SIZE), cursor: "grabbing" }}
            initial={{ scale: 1 }}
            animate={{ scale: 1.1 }}
          >
            <CardWord
              word={activeItem.word}
              fontSize="clamp(15px, 2vw, 28px)"
            />
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
