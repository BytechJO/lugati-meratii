import { ArrowRight, ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ActivityFooter } from "./ActivityFooter";
import { AppHeader } from "./AppHeader";
import { SplashScreen } from "./SplashScreen";
import { EmptyGamesState } from "./games/EmptyGamesState";
import { GameSelectionCard } from "./games/GameSelectionCard";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchLetters } from "../redux/reducers/lettersSlice";
import { useLetterGames } from "../hooks/useLetterGames";
import { useGameProgress } from "../hooks/useGameProgress";
import { getGameCards } from "../data/games";
import { letterCards } from "../data/letterCards";
const background = new URL("../assets/background-learnLetter.svg", import.meta.url).href;
import book from "../assets/book.svg";
import game_icon from "../assets/game_icon.svg";

interface GamesSectionProps {
  onLogout: () => void;
}

const GAMES_PER_PAGE = 2;

export function GamesSection({ onLogout }: GamesSectionProps) {
  const { letter } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { letters } = useAppSelector((state) => state.letters);
  const selectedLetter = letters.find((item) => item.symbol === letter);
  const letterId = selectedLetter?.id;
  const letterName = selectedLetter?.name;
  const isTeacher = user?.type === "teacher";
  const { availableGames, loadingGames } = useLetterGames(letterId);
  useGameProgress(letterId, user);

  const [page, setPage] = useState(0);
  const games = getGameCards(letterName ?? "");
  const totalPages = Math.ceil(games.length / GAMES_PER_PAGE);
  const visibleGames = games.slice(page * GAMES_PER_PAGE, (page + 1) * GAMES_PER_PAGE);
  const isFirstPage = page === 0;
  const isLastPage = page >= totalPages - 1;
  const goPrevPage = () => setPage((previous) => Math.max(previous - 1, 0));
  const goNextPage = () => setPage((previous) => Math.min(previous + 1, totalPages - 1));
  const currentLetterCard = letterCards.find((item) => item.letter === letter) ?? letterCards[0];

  useEffect(() => {
    if (!letters.length) void dispatch(fetchLetters());
  }, [dispatch, letters.length]);

  useEffect(() => { setPage(0); }, [letter]);

  const letterNotFound = letters.length > 0 && letterId === undefined;
  if (!letterNotFound && (loadingGames || letterId === undefined)) {
    return <SplashScreen onComplete={() => {}} />;
  }

  const hasNoGames = letterNotFound || !games.some((game) => availableGames.includes(game.id));
  if (hasNoGames) {
    return <EmptyGamesState letter={letter} letterName={letterName} isTeacher={isTeacher} onLogout={onLogout} />;
  }

  return (
    <div data-page="games-section" className="relative overflow-hidden" dir="rtl">
      {/* خلفية متدرجة */}
      <div
        className="fixed inset-0"
        style={{
          backgroundImage: `url("${background}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      <div className="relative top-0 w-full">
        <AppHeader
          showUserInfo={false}
          onLogout={onLogout}
          onBack={() => navigate(`/letter/${letter}`)}
          title={`  ألعاب حرف ال${letterName}`}
          showLogout={false}
          showBackButton={true}
          showHome={false}
          fontTtile={30}
        />
      </div>
      {/* صورة الحرف العائمة في الأعلى */}
      <motion.div data-responsive="responsive-decoration"
        className="fixed"
        style={{
          top: "17%",
          right: "7%",
          color: "#FDC333",
          fontSize: "60px",
          rotate: "18deg",
          opacity: "0.3",
        }}
      >
        <img
          src={currentLetterCard.image}
          style={{ height: "380px", width: "auto" }}
        />
      </motion.div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 h-full flex flex-col px-6 py-6">
        <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
          <div>
            <motion.div
              className="text-center mb-8 flex items-start"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p
                className="text-xs md:text-sm text-gray-700 px-6 md:px-0"
                style={{
                  color: "#9830B7",
                  fontFamily: "tajawal",
                  fontSize: "20px",
                  fontWeight: "500",
                  marginRight: "55px",
                }}
              >
                {isTeacher
                  ? `اختر لعبة لمعاينة محتواها لحرف ال${letterName}`
                  : `اختر لعبة للبدء في التعلم والمرح مع حرف ال${letterName}`}
              </p>
            </motion.div>

            {/* سلايدر الألعاب: كل مرة لعبتين فقط */}
            <div className="flex items-center gap-3 md:gap-5">
              {/* زر السابق */}
              <motion.button
                onClick={goPrevPage}
                disabled={isFirstPage}
                aria-label="اللعبة السابقة"
                className="flex items-center justify-center rounded-full flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#652b82",
                  boxShadow: "0 8px 18px rgba(101,43,130,0.35)",
                }}
                whileHover={!isFirstPage ? { scale: 1.08 } : undefined}
                whileTap={!isFirstPage ? { scale: 0.94 } : undefined}
              >
                <ArrowRight className="w-6 h-6 text-white" />
              </motion.button>

              {/* بطاقات الألعاب */}
              <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={page}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.3 }}
                  >
                    {visibleGames.map((game, index) => (
                      <GameSelectionCard
                        key={game.id}
                        game={game}
                        index={index}
                        available={availableGames.includes(game.id)}
                        preview={isTeacher}
                        onSelect={() => navigate(`/letter/${letter}/games/${game.id}`)}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* زر التالي */}
              <motion.button
                onClick={goNextPage}
                disabled={isLastPage}
                aria-label="اللعبة التالية"
                className="flex items-center justify-center rounded-full flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#652b82",
                  boxShadow: "0 8px 18px rgba(101,43,130,0.35)",
                }}
                whileHover={!isLastPage ? { scale: 1.08 } : undefined}
                whileTap={!isLastPage ? { scale: 0.94 } : undefined}
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </motion.button>
            </div>

            {/* نقاط الصفحات */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPage(idx)}
                    aria-label={`صفحة ${idx + 1}`}
                    style={{
                      width: idx === page ? "22px" : "8px",
                      height: "8px",
                      borderRadius: "999px",
                      backgroundColor: idx === page ? "#652b82" : "#D9C9E3",
                      transition: "all 0.25s ease",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* تذييل النشاط */}

      <ActivityFooter currentLetter={letter} letterName={letterName} />

      <motion.div data-responsive="responsive-decoration tablet-art" className="fixed z-0" style={{ bottom: "0%", right: "2%" }}>
        <motion.img
          src={book}
          alt="icon"
          style={{ height: "140px", width: "auto" }}
          className="object-contain drop-shadow-2xl"
        />
      </motion.div>

      <motion.div data-responsive="responsive-decoration tablet-art" className="fixed z-0" style={{ bottom: "0%", left: "2%" }}>
        <motion.img
          src={game_icon}
          alt="icon"
          style={{ height: "140px", width: "auto" }}
          className="object-contain drop-shadow-2xl"
        />
      </motion.div>
    </div>
  );
}
