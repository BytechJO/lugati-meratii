import { useState, useEffect, useRef } from "react";
import { ArrowRight, ArrowLeft, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ActivityFooter } from "./ActivityFooter";
import { useParams, useNavigate } from "react-router-dom";
import { submitAnswer, calculateLessonResult } from "../API/result";
import { getLetterPositionQuestions } from "../API/questions";
import { upsertUserProgress } from "../API/userProgress";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { fetchLetters } from "../redux/reducers/lettersSlice";
import point from "../assets/point_icon.svg";
import restart from "../assets/Icon.svg";
import vector from "../assets/vector_background.png";
import vectorEnd from "../assets/vector_end.svg";
import badegEnd from "../assets/badeg_end.svg";
import { SplashScreen } from "./SplashScreen";
import abc from "../assets/abc.svg";
import tigerImg from "../assets/tiger_dashborad.svg";
import background from "../assets/background-learnLetter.svg";
import { lettersComp } from "../data/lettersComp";
import book from "../assets/book.svg";
import { letterCards } from "../data/letterCards";

import { AppHeader } from "./AppHeader";
interface LetterPositionProps {
  // onLetterClick: (letter: string, letterName: string) => void;
  onLogout: () => void;
}

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

// ✅ parse آمن: إذا نص السؤال مو JSON صحيح ما بيكسر الصفحة
const safeParseQuestion = (text: any): { word?: string } => {
  try {
    return JSON.parse(text) ?? {};
  } catch {
    return {};
  }
};

