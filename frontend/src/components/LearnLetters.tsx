import { motion } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { ActivityFooter } from "./ActivityFooter";
import { upsertUserProgress } from "../API/userProgress";
import { useParams, useNavigate } from "react-router-dom";
import { RootState } from "../redux/store";
import { fetchLetters } from "../redux/reducers/lettersSlice";
import { useDispatch, useSelector } from "react-redux";
import tigerImg from "../assets/tiger_dashborad.svg";
import book from "../assets/book.svg";
import {
  fetchVideoLesson,
  clearVideo,
} from "../redux/reducers/videoLessonsSlice";
import background_video from "../assets/Vector_sidebar.png";
import { SplashScreen } from "./SplashScreen";
import abc from "../assets/abc.svg";
import { lettersComp } from "../data/lettersComp";
import background from "../assets/background-learnLetter.svg";
import { AppHeader } from "./AppHeader";
import { letterCards } from "../data/letterCards";
interface LearnLettersProps {
  // onLetterClick: (letter: string, letterName: string) => void;
  onLogout: () => void;
}
export function LearnLetters({ onLogout }: LearnLettersProps) {
  const [currentSlide, setCurrentSlide] = useState(0); // 0 = فيديو، 1 = محتوى الحرف
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { letter } = useParams<{ letter: string }>();
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<any>();
  const { video, loading } = useSelector(
    (state: RootState) => state.videoLessons,
  );

  const { letters } = useSelector((state: RootState) => state.letters);
  const currentLetterFromRedux = letters.find((l) => l.symbol === letter);
  const letterId = currentLetterFromRedux?.id;
  const currentLetterCard =
    letterCards.find((l) => l.letter === letter) || letterCards[0];

  useEffect(() => {
    if (!letters.length) {
      dispatch(fetchLetters());
    }
  }, [dispatch, letters.length]);

  const saveLearnProgress = async () => {
    if (!user || !letter) return;

    await upsertUserProgress({
      letter_id: letterId,
      lesson_id: 1, // درس التعلم
      lesson_type: "learn",
      score: 1,
      completed: true,
    });
  };

  useEffect(() => {
    if (!letterId) return;

    dispatch(clearVideo());

    dispatch(
      fetchVideoLesson({
        letterId,
        lessonId: 1,
      }),
    );
  }, [letterId, dispatch]);

  useEffect(() => {
    setVideoEnded(false);

    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [video]);

  // وقف الصوت عند الخروج من الصفحة
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  const currentLetter =
    lettersComp.find((l) => l.arabic === letter) || lettersComp[0];

  // النطق الآلي (احتياطي إذا ما في ملف mp3)
  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA";
      utterance.rate = 0.7;
      window.speechSynthesis.speak(utterance);
    }
  };

  // تشغيل ملف mp3، وإذا ما في ملف بيرجع للنطق الآلي
  const playAudio = (src?: string, fallbackText?: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (src) {
      const audio = new Audio(src);
      audioRef.current = audio;
      audio.play().catch((err) => console.error("Audio error:", err));
    } else if (fallbackText) {
      speak(fallbackText);
    }
  };

  if (loading) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="h-screen relative overflow-hidden" dir="rtl">
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
          title={` مرحباً بك في درس حرف ال${currentLetterFromRedux?.name}`}
          showLogout={false}
          showBackButton={true}
          showHome={false}
          fontTtile={30}
        />
      </div>
      <motion.div
        className="fixed"
        style={{
          top: "17%",
          right: "7%",
          color: "#FDC333",
          fontSize: "60px",
          rotate: "18deg",
          opacity:"0.3"
        }}
        // animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
        // transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* ★ */}
        <img src={currentLetterCard.image} style={{ height: "380px", width: "auto" }} />
      </motion.div>
      {/* السلايد الأول: الفيديو فقط */}
      {currentSlide === 0 && (
        <div className="relative z-10 flex flex-col justify-evenly md:justify-start ">
          {/* المحتوى الرئيسي */}
          <div className="flex-1 flex flex-col px-6 pb-32 md:justify-start">
            {/* عنوان ترحيبي */}
            {/* <motion.div
              className="text-center mb-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1
                className="text-base md:text-xl lg:text-2xl"
                style={{
                  color: "#F9F9F9",
                  fontFamily: "tajawal",
                  fontWeight: "700",
                }}
              >
                مرحباً بك في درس حرف{" "}
                {`ال${currentLetterFromRedux?.name} ` || "الألف"}
              </h1>
            </motion.div> */}

            {/* بطاقة الفيديو */}
            <motion.div
              className="w-full max-w-[40rem] mx-auto px-0 sm:px-2"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* البطاقة الكبيرة */}

              {/* إطار الفيديو الداخلي */}
              <div className="bg-white overflow-hidden shadow-xl w-full rounded-xl">
                <div
                  className="relative w-full rounded-xl"
                  style={{ paddingBottom: "56.25%"  }}
                >
                  {video.length > 0 && (
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-contain rounded-xl"
                      controls
                      playsInline
                      preload="metadata"
                      controlsList="nodownload"
                      onEnded={() => setVideoEnded(true)}
                    >
                      <source src={video[0].youtube_url} type="video/mp4" />
                      المتصفح لا يدعم تشغيل الفيديو.
                    </video>
                  )}
                </div>
              </div>

              {/* زر ابدأ التعلم */}
              {videoEnded && (
                <motion.div
                  initial={{ opacity: 1, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center mt-4"
                >
                  <motion.button
                    onClick={async () => {
                      if (!videoEnded) return;
                      await saveLearnProgress();
                      setCurrentSlide(1);
                    }}
                    onTouchEnd={async () => {
                      if (!videoEnded) return;
                      await saveLearnProgress();
                      setCurrentSlide(1);
                    }}
                    disabled={!videoEnded}
                    className="px-10 py-4 rounded-2xl shadow-2xl text-white text-base md:text-xl lg:text-2xl transition-all"
                    style={{
                      background: videoEnded
                        ? "linear-gradient(135deg, #652b82, #7d3ba0)"
                        : "linear-gradient(135deg, #d1d5db, #9ca3af)",
                      cursor: videoEnded ? "pointer" : "not-allowed",
                      opacity: videoEnded ? 1 : 0.6,
                    }}
                    whileHover={videoEnded ? { scale: 1.08, y: -3 } : {}}
                    whileTap={videoEnded ? { scale: 0.95 } : {}}
                    animate={
                      videoEnded
                        ? {
                            scale: [1, 1.05, 1],
                            boxShadow: [
                              "0 10px 40px rgba(101, 43, 130, 0.3)",
                              "0 15px 50px rgba(101, 43, 130, 0.5)",
                              "0 10px 40px rgba(101, 43, 130, 0.3)",
                            ],
                          }
                        : {}
                    }
                    transition={
                      videoEnded
                        ? {
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }
                        : {}
                    }
                  >
                    <span>ابدأ التعلم الآن</span>
                  </motion.button>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-base md:text-xl lg:text-2xl"
                    style={{
                      color: "#652B82",
                      fontFamily: "tajawal",
                      fontWeight: "400",
                    }}
                  >
                    انقر للانتقال إلى الأنشطة التفاعلية
                  </motion.p>
                </motion.div>
              )}
            </motion.div>
            {!videoEnded && (
              <motion.div
                className="text-center mt-3"
                initial={{ opacity: 1, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p
                  className="text-base md:text-xl lg:text-2xl"
                  style={{
                    color: "#6D2181",
                    fontFamily: "tajawal",
                    fontWeight: "500",
                  }}
                >
                  شاهد الفيديو ثم ابدأ التعلم التفاعلي
                </p>
              </motion.div>
            )}
          </div>

          {/* النمر في الزاوية */}

          {/* النمر في الزاوية اليسرى العليا */}
          <motion.div className="fixed z-0" style={{ top: "60%", left: "1%" }}>
            <motion.img
              src={tigerImg}
              alt="نمر"
              style={{
                transform: "scaleX(-1)",
                height: "330px",
                width: "auto",
              }}
              className="object-contain drop-shadow-2xl"
            />
          </motion.div>

          <motion.div
            className="fixed"
            style={{
              top: "81%",
              right: "0%",
              color: "#FDC333",
              fontSize: "60px",
              rotate: "-6deg",
            }}
            // animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
            // transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* ★ */}
            <img src={book} style={{ height: "150px", width: "auto" }} />
          </motion.div>
        </div>
      )}

      {/* السلايد الثاني: محتوى الحرف */}
      {currentSlide === 1 && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="relative z-10 flex flex-col"
        >
          {/* المحتوى */}
          <div className="flex-1 flex flex-col px-6 py-4">
            <div className="max-w-5xl w-full mx-auto flex flex-col ">
              {/* العنوان */}
              {/* <motion.div
                className="text-center mb-3"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1
                  className="text-3xl md:text-4xl mb-1"
                  style={{
                    color: "#F9F9F9",
                    fontFamily: "tajawal",
                    fontWeight: "700",
                  }}
                >
                  تعلم حرف {currentLetter.name}
                </h1>
                <p
                  className="text-sm md:text-base text-gray-600"
                  style={{
                    color: "#F9F9F9",
                    fontFamily: "tajawal",
                    fontWeight: "400",
                  }}
                >
                  اضغط على الأزرار للاستماع إلى النطق
                </p>
              </motion.div> */}

              {/* بطاقة الحرف الرئيسية */}
              <motion.div
                className="bg-white rounded-3xl p-6 md:p-8 border-4 shadow-2xl flex-1 flex items-center"
                style={{ borderColor: "#fad656" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center w-full">
                  {/* الحرف */}
                  {/* الحرف */}
                  <div className="text-center">
                    {currentLetter.image ? (
                      <motion.img
                        src={currentLetter.image}
                        alt={currentLetter.name}
                        onClick={() =>
                          playAudio(currentLetter.audio, currentLetter.name)
                        }
                        className="w-72 h-72 md:w-96 md:h-72 object-contain mx-auto mb-4"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                    ) : (
                      <motion.div
                        className="w-40 h-40 md:w-40 md:h-40 mx-auto rounded-full flex items-center justify-center mb-4 shadow-2xl"
                        style={{
                          background:
                            "linear-gradient(135deg, #fad656, #f5c842)",
                        }}
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <span
                          className="text-7xl md:text-8xl"
                          style={{ color: "#652b82" }}
                        >
                          {currentLetter.arabic}
                        </span>
                      </motion.div>
                    )}

                    <h2
                      className="text-2xl md:text-3xl"
                      style={{ color: "#652b82" }}
                    >
                      حرف ال{currentLetter.name}
                    </h2>
                  </div>
                  {/* الأمثلة */}
                  <div>
                    {currentLetter.extraImages &&
                    currentLetter.extraImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {currentLetter.extraImages.map((item, index) => (
                          <motion.button
                            key={item.label}
                            onClick={() => playAudio(item.audio, item.label)}
                            className="cursor-pointer rounded-2xl overflow-hidden transition-all"
                            whileHover={{ scale: 1.08, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                          >
                            <img
                              src={item.img}
                              alt={item.label}
                              className="w-full h-40 md:h-40 object-contain"
                            />
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="text-7xl md:text-8xl mb-4 text-center">
                          {currentLetter.emoji}
                        </div>

                        <h3
                          className="text-3xl md:text-4xl mb-3 text-center"
                          style={{ color: "#652b82" }}
                        >
                          {currentLetter.example}
                        </h3>
                        <p className="text-gray-600 mb-4 text-lg text-center">
                          مثال على الحرف
                        </p>

                        <motion.button
                          onClick={() => speak(currentLetter.example)}
                          className="px-8 py-4 rounded-2xl border-4 flex items-center gap-3 mx-auto shadow-xl text-lg"
                          style={{
                            borderColor: "#652b82",
                            color: "#652b82",
                            backgroundColor: "white",
                          }}
                          whileHover={{ scale: 1.08, y: -3 }}
                          whileTap={{ scale: 0.95 }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "linear-gradient(135deg, #fad656, #f5c842)";
                            e.currentTarget.style.borderColor = "#fad656";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "white";
                            e.currentTarget.style.borderColor = "#652b82";
                          }}
                        >
                          <span className="text-2xl">🔉</span>
                          <span>انطق المثال</span>
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          {/* النمر في الزاوية اليسرى العليا */}
          {/* النمر في الزاوية اليسرى العليا */}
          <motion.div className="fixed z-0" style={{ top: "64%", left: "1%" }}>
            <motion.img
              src={tigerImg}
              alt="نمر"
              style={{
                transform: "scaleX(-1)",
                height: "280px",
                width: "auto",
              }}
              className="object-contain drop-shadow-2xl"
            />
          </motion.div>

          <motion.div
            className="fixed"
            style={{
              top: "81%",
              right: "0%",
              color: "#FDC333",
              fontSize: "60px",
              rotate: "-6deg",
            }}
            // animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
            // transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* ★ */}
            <img src={book} style={{ height: "150px", width: "auto" }} />
          </motion.div>
        </motion.div>
      )}

      {/* Footer للأنشطة */}
      <ActivityFooter
        currentLetter={currentLetter.arabic}
        letterName={currentLetter.name}
      />
    </div>
  );
}
