import { motion } from "motion/react";
import { AppHeader } from "./AppHeader";
import { use, useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { fetchLetters } from "../redux/reducers/lettersSlice";
import api from "../API/axios";
import drops from "../assets/drops_login (1).svg";
import lock from "../assets/lockIcon.svg";
import checkIcon from "../assets/check_icon.svg";
import vectorEnd from "../assets/vector_end.svg";
import background from "../assets/background-letterdashboard.svg";
import sparckle_01 from "../assets/sparckl_01.svg";
import sparckle_02 from "../assets/sparckl_02.svg";
import { useNavigate } from "react-router-dom";
import pen from "../assets/pen_02.svg";
import tigerImg from "../assets/tiger_dashborad.svg";
import { SplashScreen } from "./SplashScreen";
interface LettersDashboardProps {
  // onLetterClick: (letter: string, letterName: string) => void;
  onLogout: () => void;
  onBack?: () => void;
}

// const arabicLetters = [
//   { letter: 'أ', name: 'ألف', emoji: '🦁' },
//   { letter: 'ب', name: 'باء', emoji: '🦆' },
//   { letter: 'ت', name: 'تاء', emoji: '🍎' },
//   { letter: 'ث', name: 'ثاء', emoji: '🦊' },
//   { letter: 'ج', name: 'جيم', emoji: '🐪' },
//   { letter: 'ح', name: 'حاء', emoji: '🐴' },
//   { letter: 'خ', name: 'خاء', emoji: '🐑' },
//   { letter: 'د', name: 'دال', emoji: '🐻' },
//   { letter: 'ذ', name: 'ذال', emoji: '🐺' },
//   { letter: 'ر', name: 'راء', emoji: '🍊' },
//   { letter: 'ز', name: 'زاي', emoji: '🌸' },
//   { letter: 'س', name: 'سين', emoji: '🐠' },
//   { letter: 'ش', name: 'شين', emoji: '☀️' },
//   { letter: 'ص', name: 'صاد', emoji: '🦅' },
//   { letter: 'ض', name: 'ضاد', emoji: '🐸' },
//   { letter: 'ط', name: 'طاء', emoji: '🐦' },
//   { letter: 'ظ', name: 'ظاء', emoji: '✉️' },
//   { letter: 'ع', name: 'عين', emoji: '🐤' },
//   { letter: 'غ', name: 'غين', emoji: '🦅' },
//   { letter: 'ف', name: 'فاء', emoji: '🐘' },
//   { letter: 'ق', name: 'قاف', emoji: '🐱' },
//   { letter: 'ك', name: 'كاف', emoji: '🐕' },
//   { letter: 'ل', name: 'لام', emoji: '🍋' },
//   { letter: 'م', name: 'ميم', emoji: '🍌' },
//   { letter: 'ن', name: 'نون', emoji: '🐯' },
//   { letter: 'ه', name: 'هاء', emoji: '🦜' },
//   { letter: 'و', name: 'واو', emoji: '🌹' },
//   { letter: 'ي', name: 'ياء', emoji: '✋' },
// ];

export function LettersDashboard({ onLogout, onBack }: LettersDashboardProps) {
  const user = useAppSelector((state) => state.auth.user);
  const [lettersStatus, setLettersStatus] = useState<any[]>([]);
  const [showSplash, setShowSplash] = useState(true);
  const [showLockedMessage, setShowLockedMessage] = useState(false);
  const dispatch = useAppDispatch();
  const { letters, loading } = useAppSelector((state) => state.letters);
  const navigate = useNavigate();

  useEffect(() => {
    if (!letters.length) {
      dispatch(fetchLetters());
    }
  }, [dispatch, letters.length]);

  useEffect(() => {
    const fetchLettersStatus = async () => {
      try {
        const res = await api.get("/progress/user-status");
        console.log(res.data);

        setLettersStatus(res.data.letters);
      } catch (err) {
        console.error("Failed to fetch letters status", err);
      }
    };

    fetchLettersStatus();
  }, []);

  if (loading) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden" dir="rtl">
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

      {/* الهيدر - خارج أي container */}
      <div className="relative top-0 w-full">
        <div style={{ backgroundColor: "white", marginTop: "-20px" }}>
          <AppHeader
            showUserInfo={true}
            onLogout={onLogout}
            showBackButton={false}
            onBack={onBack}
            showLogout={false}
            title={" الحروف العربية"}
            showHome={true}
          />
        </div>
        <img className="w-full" src={drops} />
      </div>
      <motion.div
        className="fixed"
        style={{
          top: "75%",
          right: "0%",
          color: "#FDC333",
          fontSize: "60px",
        }}
        // animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
        // transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* ★ */}
        <img src={pen} style={{ height: "180px", width: "auto" }} />
      </motion.div>
      {/* المحتوى الرئيسي */}
      <div className="relative -top-12 md:-top-26 lg:-top-26 z-10">
        {/* العنوان الرئيسي */}
        <motion.div
          className="text-center md:py-6 px-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={sparckle_01}
            style={{ height: "30px", marginBottom: "20px" }}
          />
          <p
            className="text-base md:text-xl lg:text-2xl"
            style={{
              fontFamily: "tajawal",
              // fontSize: "25px",
              fontWeight: "700",
              color: "#B47DDB",
            }}
          >
            اختر حرفاً لتبدأ رحلة التعلم الممتعة
          </p>
          <img
            src={sparckle_02}
            style={{ height: "30px", marginBottom: "20px" }}
          />
        </motion.div>

        {/* شبكة الحروف */}
        <div className="px-4 md:px-6 pb-8 md:pb-10">
          <div className="mx-auto" style={{ maxWidth: "715px" }}>
            <div className="grid grid-cols-7 gap-2 md:gap-3">
              {letters.map((item, index) => {
                const isTeacher = user?.type === "teacher";
                const letterStatus = lettersStatus.find(
                  (l) => l.id === item.id,
                )?.status;

                const isLocked = letterStatus === "locked";
                const isCompleted = letterStatus === "completed";
                return (
                  <motion.div
                    key={item.symbol}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: index * 0.015,
                      type: "spring",
                      stiffness: 200,
                    }}
                    whileHover={{ scale: 1.08, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <button
                      onClick={() => {
                        // if (isTeacher) return; // المعلم: عرض فقط
                        if (isLocked && !isTeacher) {
                          setShowLockedMessage(true);
                          return;
                        }

                        navigate(`/letter/${item.symbol}`, {
                          state: { name: item.name },
                        });
                      }}
                      // disabled={isDisabled}
                      className={`w-full aspect-square relative group ${
                        isLocked || isTeacher
                          ? "cursor-default"
                          : "cursor-pointer"
                      }`}
                    >
                      <div className="absolute inset-0 bg-white rounded-lg md:rounded-xl shadow-sm group-hover:shadow-lg transition-all border border-gray-100">
                        {/* خلفية ملونة */}
                        <div
                          className="absolute inset-0 rounded-lg md:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{
                            background:
                              "linear-gradient(135deg, #fad656, #f5c842)",
                          }}
                        />

                        {/* المحتوى */}
                        <div className="relative h-full flex flex-col items-center justify-center">
                          {/* الحرف */}
                          <div
                            className="text-2xl md:text-4xl transition-colors leading-none"
                            style={{
                              color: "#652b82",
                            }}
                          >
                            {item.symbol}
                          </div>

                          {/* الاسم */}
                          <div
                            className="text-[12px] md:text-[15px] group-hover:text-white transition-colors mt-2"
                            style={{
                              color: "#652b82",
                              fontFamily: "amiriQuran",
                            }}
                          >
                            {item.name}
                          </div>
                          {!isTeacher && (isCompleted || isLocked) && (
                            <div className="absolute top-0 left-0 z-20 flex items-center justify-center w-4 h-4 md:w-5 md:h-5 rounded-full bg-white/90 shadow text-[10px] md:text-xl leading-none">
                              {isCompleted ? (
                                <img
                                  src={checkIcon}
                                  className="w-5 h-5 md:w-8 md:h-8"
                                />
                              ) : (
                                <img
                                  src={lock}
                                  className="w-5 h-5 md:w-8 md:h-8"
                                />
                              )}
                            </div>
                          )}
                        </div>
                        {/* نجمة صغيرة في الزاوية */}
                        <motion.div
                          className="absolute top-0.5 right-0.5 text-[10px] opacity-0 group-hover:opacity-100"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          ✨
                        </motion.div>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {showLockedMessage && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
                <img src={lock} />
              </div>
            </div>

            {/* العنوان */}
            <motion.h2
              className="text-base md:text-xl lg:text-2xl"
              style={{
                color: "#28345F",
                fontFamily: "tajawal",
                // fontSize: "30px",
                fontWeight: "500",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              لحظة يا بطل! 🌟
            </motion.h2>
            {/* النص */}
            {/* الرسالة */}
            <motion.div
              className="text-sm md:text-base text-gray-600 mb-6 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                color: "#28345F",
                fontFamily: "tajawal",
                fontSize: "18px",
                fontWeight: "500",
              }}
            >
              لا يمكنك فتح هذا الحرف الآن 😊
              <br />
              أكمل الحرف الحالي وتعلّم كتابته
              <br />
              ثم ستُفتح لك باقي الحروف 🎉
            </motion.div>
            {/* زر */}
            <div
              className="flex gap-4 justify-center"
              style={{ marginTop: "20px" }}
            >
              <motion.button
                onClick={() => setShowLockedMessage(false)}
                style={{ backgroundColor: "#652B82" }}
                className="px-6 py-2.5 rounded-xl text-white font-medium shadow-md hover:scale-105 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                حسناً 👍
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
      <motion.div className="fixed z-0" style={{ top: "46%", left: "1%" }}>
        <motion.img
          src={tigerImg}
          alt="نمر"
          style={{ transform: "scaleX(-1)" }}
          className="w-48 h-48 md:w-72 md:h-48 lg:w-72 lg:h-96 object-contain drop-shadow-2xl"
        />
      </motion.div>
    </div>
  );
}
