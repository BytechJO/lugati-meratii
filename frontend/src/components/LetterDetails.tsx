import { motion } from "motion/react";
import { useParams, useNavigate } from "react-router-dom";
import alphabet_card from "../assets/container_alphabet.svg";
import learn from "../assets/learn_alphabet 2.svg";
import write from "../assets/write_alphabet 2.svg";
import location from "../assets/location_alphabet 2.svg";
import tashkeel from "../assets/tashkeel_alphabet 2.svg";
import videos from "../assets/videos_alphabet 2.svg";
import games from "../assets/games_alphabet 2.svg";
import background from "../assets/background-letterdashboard.svg";
import { AppHeader } from "./AppHeader";
import tigerImg from "../assets/tiger_dashborad.svg";
import book from "../assets/book.svg";
import { fetchLetters } from "../redux/reducers/lettersSlice";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { useEffect } from "react";
import { letterCards } from "../data/letterCards";
import star from "../assets/star_02.svg";
const sections = [
  {
    id: "learn",
    title: "تعلم الحرف",
    description: "تعرف على الحرف",
    bgColor: "#652b82",
    icon: learn,
  },
  {
    id: "write",
    title: "اكتب الحرف",
    description: "تعرف على الحرف",
    bgColor: "#fad656",
    icon: write,
  },
  {
    id: "position",
    title: "مكان الحرف",
    description: "حدد موقع الحرف",
    bgColor: "#fad656",
    icon: location,
  },
  {
    id: "tashkeel",
    title: "تشكيل الحرف",
    description: "تعلم الحركات",
    bgColor: "#652b82",
    icon: tashkeel,
  },
  {
    id: "videos",
    title: "فيديوهات",
    description: "شاهد وتعلم",
    bgColor: "#fad656",
    icon: videos,
  },
  {
    id: "games",
    title: "ألعاب",
    description: "العب وتعلم",
    bgColor: "#652b82",
    icon: games,
  },
];
interface LetterDetailsProps {
  // onLetterClick: (letter: string, letterName: string) => void;
  onLogout: () => void;
}
export function LetterDetails({ onLogout }: LetterDetailsProps) {
  const { letter } = useParams<{ letter: string }>();
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const { letters, loading } = useAppSelector((state) => state.letters);
  useEffect(() => {
    if (!letters.length) {
      dispatch(fetchLetters());
    }
  }, [dispatch, letters.length]);
  const currentLetterFromRedux = letters.find((l) => l.symbol === letter);
  const currentLetterCard =
    letterCards.find((l) => l.letter === letter) || letterCards[0];
  console.log(letters);

  return (
    <div className="h-screen relative overflow-hidden" dir="rtl">
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
          showUserInfo={true}
          onLogout={onLogout}
          onBack={() => navigate("/letters")}
          title=""
          showLogout={false}
          showBackButton={true}
          showHome={false}
          fontTtile={45}
        />
      </div>
      {/* نجمة صغيرة يسار الوسط */}
      <motion.div
        className="absolute"
        style={{
          top: "35%",
          left: "86%",
          color: "#FDC333",
          fontSize: "60px",
        }}
        animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* ★ */}
        <img src={star} style={{ height: "40px", width: "auto" }} />
      </motion.div>
      <motion.div
        className="absolute"
        style={{
          top: "28%",
          left: "16%",
          color: "#FDC333",
          fontSize: "60px",
        }}
        animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* ★ */}
        <img src={star} style={{ height: "40px", width: "auto" }} />
      </motion.div>
      {/* المحتوى الرئيسي */}
      <div className="relative z-10 flex flex-col">
        {/* العنوان والحرف */}
        <motion.div
          className="text-center mb-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* الحرف */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* دائرة الحرف */}
            <motion.div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              className="relative inline-block"
            >
              <motion.div
                className="relative inline-block"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img src={alphabet_card} />
                <div className="absolute">
                  <img
                    src={currentLetterCard.image}
                    style={{ height: "80px" }}
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* اسم الحرف */}
          </motion.div>
        </motion.div>

        {/* شبكة الأقسام */}
        <div>
          <div className="w-full mx-auto" style={{ maxWidth: "660px" }}>
            {/* البطاقات */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {sections.map((section, index) => (
                <div key={section.id} className="flex justify-center">
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                    whileHover={{ y: -4, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full max-w-[220px]"
                  >
                    <button
                      onClick={() =>
                        navigate(`/letter/${letter}/${section.id}`)
                      }
                      className="group"
                      style={{ width: "95%" }}
                    >
                      <img src={section.icon} />
                    </button>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* النمر في الزاوية اليسرى العليا */}
      <motion.div className="fixed z-0" style={{ top: "39%", left: "1%" }}>
        <motion.img
          src={tigerImg}
          alt="نمر"
          style={{ transform: "scaleX(-1)" }}
          className="object-contain drop-shadow-2xl"
        />
      </motion.div>

      <motion.div
        className="fixed"
        style={{
          top: "75%",
          right: "0%",
          color: "#FDC333",
          fontSize: "60px",
          rotate: "-6deg",
        }}
        // animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
        // transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* ★ */}
        <img src={book} style={{ height: "180px", width: "auto" }} />
      </motion.div>
    </div>
  );
}
