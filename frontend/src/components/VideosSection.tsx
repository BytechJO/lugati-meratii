import { Play, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ActivityFooter } from "./ActivityFooter";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVideoLesson,
  clearVideo,
} from "../redux/reducers/videoLessonsSlice";
import type { RootState, AppDispatch } from "../redux/store";
import { fetchLetters } from "../redux/reducers/lettersSlice";
import { upsertUserProgress } from "../API/userProgress";
import videoVector from "../assets/vector_video.svg";
import { SplashScreen } from "./SplashScreen";
import background from "../assets/background-learnLetter.svg";
import tigerImg from "../assets/tiger_dashborad.svg";
import { letterCards } from "../data/letterCards";

import { AppHeader } from "./AppHeader";
// ---------- Helpers ----------
interface VideosSectionProps {
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

// لينك الفيديو: إذا الباك اند بعت حقل جديد (مثلاً video_url) بياخده،
// وإلا بيرجع لـ youtube_url القديم
const getVideoSrc = (v: any): string => v?.video_url || v?.youtube_url || "";

// هل اللينك يوتيوب؟ (عشان لو كان في فيديوهات قديمة على يوتيوب تضل تشتغل)
const isYouTube = (url: string) => /youtube\.com|youtu\.be/.test(url);

const getYouTubeEmbedUrl = (url: string): string => {
  let id = "";
  if (url.includes("/embed/")) {
    id = url.split("/embed/")[1];
  } else if (url.includes("youtu.be/")) {
    id = url.split("youtu.be/")[1];
  } else if (url.includes("v=")) {
    id = url.split("v=")[1];
  }
  id = id.split(/[?&#]/)[0];
  return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
};

// ---------- Video Modal ----------

interface VideoModalProps {
  src: string;
  title?: string;
  onClose: () => void;
}

function VideoModal({ src, title, onClose }: VideoModalProps) {
  // إغلاق بزر Escape + منع سكرول الصفحة خلف البوب اب
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose} // الضغط على الخلفية يسكّر
      role="dialog"
      aria-modal="true"
      aria-label={title || "فيديو"}
      dir="rtl"
    >
      <motion.div
        className="relative w-full max-w-4xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()} // الضغط داخل البوب اب ما يسكّر
      >
        {/* زر الإغلاق */}
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute -top-12 left-0 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-110"
          style={{ color: "#28345F" }}
        >
          <X size={22} />
        </button>

        {title && (
          <h3
            className="mb-3 text-base md:text-xl"
            style={{
              color: "#F9F9F9",
              fontFamily: "tajawal",
              fontWeight: 700,
            }}
          >
            {title}
          </h3>
        )}

        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
          {isYouTube(src) ? (
            <iframe
              key={src}
              src={getYouTubeEmbedUrl(src)}
              title={title || "video"}
              className="h-full w-full"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <video
              key={src}
              src={src}
              className="h-full w-full"
              controls
              autoPlay
              playsInline
              controlsList="nodownload"
            >
              متصفحك لا يدعم تشغيل الفيديو
            </video>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

// ---------- Main Component ----------

export function VideosSection({ onLogout }: VideosSectionProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [videosPerPage, setVideosPerPage] = useState(3);
  const [activeVideo, setActiveVideo] = useState<{
    src: string;
    title?: string;
  } | null>(null);
  // ✅ id الحرف اللي خلص طلب فيديوهاته (نجح أو فشل): بيفرّق بين "لسا ما انطلب" و"انطلب وفاضي"
  const [fetchedLetterId, setFetchedLetterId] = useState<any>(null);
  const navigate = useNavigate();
  const { letter } = useParams();
  const progressSavedRef = useRef(false);
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const { letters } = useSelector((state: RootState) => state.letters);
  const currentLetterFromRedux = letters.find((l) => l.symbol === letter);
  const letterId = currentLetterFromRedux?.id;
  const { video, loading } = useSelector(
    (state: RootState) => state.videoLessons,
  );
  const propLetter = letter;
  const currentLetterCard =
    letterCards.find((l) => l.letter === letter) || letterCards[0];

  // ✅ وضع الأستاذ: بدون حفظ تقدم، وبدون زر "التالي" بشاشة "ما في فيديوهات"
  // عدّل الشرط حسب اسم الحقل/القيمة الفعلية عندك في الـ user
  const isTeacher = user?.roleId === 3;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVideosPerPage(1); // موبايل
      } else if (window.innerWidth < 1024) {
        setVideosPerPage(2); // تابلت
      } else {
        setVideosPerPage(3); // ديسكتوب
      }
    };

    handleResize(); // تشغيل أول مرة
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!letters.length) {
      dispatch(fetchLetters());
    }
  }, [dispatch, letters.length]);

  useEffect(() => {
    if (!letterId) return;

    let cancelled = false;

    setFetchedLetterId(null);
    progressSavedRef.current = false;
    setCurrentPage(0);
    dispatch(clearVideo());

    // ✅ نعتبر الطلب خلص سواء نجح أو فشل (مثلاً 404 لما ما في فيديوهات)
    Promise.resolve(
      dispatch(
        fetchVideoLesson({
          letterId,
          lessonId: 4,
        }),
      ),
    ).finally(() => {
      if (!cancelled) setFetchedLetterId(letterId);
    });

    return () => {
      cancelled = true;
    };
  }, [letterId, dispatch]);

