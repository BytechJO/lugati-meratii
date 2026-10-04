import { ArrowRight, ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ActivityFooter } from "./ActivityFooter";
import { useParams, useNavigate } from "react-router-dom";
import api from "../API/axios";
import { useEffect, useState, useRef } from "react";
import { RootState } from "../redux/store";
import { fetchLetters } from "../redux/reducers/lettersSlice";
import { useDispatch, useSelector } from "react-redux";
import { upsertUserProgress } from "../API/userProgress";
import wordCatch from "../assets/wordCatch.png";
import sortWord from "../assets/wordMatch.png";
import wordMatch from "../assets/sorting.png";
import balloon from "../assets/balloon2.png";
import background from "../assets/background-learnLetter.svg";
import emptyTigerImg from "../assets/tiger_dashborad.svg";
import book from "../assets/book.svg";
import game_icon from "../assets/game_icon.svg";
import { letterCards } from "../data/letterCards";
import game_button from "../assets/game_botton.svg";
import { AppHeader } from "./AppHeader";
import { SplashScreen } from "./SplashScreen";
interface GamesSectionProps {
  // onLetterClick: (letter: string, letterName: string) => void;
  onLogout: () => void;
}

const GAMES_PER_PAGE = 2;

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

export function GamesSection({ onLogout }: GamesSectionProps) {
  const { letter } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const progressSavedRef = useRef(false);

  const user = useSelector((state: RootState) => state.auth.user);
  const { letters } = useSelector((state: RootState) => state.letters);
  const currentLetterFromRedux = letters.find((l) => l.symbol === letter);
  const letterId = currentLetterFromRedux?.id;
  const currentLetter = letter;
  const letterName = currentLetterFromRedux?.name;
  const [availableGames, setAvailableGames] = useState<string[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [gamesCompleted, setGamesCompleted] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [page, setPage] = useState(0);
  const currentLetterCard =
    letterCards.find((l) => l.letter === letter) || letterCards[0];

  // ✅ الأستاذ: بس بتتغير الرسالة وبيختفي زر "التالي" بشاشة "ما في ألعاب"
  const isTeacher = user?.type === "teacher";

  const games = [
    {
      id: "word_catch",
      title: `اصطد كلمات ال${currentLetterFromRedux?.name}`,
      description: `اصطد الكلمات التي تبدأ بحرف ال${currentLetterFromRedux?.name} قبل أن تختفي `,
      icon: wordCatch,
      color: "#652b82",
      iconBgColor: "#7FD6E8",
    },
    {
      id: "sorting",
      title: `صنف كلمات ال${currentLetterFromRedux?.name}`,
      description: `اسحب الكلمات للمكان الصحيح: ${currentLetterFromRedux?.name} أم حروف أخرى`,
      icon: wordMatch,
      color: "#652b82",
      iconBgColor: "#fad656",
    },
    {
      id: "memory_match",
      title: `ذاكرة ال${currentLetterFromRedux?.name}`,
      description: `اقلب البطاقات وطابق حرف ال${currentLetterFromRedux?.name} مع الكلمات`,
      icon: sortWord,
      color: "#652b82",
      iconBgColor: "#fad656",
    },
    {
      id: "balloon_pop",
      title: `بالونات ال${currentLetterFromRedux?.name}`,
      description: ` افرقع البالونات التي تحتوي على كلمات تبدأ ب ${currentLetterFromRedux?.name}`,
      icon: balloon,
      color: "#652b82",
      iconBgColor: "#7FD6E8",
    },
  ];

  const totalPages = Math.ceil(games.length / GAMES_PER_PAGE);
  const visibleGames = games.slice(
    page * GAMES_PER_PAGE,
    page * GAMES_PER_PAGE + GAMES_PER_PAGE,
  );
  const isFirstPage = page === 0;
  const isLastPage = page >= totalPages - 1;

  const goPrevPage = () => setPage((p) => Math.max(p - 1, 0));
  const goNextPage = () => setPage((p) => Math.min(p + 1, totalPages - 1));

  useEffect(() => {
    if (!letters.length) {
      dispatch(fetchLetters());
    }
  }, [dispatch, letters.length]);

  useEffect(() => {
    if (!letterId) return;

    let cancelled = false;

    const fetchGames = async () => {
      try {
        setLoadingGames(true);

        const res = await api.get(`/lessons/game-lesson/${letterId}/letter-id`);
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        const gameTypes = list.map((g: any) => g.game_type);

        if (!cancelled) setAvailableGames(gameTypes);
      } catch (error) {
        console.error("Error fetching games:", error);
        // ✅ فشل الطلب (مثلاً 404 لما ما في ألعاب) = نفس حالة "ما في ألعاب"
        if (!cancelled) setAvailableGames([]);
      } finally {
        if (!cancelled) setLoadingGames(false);
      }
    };

    fetchGames();

    return () => {
      cancelled = true;
    };
  }, [letterId]);

  useEffect(() => {
    if (!letterId) return;

    // ✅ لا تعرض المودال للمعلم
    if (user?.type === "teacher") return;
    const checkGamesCompletion = async () => {
      try {
        const res = await api.get(`/lessons/${letterId}/games/progress`);

        const { playedGamesCount, totalGames, isCompleted } = res.data;

        const trulyCompleted =
          totalGames > 0 && playedGamesCount === totalGames;

        setGamesCompleted(trulyCompleted);

        const modalKey = `games_complete_modal_letter_${letterId}`;

        if (trulyCompleted) {
          localStorage.setItem(modalKey, "1");

          if (!progressSavedRef.current) {
            progressSavedRef.current = true;

            await upsertUserProgress({
              letter_id: letterId,
              lesson_id: 5,
              lesson_type: "game",
              score: 1,
              completed: true,
            });
          }

          setShowCompleteModal(true);
        }
      } catch (error) {
        console.error("Error checking games progress:", error);
      }
    };

    checkGamesCompletion();
  }, [letterId, user?.type]);

  const handleGoToNextLetter = async () => {
    try {
      // الانتقال للحرف التالي
      navigate("/letters", {
        state: { unlockedLetter: letters[letterId].name },
      });
      // أو لو عندك ترتيب:
      // navigate(`/letters/${nextLetterSymbol}`);
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const handleStayHere = () => {
    setShowCompleteModal(false);
  };

  /* ---------- Render Guards ---------- */

  // ✅ الحرف مو موجود أصلاً بعد ما انحملت الحروف
  // (بدون هالشرط كان الـ loadingGames يضل true للأبد لأنو طلب الألعاب ما بينبعت)
  const letterNotFound = letters.length > 0 && !letterId;

  // ✅ لسا عم يحمّل (الحروف أو الألعاب)
  if (!letterNotFound && (loadingGames || !letterId)) {
    return <SplashScreen onComplete={() => {}} />;
  }

  // ✅ خلص التحميل وما في ولا لعبة معروفة لهاد الحرف (أو الحرف نفسه مو موجود)
  const hasNoGames =
    letterNotFound || !games.some((g) => availableGames.includes(g.id));

  if (hasNoGames) {
    return (
      <div className="h-screen relative pb-24 overflow-hidden" dir="rtl">
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
            title={`  ألعاب حرف ال${currentLetterFromRedux?.name ?? ""}`}
            showLogout={false}
            showBackButton={true}
            showHome={false}
            fontTtile={30}
          />
        </div>

        <div className="relative z-10 flex items-center justify-center px-6 h-[60%]">
          <motion.div
            className="bg-white text-center w-full flex flex-col items-center"
            style={{
              maxWidth: 480,
              borderRadius: 24,
              padding: "32px 24px",
              gap: 12,
              boxShadow: "0 16px 32px rgba(40, 52, 95, 0.1)",
            }}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <img
              src={emptyTigerImg}
              alt=""
              style={{ height: 120, width: "auto", objectFit: "contain" }}
            />

            <h2
              style={{
                margin: 0,
                color: "#28345F",
                fontFamily: "tajawal",
                fontWeight: 700,
                fontSize: 24,
              }}
            >
              لا توجد ألعاب لهذا الحرف حالياً
            </h2>

            <p
              style={{
                margin: 0,
                color: "#7B7B7B",
                fontFamily: "tajawal",
                fontWeight: 500,
                fontSize: 16,
              }}
            >
              {isTeacher
                ? "لم يتم إضافة ألعاب لهذا الحرف بعد."
                : "ما في ألعاب لهاد الحرف حالياً، فيك ترجع لصفحة الحرف."}
            </p>

            <div
              className="flex gap-3 justify-center flex-wrap"
              style={{ marginTop: 12 }}
            >
              <button
                onClick={() => navigate(`/letter/${letter}`)}
                style={{
                  ...pillBase,
                  color: "#652B82",
                  background: "#F3EEFA",
                  boxShadow: "none",
                }}
              >
                رجوع
              </button>

              {/* الطالب بس: ما بيضل عالق، الألعاب آخر نشاط فبيكمل لصفحة الحروف */}
              {!isTeacher && (
                <button
                  onClick={() => navigate("/letters")} // ← غيّره للمسار الفعلي
                  style={{
                    ...pillBase,
                    color: "#ffffff",
                    background:
                      "linear-gradient(90deg, #D08FF7 0%, #652B82 100%)",
                  }}
                >
                  التالي
                </button>
              )}
            </div>
          </motion.div>
        </div>

        <ActivityFooter currentLetter={currentLetter} letterName={letterName} />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden" dir="rtl">
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
          title={`  ألعاب حرف ال${currentLetterFromRedux?.name}`}
          showLogout={false}
          showBackButton={true}
          showHome={false}
          fontTtile={30}
        />
      </div>
      {/* صورة الحرف العائمة في الأعلى */}
      <motion.div
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
                اختر لعبة للبدء في التعلم والمرح مع حرف ال{letterName}
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
                    {visibleGames.map((game, index) => {
                      const isAvailable =
                        loadingGames || availableGames.includes(game.id);

                      return (
                        <motion.button
                          key={game.id}
                          onClick={() =>
                            isAvailable &&
                            navigate(
                              `/letter/${currentLetter}/games/${game.id}`,
                            )
                          }
                          className="rounded-[32px] text-right relative overflow-hidden disabled:opacity-50"
                        >
                          {/* شارة ابدأ اللعب */}
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
                              style={{
                                color: "#6D2181",
                                fontSize: "30px",
                                fontWeight: "bold",
                              }}
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
                              <img
                                src={game_button}
                                style={{
                                  height: "auto",
                                  width: "130px",
                                  objectFit: "contain",
                                }}
                              />
                            </motion.div>
                          </motion.div>
                          {/* معاينة اللعبة */}
                          <div className="relative rounded-3xl overflow-hidden flex items-center justify-center">
                            <img
                              src={game.icon}
                              style={{
                                height: "auto",
                                width: "100%",
                                objectFit: "contain",
                              }}
                            />
                          </div>
                        </motion.button>
                      );
                    })}
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

      <ActivityFooter currentLetter={currentLetter} letterName={letterName} />

      <motion.div className="fixed z-0" style={{ bottom: "0%", right: "2%" }}>
        <motion.img
          src={book}
          alt="icon"
          style={{ height: "140px", width: "auto" }}
          className="object-contain drop-shadow-2xl"
        />
      </motion.div>

      <motion.div className="fixed z-0" style={{ bottom: "0%", left: "2%" }}>
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