export function LetterPosition({ onLogout }: LetterPositionProps) {
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(
    null,
  );

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // ✅ قفل ثابت: بيحفظ id الحرف اللي الطالب خلّص أسئلته (ما بينمسح بإعادة الرندر)
  const finishedRef = useRef<any>(null);

  const { symbol } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFinishModal, setShowFinishModal] = useState(false);
  // ✅ الطالب خلّص كل الأسئلة: بنعطّل الخيارات وزر الإعادة
  const [isFinished, setIsFinished] = useState(false);
  const { letters } = useSelector((state: RootState) => state.letters);
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const currentLetterFromRedux = letters.find((l) => l.symbol === symbol);
  const [showSplash, setShowSplash] = useState(true);
  const letterId = currentLetterFromRedux?.id;
  const lettername = currentLetterFromRedux?.symbol;

  const dispatch = useDispatch<any>();
  const propLetter = symbol;
  const currentLetter =
    lettersComp.find((l) => l.arabic === symbol) || lettersComp[0];
  const currentLetterCard =
    letterCards.find((l) => l.letter === symbol) || letterCards[0];

  // ✅ وضع الأستاذ: تنقل فقط بين الكلمات، بدون لعب أو إجابات أو حفظ تقدم
  // عدّل الشرط حسب اسم الحقل/القيمة الفعلية عندك في الـ user
  const isTeacher = user?.roleId === 3;

  useEffect(() => {
    if (!letters.length) {
      dispatch(fetchLetters());
    }
  }, [dispatch, letters.length]);

  const saveLearnProgress = async () => {
    if (!user || !symbol) return;
    if (isTeacher) return; // الأستاذ ما بيتسجل له تقدم

    await upsertUserProgress({
      letter_id: letterId,
      lesson_id: 12, // درس التعلم
      lesson_type: "position",
      score: score,
      completed: true,
    });
  };

  useEffect(() => {
    if (!letterId) return;
    // ✅ إذا الطالب خلّص أسئلة هاد الحرف، لا تعيد تحميلها ولا تفك القفل
    if (finishedRef.current === letterId) return;

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const data = await getLetterPositionQuestions(letterId, 12);
        // ✅ إذا الرد مو مصفوفة (null / undefined) نعتبره ما في أسئلة
        setQuestions(Array.isArray(data) ? data : []);
        setCurrentQuestion(0);
        setScore(0);
        setIsFinished(false); // ✅ أسئلة جديدة = نبدأ من جديد
        finishedRef.current = null;
      } catch (error) {
        console.error("Error fetching questions", error);
        // ✅ فشل الطلب (مثلاً 404 لما ما في أسئلة) = نفس حالة "ما في أسئلة"
        setQuestions([]);
        setCurrentQuestion(0);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [letterId]);

  // (نقلت هاد الشرط لبعد كل الـ hooks عشان ما نكسر قواعد React hooks)
  if (!propLetter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-yellow-50 to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-base text-gray-400">اختر حرفاً من صفحة الحروف</p>
        </div>
        <ActivityFooter
          currentLetter={propLetter}
          letterName={currentLetterFromRedux?.name}
        />
      </div>
    );
  }

  // ✅ الحرف مو موجود أصلاً بعد ما انحملت الحروف
  const letterNotFound = letters.length > 0 && !letterId;

  // ✅ خلص التحميل وما في أسئلة لهاد الحرف (أو الحرف نفسه مو موجود)
  const hasNoQuestions =
    letterNotFound ||
    (!loading && (!questions.length || !questions[currentQuestion]));

  if (hasNoQuestions) {
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
            onBack={() => navigate(`/letter/${symbol}`)}
            title={` حدد مكان حرف ال${currentLetterFromRedux?.name ?? ""}`}
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
              src={tigerImg}
              alt=""
              style={{ height: 120, width: "auto", objectFit: "contain" }}
            />

            <h2
              style={{
                color: "#28345F",
                fontFamily: "tajawal",
                fontWeight: 700,
                fontSize: 24,
              }}
            >
              لا توجد أسئلة لهذا الحرف حالياً
            </h2>

            <p
              style={{
                color: "#7B7B7B",
                fontFamily: "tajawal",
                fontWeight: 500,
                fontSize: 16,
              }}
            >
              {isTeacher
                ? "لم يتم إضافة أسئلة لنشاط تحديد المكان لهذا الحرف بعد."
                : "ما في أسئلة بهاد النشاط لهاد الحرف، فيك تكمل للنشاط التالي."}
            </p>

            <div
              className="flex gap-3 justify-center flex-wrap"
              style={{ marginTop: 12 }}
            >
              <button
                onClick={() => navigate(`/letter/${propLetter}`)}
                style={{
                  ...pillBase,
                  color: "#652B82",
                  background: "#F3EEFA",
                  boxShadow: "none",
                }}
              >
                رجوع
              </button>

              {/* الطالب بس: ما بيضل عالق، بيكمل للنشاط التالي */}
              {!isTeacher && (
                <button
                  onClick={() => navigate(`/letter/${propLetter}/tashkeel`)}
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

        <ActivityFooter
          currentLetter={propLetter}
          letterName={currentLetterFromRedux?.name}
        />
      </div>
    );
  }

  // ✅ لسا عم يحمّل (الحروف أو الأسئلة)
  if (loading || !questions.length || !questions[currentQuestion]) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  const question = questions[currentQuestion];
  const parsedQuestionText = safeParseQuestion(question.question_text);

  const handleAnswer = async (position: string) => {
    // ✅ الأستاذ ما بيقدر يجاوب + الطالب ما بيقدر يجاوب بعد ما يخلّص
    if (isTeacher || isFinished || finishedRef.current === letterId) return;

    // 🔴 امنع أي ضغط إضافي
    if (showFeedback !== null) return;

    // 🔴 نظف أي timeout قديم
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const isCorrect = position === question.correct_answer;
    const isLastQuestion = currentQuestion >= questions.length - 1;

    // ✅ آخر سؤال: قفل الخيارات فوراً لحظة الإجابة (مش بعد الـ timeout)
    if (isLastQuestion) {
      finishedRef.current = letterId;
      setIsFinished(true);
    }

    setShowFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    submitAnswer(12, question.id, position).catch(console.error);

    timeoutRef.current = setTimeout(async () => {
      if (!isLastQuestion) {
        // سؤال عادي: نطفي الفيدباك وننتقل مباشرة للسؤال التالي
        setShowFeedback(null);
        setCurrentQuestion((prev) => prev + 1);
        return;
      }

      // ✅ منخلي الفيدباك ظاهر لحد ما نجهز بيانات البوب اب النهائي،
      // عشان ما تنكشف بطاقة السؤال بالفراغ الزمني بين انتهاء الـ await
      // وظهور البوب اب.
      try {
        const data = await calculateLessonResult(12);
        setTotalScore(data.total_score);
        await saveLearnProgress();
      } finally {
        // نطفي الفيدباك ونفتح المودال النهائي بنفس اللحظة
        setShowFeedback(null);
        setShowFinishModal(true);
      }
    }, 1000);
  };

  const resetGame = () => {
    if (isFinished || finishedRef.current === letterId) return; // ✅ ما في إعادة بعد الانتهاء
    setScore(0);
    setCurrentQuestion(0);
    setShowFeedback(null);
  };

  // ✅ تنقل الأستاذ بين الكلمات
  const goNext = () =>
    setCurrentQuestion((prev) => Math.min(prev + 1, questions.length - 1));
  const goPrev = () => setCurrentQuestion((prev) => Math.max(prev - 1, 0));

  const isFirst = currentQuestion === 0;
  const isLast = currentQuestion === questions.length - 1;

  return (
    <div className="h-screen relative pb-24  overflow-hidden" dir="rtl">
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
          onBack={() => navigate(`/letter/${symbol}`)}
          title={` حدد مكان حرف ال${currentLetterFromRedux?.name}`}
          showLogout={false}
          showBackButton={true}
          showHome={false}
          fontTtile={30}
        />
      </div>
      {/*زر الرجوع للخلف العائم في الاعلى  */}
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

      <div className="relative z-10 flex flex-col h-full">
        {/* المحتوى الرئيسي */}
        <div className="flex-1 flex flex-col px-6 overflow-y-auto h-full">
          <div className="max-w-4xl w-full mx-auto flex flex-col gap-2">
            {/* العنوان */}
            <motion.div
              className="text-center mb-2 flex items-start px-6 md:px-0"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p
                className="text-base md:text-xl lg:text-2xl"
                style={{
                  color: "#B47DDB",
                  fontFamily: "tajawal",
                  fontWeight: "500",
                }}
              >
                اختر المكان الصحيح للحرف في الكلمة
              </p>
            </motion.div>

            {/* لوحة النقاط / لوحة تنقل الأستاذ */}
            <motion.div
              className="rounded-3xl p-3 md:p-4"
              style={{
                background: "linear-gradient(90deg, #FFE68C 0%, #FFB600 100%)",
                boxShadow: "0 14px 28px rgba(247, 168, 36, 0.35)",
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="flex items-center justify-between px-2 md:px-6">
                {/* يمين: النقاط (طالب) / السابق (أستاذ) */}
                {isTeacher ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <motion.button
                      onClick={goPrev}
                      disabled={isFirst}
                      aria-label="السابق"
                      className="flex items-center justify-center rounded-full disabled:opacity-40"
                      style={{
                        backgroundColor: "#FFFFFF",
                        height: "40px",
                        width: "40px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
                      }}
                      whileHover={!isFirst ? { scale: 1.05 } : undefined}
                      whileTap={!isFirst ? { scale: 0.95 } : undefined}
                    >
                      <ArrowRight size={18} color="#28345F" />
                    </motion.button>
                    <p
                      style={{
                        color: "#28345F",
                        fontFamily: "tajawal",
                        fontWeight: "500",
                        fontSize: "13px",
                      }}
                    >
                      السابق
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className="flex items-center justify-center rounded-full"
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "#FFFFFF",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
                      }}
                    >
                      <img src={point} />
                    </div>
                    <p
                      style={{
                        color: "#28345F",
                        fontFamily: "tajawal",
                        fontWeight: "500",
                        fontSize: "18px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      النقاط {score}
                    </p>
                  </div>
                )}

                {/* الوسط: رقم السؤال */}
                <div className="text-center">
                  <p
                    style={{
                      color: "#28345F",
                      fontFamily: "tajawal",
                      fontWeight: "700",
                      fontSize: "22px",
                    }}
                  >
                    السؤال
                  </p>
                  <p
                    className="text-center"
                    style={{
                      color: "#28345F",
                      fontFamily: "tajawal",
                      fontWeight: "500",
                      fontSize: "20px",
                    }}
                  >
                    {currentQuestion + 1} / {questions.length}
                  </p>
                </div>

                {/* يسار: إعادة (طالب) / التالي (أستاذ) */}
                {isTeacher ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <motion.button
                      onClick={goNext}
                      disabled={isLast}
                      aria-label="التالي"
                      className="flex items-center justify-center rounded-full disabled:opacity-40"
                      style={{
                        backgroundColor: "#FFFFFF",
                        height: "40px",
                        width: "40px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
                      }}
                      whileHover={!isLast ? { scale: 1.05 } : undefined}
                      whileTap={!isLast ? { scale: 0.95 } : undefined}
                    >
                      <ArrowLeft size={18} color="#28345F" />
                    </motion.button>
                    <p
                      style={{
                        color: "#28345F",
                        fontFamily: "tajawal",
                        fontWeight: "500",
                        fontSize: "13px",
                      }}
                    >
                      التالي
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <motion.button
                      onClick={resetGame}
                      disabled={isFinished || showFinishModal}
                      className="flex items-center justify-center rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "#FFFFFF",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
                      }}
                      whileHover={!isFinished ? { scale: 1.05 } : undefined}
                      whileTap={!isFinished ? { scale: 0.95 } : undefined}
                    >
                      <img src={restart} />
                    </motion.button>
                    <p
                      style={{
                        color: "#28345F",
                        fontFamily: "tajawal",
                        fontWeight: "500",
                        fontSize: "18px",
                      }}
                    >
                      إعادة
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* بطاقة السؤال */}
            <motion.div
              key={currentQuestion}
              className="bg-white rounded-3xl p-4 text-center relative"
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                justifyContent: "center",
                // boxShadow: "0 16px 32px rgba(40, 52, 95, 0.1)",
              }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {/* Feedback Overlay */}
              <AnimatePresence>
                {showFeedback && (
                  <motion.div
                    className="absolute inset-0 rounded-3xl p-6 flex items-center justify-center z-10"
                    style={{
                      backgroundColor:
                        showFeedback === "correct" ? "#ffc534" : "#ffffff",
                    }}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      {showFeedback === "correct" ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6 }}
                            className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: "#652b82" }}
                          >
                            <Check className="w-10 h-10 text-white" />
                          </motion.div>
                          <span
                            className="text-2xl"
                            style={{ color: "#652b82" }}
                          >
                            أحسنت!
                          </span>
                        </>
                      ) : (
                        <>
                          <motion.div
                            animate={{ rotate: [-10, 10, -10] }}
                            transition={{ duration: 0.3, repeat: 2 }}
                            className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: "#ef4444" }}
                          >
                            <X className="w-10 h-10 text-white" />
                          </motion.div>
                          <span className="text-2xl text-red-600">
                            حاول مرة أخرى
                          </span>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <p
                className="text-base md:text-lg text-gray-600 mb-4"
                style={{
                  color: "#28345F",
                  fontFamily: "tajawal",
                  fontWeight: "500",
                }}
              >
                اين يقع حرف ال{currentLetterFromRedux?.name} في هذه الكلمة؟
              </p>

              <motion.div
                className="inline-block px-6 py-9 mb-4 relative overflow-hidden"
                style={{
                  backgroundColor: "#FFFFFF",
                  backgroundImage: `url(${vector})`,
                  backgroundRepeat: "no-repeat",
                  height: "100px",
                  width: "165px",
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  borderRadius: "24px",
                  boxShadow: "0 10px 24px rgba(40, 52, 95, 0.12)",
                }}
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <h2
                  className="text-5xl md:text-6xl"
                  style={{ color: "#28345F" }}
                >
                  {parsedQuestionText?.word}
                </h2>
              </motion.div>
            </motion.div>

            {/* الخيارات */}
            <div
              className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${
                isFinished || showFinishModal ? "pointer-events-none" : ""
              }`}
            >
              {[
                { id: "start", label: "البداية" },
                { id: "middle", label: "الوسط" },
                { id: "end", label: "النهاية" },
              ].map((option, index) => (
                <motion.button
                  key={option.id}
                  onClick={() => {
                    if (
                      isTeacher ||
                      isFinished ||
                      finishedRef.current === letterId
                    )
                      return;
                    setSelectedOption(option.id);
                    handleAnswer(option.id);
                    // بعد ثانية يرجع طبيعي
                    setTimeout(() => {
                      setSelectedOption(null);
                    }, 1000);
                  }}
                  // ✅ معطّلة للأستاذ، وللطالب بعد ما يخلّص الأسئلة
                  disabled={isTeacher || isFinished || showFeedback !== null}
                  className={`rounded-2xl transition-all py-4 ${
                    isTeacher || isFinished
                      ? "cursor-not-allowed opacity-60"
                      : "hover:shadow-xl disabled:opacity-50"
                  }`}
                  style={{
                    background:
                      selectedOption === option.id
                        ? "linear-gradient(90deg,  #FFE68C 0%, #FFB600 100%)"
                        : "#FFFFFF",
                    boxShadow:
                      selectedOption === option.id
                        ? "0 12px 24px rgba(247, 168, 36, 0.35)"
                        : "0 8px 18px rgba(40, 52, 95, 0.1)",
                  }}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  whileHover={
                    isTeacher || isFinished ? undefined : { scale: 1.05, y: -3 }
                  }
                  whileTap={
                    isTeacher || isFinished ? undefined : { scale: 0.98 }
                  }
                >
                  <h3
                    className="text-xl md:text-2xl"
                    style={{ color: "#28345F" }}
                  >
                    {option.label}
                  </h3>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFinishModal && !isTeacher && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // ✅ ما في إغلاق بالضغط برا البوب اب: الطالب لازم يكبس "التالي"
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
              <h2
                style={{
                  color: "#28345F",
                  fontFamily: "tajawal",
                  fontSize: "30px",
                  fontWeight: "500",
                }}
              >
                ممتاز!
              </h2>

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
                  {score} - {questions.length}
                </span>
              </p>
              {/* الأزرار */}
              <div
                className="flex gap-4 justify-center"
                style={{ marginTop: "20px" }}
              >
                <button
                  onClick={() => {
                    setShowFinishModal(false);
                    navigate(`/letter/${propLetter}/tashkeel`);
                  }}
                  style={{
                    ...pillBase,
                    color: "#ffffff",
                    background:
                      "linear-gradient(90deg, #D08FF7 0%, #652B82 100%)",
                  }}
                >
                  التالي
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer للأنشطة */}
      <ActivityFooter
        currentLetter={propLetter}
        letterName={currentLetterFromRedux?.name}
      />
    </div>
  );
}