  useEffect(() => {
    const saveProgress = async () => {
      if (isTeacher) return; // الأستاذ ما بيتسجل له تقدم
      if (!video || video.length === 0) return;
      if (!letterId) return;
      if (progressSavedRef.current) return;

      await upsertUserProgress({
        letter_id: letterId,
        lesson_id: 4,
        lesson_type: "video",
        score: 1,
        completed: true,
      });

      progressSavedRef.current = true;
    };

    saveProgress();
  }, [video, letterId, isTeacher]);

  const closeModal = () => setActiveVideo(null);

  // ✅ الحرف مو موجود أصلاً بعد ما انحملت الحروف
  const letterNotFound = letters.length > 0 && !letterId;

  // ✅ خلص تحميل الفيديوهات لهاد الحرف
  const videosReady = !!letterId && fetchedLetterId === letterId && !loading;

  // ✅ خلص التحميل وما في فيديوهات (أو الحرف نفسه مو موجود)
  const hasNoVideos =
    letterNotFound ||
    (videosReady && (!Array.isArray(video) || video.length === 0));

  // ✅ لسا عم يحمّل (الحروف أو الفيديوهات)
  if (!hasNoVideos && !videosReady) {
    return <SplashScreen onComplete={() => {}} />;
  }

  if (hasNoVideos) {
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
            title={`  فيديوهات حرف ال${currentLetterFromRedux?.name ?? ""}`}
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
              لا توجد فيديوهات لهذا الحرف حالياً
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
                ? "لم يتم إضافة فيديوهات لهذا الحرف بعد."
                : "ما في فيديوهات لهاد الحرف حالياً، فيك ترجع لصفحة الحرف."}
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

              {/* الطالب بس: ما بيضل عالق */}
              {!isTeacher && (
                <button
                  onClick={() => navigate(`/letter/${letter}`)} // ← غيّره للنشاط/الصفحة التالية الفعلية
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

  const currentLetter = letter;
  const letterName = currentLetterFromRedux?.name;
  const totalPages = Math.ceil(video.length / videosPerPage);
  const currentVideos = video.slice(
    currentPage * videosPerPage,
    (currentPage + 1) * videosPerPage,
  );

  return (
    <div className="relative overflow-hidden pb-24" dir="rtl">
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
          title={`  فيديوهات حرف ال${currentLetterFromRedux?.name}`}
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

      <div className="relative z-10 flex flex-col gap-10">
        {/* المحتوى الرئيسي */}
        <div className="flex items-center justify-center ">
          <div className="flex flex-col gap-6" style={{ width: "80%" }}>
            <div>
              <motion.div
                className="text-center mb-6 flex items-start"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p
                  className="text-base md:text-xl lg:text-2xl "
                  style={{
                    color: "#B47DDB",
                    fontFamily: "tajawal",
                    fontWeight: "500",
                  }}
                >
                  شاهد وتعلم حرف ال{letterName} بطريقة ممتعة
                </p>
              </motion.div>
              {/* السلايدر للفيديوهات */}
              <div className="relative px-0 md:px-12">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className={`grid gap-4 ${
                    videosPerPage === 1
                      ? "grid-cols-1"
                      : videosPerPage === 2
                        ? "grid-cols-1 sm:grid-cols-2"
                        : "grid-cols-1 md:grid-cols-3"
                  }`}
                >
                  {currentVideos.map((item, index) => {
                    const src = getVideoSrc(item);

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="h-full"
                      >
                        {/* بدل <a> صار button يفتح البوب اب */}
                        <button
                          type="button"
                          onClick={() =>
                            setActiveVideo({ src, title: item.video_title })
                          }
                          className="block h-full w-full cursor-pointer text-start"
                        >
                          <div className="relative bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl h-full transition-all">
                            {/* الزاوية الصفراء */}
                            <img
                              src={videoVector}
                              className="absolute top-0 left-0"
                              alt=""
                            />
                            {/* القسم العلوي: زر التشغيل */}
                            <div className="flex items-center justify-center h-56">
                              <div
                                className="flex h-20 w-20 items-center justify-center rounded-full shadow-lg"
                                style={{
                                  background:
                                    "linear-gradient(90deg, #FFE29A 0%, #F7A824 100%)",
                                }}
                              >
                                <Play
                                  size={36}
                                  color="#AD7DC9"
                                  fill="#AD7DC9"
                                  style={{ marginInlineStart: "4px" }}
                                />
                              </div>
                            </div>

                            {/* الخط الفاصل */}
                            <div
                              className="border-t border-gray-300"
                              style={{ color: "#0000001C" }}
                            ></div>

                            {/* القسم السفلي */}
                            <div className="p-4 text-start flex items-start flex-col">
                              <h3
                                style={{
                                  color: "#28345F",
                                  fontFamily: "tajawal",
                                  fontSize: "20px",
                                  fontWeight: "500",
                                }}
                              >
                                {item.video_title}
                              </h3>

                              <p
                                style={{
                                  color: "#28345F9E",
                                  fontFamily: "tajawal",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                }}
                              >
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* مؤشرات الصفحات */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-8">
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index)}
                        aria-label={`الصفحة ${index + 1}`}
                        className={`rounded-full transition-all duration-300 ${
                          currentPage === index
                            ? "w-4 h-4"
                            : "w-3 h-3 opacity-60"
                        }`}
                        style={{ backgroundColor: "#FAD656" }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* البوب اب */}
      <AnimatePresence>
        {activeVideo && (
          <VideoModal
            src={activeVideo.src}
            title={activeVideo.title}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>

      {/* Footer للأنشطة */}
      <ActivityFooter currentLetter={currentLetter} letterName={letterName} />
    </div>
  );
}