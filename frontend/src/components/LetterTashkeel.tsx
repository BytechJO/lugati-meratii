import { useState, useRef } from "react";
import { ArrowRight, ArrowLeft, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ActivityFooter } from "./ActivityFooter";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getLetterPositionQuestions } from "../API/questions";
import { submitAnswer, calculateLessonResult } from "../API/result";
import { fetchLetters } from "../redux/reducers/lettersSlice";
import { RootState } from "../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { upsertUserProgress } from "../API/userProgress";
import point from "../assets/point_icon.svg";
import restart from "../assets/Icon.svg";
import vector from "../assets/vector_background.png";
import vectorEnd from "../assets/vector_end.svg";
import badegEnd from "../assets/badeg_end.svg";
import { SplashScreen } from "./SplashScreen";
import tigerImg from "../assets/tiger_dashborad.svg";
import background from "../assets/background-learnLetter.svg";
import { lettersComp } from "../data/lettersComp";
import { letterCards } from "../data/letterCards";

import { AppHeader } from "./AppHeader";
interface LetterTashkeelProps {
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

export function LetterTashkeel({ onLogout }: LetterTashkeelProps) {
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(
    null,
  );
  const [showSplash, setShowSplash] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);
  const { letter } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFinishModal, setShowFinishModal] = useState(false);
  // ✅ الطالب خلّص كل الأسئلة: بنعطّل الخيارات وزر الإعادة
  const [isFinished, setIsFinished] = useState(false);
  // ✅ قفل ثابت: بيحفظ id الحرف اللي الطالب خلّص أسئلته (ما بينمسح بإعادة الرندر)
  const finishedRef = useRef<any>(null);
  // ✅ يمنع إرسال إجابتين بنفس الوقت أثناء انتظار الـ API
  const submittingRef = useRef(false);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [totalScore, setTotalScore] = useState(0);
  const { letters } = useSelector((state: RootState) => state.letters);
  const dispatch = useDispatch<any>();
  const currentLetterFromRedux = letters.find((l) => l.symbol === letter);

  const letterId = currentLetterFromRedux?.id;

  const propLetter = letter;
  const currentLetter =
    lettersComp.find((l) => l.arabic === letter) || lettersComp[0];
  const currentLetterCard =
    letterCards.find((l) => l.letter === letter) || letterCards[0];

  // ✅ وضع الأستاذ: تنقل فقط بين الكلمات، بدون لعب أو إجابات أو حفظ تقدم
  // عدّل الشرط حسب اسم الحقل/القيمة الفعلية عندك في الـ user
  const isTeacher = user?.roleId === 3;

  const saveLearnProgress = async () => {
    if (!user || !letter) return;
    if (isTeacher) return; // الأستاذ ما بيتسجل له تقدم

    await upsertUserProgress({
      letter_id: letterId,
      lesson_id: 3, // درس التشكيل
      lesson_type: "tashkeel",
      score: score,
      completed: true,
    });
  };

  useEffect(() => {
    if (!letters.length) {
      dispatch(fetchLetters());
    }
  }, [dispatch, letters.length]);

  useEffect(() => {
    if (!letterId) return;
    // ✅ إذا الطالب خلّص أسئلة هاد الحرف، لا تعيد تحميلها ولا تفك القفل
    if (finishedRef.current === letterId) return;

    const fetchQuestions = async () => {
      try {
        setLoading(true);

        const data = await getLetterPositionQuestions(letterId, 3);
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
            onBack={() => navigate(`/letter/${letter}`)}
            title={`  تشكيل حرف ال${currentLetterFromRedux?.name ?? ""}`}
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
                ? "لم يتم إضافة أسئلة لنشاط التشكيل لهذا الحرف بعد."
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
                  onClick={() => navigate(`/letter/${propLetter}/videos`)}
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

  const handleAnswer = async (answer: string) => {
    // ✅ الأستاذ ما بيقدر يجاوب + الطالب ما بيقدر يجاوب بعد ما يخلّص
    if (isTeacher || isFinished || finishedRef.current === letterId) return;

    if (showFeedback !== null || submittingRef.current) return; // 🔒 حماية

    submittingRef.current = true;
    const isLastQuestion = currentQuestion >= questions.length - 1;

    // ✅ آخر سؤال: قفل الخيارات فوراً لحظة الإجابة (مش بعد الـ API والـ timeout)
    if (isLastQuestion) {
      finishedRef.current = letterId;
      setIsFinished(true);
    }

    try {
      const result = await submitAnswer(3, question.id, answer);

      setShowFeedback(result.is_correct ? "correct" : "wrong");

      if (result.is_correct) {
        setScore((prev) => prev + result.score);
      }

      setTimeout(async () => {
        if (!isLastQuestion) {
          // سؤال عادي: نطفي الفيدباك وننتقل مباشرة للسؤال التالي
          setShowFeedback(null);
          setCurrentQuestion((prev) => prev + 1);
          return;
        }

        // ✅ آخر سؤال: منخلي الفيدباك ظاهر لحد ما نجهز بيانات
        // البوب اب النهائي، عشان ما تنكشف بطاقة السؤال بالفراغ
        // الزمني بين انتهاء الـ await وظهور البوب اب.
        try {
          const data = await calculateLessonResult(3);
          setTotalScore(data.total_score);
          await saveLearnProgress();
        } finally {
          // نطفي الفيدباك ونفتح المودال النهائي بنفس اللحظة
          setShowFeedback(null);
          setShowFinishModal(true);
        }
      }, 800);
    } catch (err) {
      console.error(err);
      // فشل الإرسال: نفك القفل عشان الطالب يقدر يعيد المحاولة
      if (isLastQuestion) {
        finishedRef.current = null;
        setIsFinished(false);
      }
      setShowFeedback("wrong");
      setTimeout(() => setShowFeedback(null), 800);
    } finally {
      submittingRef.current = false;
    }
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
    <div className="h-screen relative overflow-hidden pb-24" dir="rtl">
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
          title={`  تشكيل حرف ال${currentLetterFromRedux?.name}`}
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

      <div className="relative z-10 h-screen flex flex-col" dir="rtl">
        {/* المحتوى الرئيسي */}
        <div className="flex-1 flex flex-col px-6 overflow-y-auto">
          <div className="max-w-4xl w-full mx-auto flex flex-col gap-2">
            {/* العنوان */}

            <motion.div
              className="text-center flex items-start"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p
                className="text-base md:text-xl lg:text-2xl px-6 md:px-0"
                style={{
                  color: "#B47DDB",
                  fontFamily: "tajawal",
                  fontWeight: "500",
                }}
              >
                اختر التشكيل الصحيح للحرف
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
                        fontSize: "16px",
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
                        fontSize: "16px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      النقاط {score}
                    </p>
                  </div>
                )}

                {/* الوسط: رقم السؤال + عداد النقاط */}
                <div className="text-center flex flex-col items-center gap-1.5">
                  {/* عداد النقاط (Progress Dots) */}
                  <div className="flex items-center" style={{ gap: "4px" }}>
                    {Array.from({ length: questions.length }).flatMap(
                      (_, idx) => {
                        const isDone = idx <= currentQuestion;
                        const isActive = idx === currentQuestion;

                        const dot = (
                          <span
                            key={`dot-${idx}`}
                            style={{
                              width: isActive ? "14px" : "10px",
                              height: isActive ? "14px" : "10px",
                              borderRadius: "50%",
                              backgroundColor: isDone ? "#652b82" : "#EFE6F2",
                              boxShadow: isActive
                                ? "0 0 0 3px rgba(101,43,130,0.2)"
                                : "none",
                              transition: "all 0.25s ease",
                              flexShrink: 0,
                            }}
                          />
                        );

                        if (idx === questions.length - 1) return [dot];

                        const line = (
                          <span
                            key={`line-${idx}`}
                            style={{
                              width: "12px",
                              height: "2px",
                              borderRadius: "2px",
                              backgroundColor:
                                idx < currentQuestion ? "#652b82" : "#EFE6F2",
                              flexShrink: 0,
                              transition: "all 0.25s ease",
                            }}
                          />
                        );

                        return [dot, line];
                      },
                    )}
                  </div>
                  <p
                    style={{
                      color: "#28345F",
                      fontFamily: "tajawal",
                      fontWeight: "700",
                      fontSize: "18px",
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
                      fontSize: "18px",
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
                        fontSize: "20px",
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
                        fontSize: "20px",
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
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                justifyContent: "center",
                // boxShadow: "0 16px 32px rgba(40, 52, 95, 0.1)",
              }}
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
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
                        showFeedback === "correct" ? "#FFB600" : "#ffffff",
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
                ما هو تشكيل حرف ال{currentLetterFromRedux?.name} في هذه الكلمة ؟
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
              className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${
                isFinished || showFinishModal ? "pointer-events-none" : ""
              }`}
            >
              {[
                { id: "fatha", symbol: "َ", label: "فتحة" },
                { id: "damma", symbol: "ُ", label: "ضمة" },
                { id: "kasra", symbol: "ِ", label: "كسرة" },
                { id: "sukun", symbol: "ْ", label: "سكون" },
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
                    // بعد 0.8 ثانية يرجع طبيعي
                    setTimeout(() => {
                      setSelectedOption(null);
                    }, 800);
                  }}
                  // ✅ معطّلة للأستاذ، وللطالب بعد ما يخلّص الأسئلة
                  disabled={isTeacher || isFinished || showFeedback !== null}
                  className={`rounded-2xl transition-all py-2 ${
                    isTeacher || isFinished
                      ? "cursor-not-allowed opacity-60"
                      : "hover:shadow-xl disabled:opacity-50"
                  }`}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={
                    isTeacher || isFinished ? undefined : { scale: 1.05, y: -3 }
                  }
                  whileTap={
                    isTeacher || isFinished ? undefined : { scale: 0.98 }
                  }
                  style={{
                    background:
                      selectedOption === option.id
                        ? "linear-gradient(90deg, #FFE68C 0%, #FFB600 100%)"
                        : "#FFFFFF",
                    boxShadow:
                      selectedOption === option.id
                        ? "0 12px 24px rgba(247, 168, 36, 0.35)"
                        : "0 8px 18px rgba(40, 52, 95, 0.1)",
                  }}
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    {/* النص */}
                    <h3
                      className="text-sm md:text-xl"
                      style={{ color: "#28345F" }}
                    >
                      {option.label}
                    </h3>
                    {/* رمز الحركة */}
                    <div
                      className="text-2xl md:text-3xl"
                      style={{ color: "#28345F" }}
                    >
                      {propLetter === "أ" && option.id === "kasra"
                        ? "إِ"
                        : propLetter + option.symbol}
                    </div>
                  </div>
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
                    navigate(`/letter/${propLetter}/videos`);
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