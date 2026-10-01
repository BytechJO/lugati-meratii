import { motion } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { ActivityFooter } from "./ActivityFooter";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { fetchVideoLesson } from "../redux/reducers/videoLessonsSlice";
import { upsertUserProgress } from "../API/userProgress";
import { fetchLetters } from "../redux/reducers/lettersSlice";
import background_video from "../assets/Vector_sidebar.png";
import { SplashScreen } from "./SplashScreen";
import abc from "../assets/abc.svg";
import tigerImg from "../assets/tiger_dashborad.svg";
import background from "../assets/background-learnLetter.svg";
import { letterCards } from "../data/letterCards";
import { lettersComp } from "../data/lettersComp";
import book from "../assets/book.svg";
import { AppHeader } from "./AppHeader";

// نسبة التلوين المطلوبة لتفعيل زر المتابعة
const COMPLETION_THRESHOLD = 98;
interface LearnLetters2Props {
  // onLetterClick: (letter: string, letterName: string) => void;
  onLogout: () => void;
}
export function LearnLetters2({ onLogout }: LearnLetters2Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#fad656");
  const [isDrawing, setIsDrawing] = useState(false);
  const [coloringData, setColoringData] = useState<ImageData | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showSplash, setShowSplash] = useState(true);
  const letterMaskRef = useRef<ImageData | null>(null);
  const { letter } = useParams<{ letter: string }>();
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();

  const { video, loading } = useSelector(
    (state: RootState) => state.videoLessons,
  );
  const { letters } = useSelector((state: RootState) => state.letters);
  const currentLetterFromRedux = letters.find((l) => l.symbol === letter);
  const currentLetterCard =
    letterCards.find((l) => l.letter === letter) || letterCards[0];

  const letterId = currentLetterFromRedux?.id;

  useEffect(() => {
    if (!letters.length) {
      dispatch(fetchLetters());
    }
  }, [dispatch, letters.length]);

  const saveLearnProgress = async () => {
    if (!user || !letter) return;

    await upsertUserProgress({
      letter_id: letterId,
      lesson_id: 2, // درس التعلم
      lesson_type: "write",
      score: 1,
      completed: true,
    });
  };

  useEffect(() => {
    if (!letterId) return;
    dispatch(
      fetchVideoLesson({
        letterId,
        lessonId: 2,
      }),
    );
  }, [letterId, dispatch]);

  useEffect(() => {
    setVideoEnded(false);

    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [video]);

  const currentLetter =
    lettersComp.find((l) => l.arabic === letter) || lettersComp[0];

  // تهيئة الكانفاس عند الدخول لسلايد التلوين
  useEffect(() => {
    if (currentSlide !== 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const init = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);

      if (width === 0 || height === 0) return;

      canvas.width = width;
      canvas.height = height;

      // temp canvas للـ mask
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      tempCtx.clearRect(0, 0, width, height);
      const isPhone = width < 768;
      const scale = isPhone ? 0.95 : 0.7;
      tempCtx.font = `bold ${Math.min(width, height) * scale}px Arial`;

      tempCtx.textAlign = "center";
      tempCtx.textBaseline = "alphabetic";
      tempCtx.fillStyle = "#000";

      const text = currentLetter.arabic;
      const metrics = tempCtx.measureText(text);
      const ascent =
        metrics.actualBoundingBoxAscent ?? Math.min(width, height) * 0.35;
      const descent =
        metrics.actualBoundingBoxDescent ?? Math.min(width, height) * 0.15;

      const x = width / 2;
      const y = height / 2 + (ascent - descent) / 2;

      tempCtx.fillText(text, x, y);

      // mask
      letterMaskRef.current = tempCtx.getImageData(0, 0, width, height);

      // coloringData
      const fresh = ctx.createImageData(width, height);
      setColoringData(fresh);

      // تغيّر الحجم بيمسح التلوين، فلازم نرجّع الزر disabled
      setIsComplete(false);

      // ارسم فوراً (بدون انتظار state)
      redrawCanvas(fresh, width, height);
    };

    // استنى layout يثبت
    requestAnimationFrame(() => requestAnimationFrame(init));

    // راقب تغيّر الحجم
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(init);
    });
    ro.observe(canvas);

    return () => ro.disconnect();
  }, [currentSlide, currentLetter.arabic]);

  // إعادة رسم Canvas
  const redrawCanvas = (data?: ImageData, w?: number, h?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = w ?? canvas.width;
    const height = h ?? canvas.height;
    if (width === 0 || height === 0) return;

    ctx.clearRect(0, 0, width, height);

    const toDraw = data ?? coloringData;
    if (toDraw) ctx.putImageData(toDraw, 0, 0);

    const isPhone = width < 768; // نفس breakpoint تبع md في Tailwind
    const scale = isPhone ? 0.95 : 0.7;
    ctx.font = `bold ${Math.min(width, height) * scale}px Arial`;

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.strokeStyle = "#c9b39c";
    ctx.lineWidth = 6;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    const text = currentLetter.arabic;
    const metrics = ctx.measureText(text);
    const ascent =
      metrics.actualBoundingBoxAscent ?? Math.min(width, height) * 0.35;
    const descent =
      metrics.actualBoundingBoxDescent ?? Math.min(width, height) * 0.15;

    const x = width / 2;
    const y = height / 2 + (ascent - descent) / 2;

    ctx.strokeText(text, x, y);
  };

  // الحصول على إحداثيات الماوس/اللمس
  const getCoordinates = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: Math.floor(clientX - rect.left),
      y: Math.floor(clientY - rect.top),
    };
  };

  // بداية الرسم
  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords || !letterMaskRef.current) return;

    // التحقق من أن النقطة داخل الحرف
    const maskData = letterMaskRef.current.data;
    const index = (coords.y * letterMaskRef.current.width + coords.x) * 4;
    const isInsideLetter = maskData[index + 3] > 0;

    if (!isInsideLetter) return;

    setIsDrawing(true);
    drawAtPoint(coords.x, coords.y);
  };

  // الرسم
  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    e.preventDefault();
    if (!isDrawing) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    drawAtPoint(coords.x, coords.y);
  };

  // رسم نقطة بفرشاة دائرية
  const drawAtPoint = (centerX: number, centerY: number) => {
    if (!coloringData || !letterMaskRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    const brushSize = Math.max(28, Math.floor(Math.min(width, height) * 0.12));
    const brushRadius = brushSize / 2;

    // تحويل اللون المحدد إلى RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 0, g: 0, b: 0 };
    };

    const color = hexToRgb(selectedColor);
    const coloringPixels = coloringData.data;
    const maskPixels = letterMaskRef.current.data;

    // رسم دائرة
    for (let dy = -brushRadius; dy <= brushRadius; dy++) {
      for (let dx = -brushRadius; dx <= brushRadius; dx++) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > brushRadius) continue;

        const x = Math.floor(centerX + dx);
        const y = Math.floor(centerY + dy);

        if (x < 0 || x >= width || y < 0 || y >= height) continue;

        const index = (y * width + x) * 4;

        // التحقق من أن النقطة داخل الحرف
        if (maskPixels[index + 3] === 0) continue;

        // وضع اللون مباشرة
        coloringPixels[index] = color.r;
        coloringPixels[index + 1] = color.g;
        coloringPixels[index + 2] = color.b;
        coloringPixels[index + 3] = 255;
      }
    }

    // تحديث العرض
    redrawCanvas();

    // التحقق من نسبة التلوين
    checkColoringCompletion();
  };

  // التحقق من اكتمال التلوين
  const checkColoringCompletion = () => {
    if (!coloringData || !letterMaskRef.current || isComplete) return;

    const coloringPixels = coloringData.data;
    const maskPixels = letterMaskRef.current.data;

    let totalPixels = 0;
    let coloredPixels = 0;

    for (let i = 0; i < maskPixels.length; i += 4) {
      // إذا كانت النقطة داخل الحرف
      if (maskPixels[i + 3] > 0) {
        totalPixels++;
        // إذا كانت ملونة
        if (coloringPixels[i + 3] > 0) {
          coloredPixels++;
        }
      }
    }

    if (totalPixels === 0) return;

    const percentage = (coloredPixels / totalPixels) * 100;

    // لما توصل النسبة للحد المطلوب، بيتفعّل زر المتابعة
    if (percentage >= COMPLETION_THRESHOLD) {
      setIsComplete(true);
    }
  };

  // إنهاء الرسم
  const stopDrawing = () => {
    setIsDrawing(false);
  };

  useEffect(() => {
    redrawCanvas();
  }, [coloringData]);

  // مسح التلوين
  const clearColoring = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setColoringData(ctx.createImageData(canvas.width, canvas.height));
    setIsComplete(false); // بيرجع الزر disabled
  };

  // الانتقال للنشاط التالي (بس لما يكون الزر enabled)
  const handleContinue = () => {
    if (!isComplete) return;
    navigate(`/letter/${letter}/position`);
  };

  if (loading) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="h-screen relative" dir="rtl">
      {/* خلفية متدرجة ملونة */}
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
          title={`مرحباً بك في نشاط الرسم والتلوين`}
          showLogout={false}
          showBackButton={true}
          showHome={false}
          fontTtile={25}
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
        <div className="relative z-10 flex flex-col h-full justify-evenly md:justify-start overflow-hidden">
          {/* المحتوى الرئيسي */}
          <div className="flex-1 flex flex-col px-6 md:justify-start">
            {/* عنوان ترحيبي */}

            {/* بطاقة الفيديو */}
            <motion.div
              className="w-full max-w-[40rem] mx-auto px-0 sm:px-2"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* إطار الفيديو الداخلي */}
              <div className="bg-white overflow-hidden shadow-xl w-full rounded-xl">
                {/* الفيديو */}
                <div
                  className="relative w-full rounded-xl"
                  style={{ paddingBottom: "56.25%" }}
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
                  {loading && (
                    <p className="text-center py-6">جاري تحميل الفيديو...</p>
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

                  {videoEnded && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mt-3 text-base md:text-xl lg:text-2xl"
                      style={{
                        color: "#652B82",
                        fontFamily: "tajawal",
                        fontWeight: "400",
                      }}
                    >
                      انقر للانتقال إلى الأنشطة التفاعلية
                    </motion.p>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* عنوان ترحيبي */}
            {!videoEnded && (
              <motion.div
                className="text-center mb-3"
                initial={{ opacity: 0, y: -20 }}
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
                  شاهد الفيديو ثم ابدأ في رسم وتلوين حرف{" "}
                  {`ال${currentLetter.name} `}
                </p>
              </motion.div>
            )}
          </div>

          {/* النمر في الزاوية */}
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

      {/* السلايد الثاني: التلوين */}
      {currentSlide === 1 && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="relative z-10 h-screen flex flex-col"
        >
          {/* المحتوى */}
          <div className="flex-1 flex flex-col px-6 pb-28">
            <div className="max-w-5xl w-full mx-auto flex flex-col" style={{marginBottom:"50px" }}>
              {/* العنوان */}
              {/* <motion.div
                className="text-center mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1
                  className="text-3xl md:text-4xl mb-2"
                  style={{ color: "#652b82" }}
                >
                  اكتب حرف الألف
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  استخدم الألوان لكتابة الحرف
                </p>
              </motion.div> */}

              {/* بطاقة لوحة الرسم */}
              <motion.div
                className="bg-white rounded-3xl p-4 md:p-6 border-4 shadow-2xl z-10 flex-1 flex flex-col"
                style={{ borderColor: "#fad656" ,marginBottom:"20px" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="grid h-full gap-4 md:gap-6 grid-rows-[1fr_auto] md:grid-rows-1 md:grid-cols-4">
                  {/* لوحة التلوين فوق على الموبايل / يمين على الديسكتوب */}
                  <div className="md:col-span-3 flex flex-col order-1 md:order-2">
                    <div
                      className="flex-1 relative rounded-3xl overflow-hidden border-2 border-gray-200"
                      style={{ backgroundColor: "#f8f9fa" }}
                    >
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full touch-none h-full"
                        style={{ cursor: "crosshair" }}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                      />
                    </div>
                  </div>

                  {/* الباليت تحت على الموبايل / يسار على الديسكتوب */}
                  <div className="flex flex-col items-stretch justify-start gap-4 order-2 md:order-1">
                    <h3 className="text-lg text-gray-600 mb-2">اختر لونك</h3>

                    <div className="grid grid-cols-6 md:grid-cols-2 gap-2 md:gap-3">
                      {[
                        { color: "#fad656", icon: null },
                        { color: "#652b82", icon: "star" },
                        { color: "#3b82f6", icon: null },
                        { color: "#ef4444", icon: null },
                        { color: "#f97316", icon: null },
                        { color: "#22c55e", icon: null },
                      ].map((item) => (
                        <motion.button
                          key={item.color}
                          onClick={() => setSelectedColor(item.color)}
                          className="relative w-full aspect-square rounded-2xl border-4 transition-all flex items-center justify-center"
                          style={{
                            backgroundColor: item.color,
                            borderColor:
                              selectedColor === item.color
                                ? "#ffffff"
                                : item.color,
                            boxShadow:
                              selectedColor === item.color
                                ? "0 0 0 4px #652b82"
                                : "none",
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {item.icon === "star" && (
                            <svg
                              className="w-8 h-8 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          )}
                        </motion.button>
                      ))}
                    </div>

                    <motion.button
                      onClick={clearColoring}
                      className="w-full px-4 py-3 rounded-2xl flex items-center justify-center gap-2 text-white mt-2 md:mt-auto"
                      style={{ backgroundColor: "#ef4444" }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>مسح الكل</span>
                    </motion.button>

                    {/* زر المتابعة: disabled لحد ما يخلص التلوين */}
                    <motion.button
                      onClick={handleContinue}
                      disabled={!isComplete}
                      className="w-full px-4 py-3 rounded-2xl text-white font-medium shadow-md transition-all"
                      style={{
                        background: isComplete
                          ? "linear-gradient(135deg, #652b82, #7d3ba0)"
                          : "linear-gradient(135deg, #d1d5db, #9ca3af)",
                        cursor: isComplete ? "pointer" : "not-allowed",
                        opacity: isComplete ? 1 : 0.6,
                      }}
                      whileHover={isComplete ? { scale: 1.04 } : {}}
                      whileTap={isComplete ? { scale: 0.96 } : {}}
                      animate={
                        isComplete
                          ? {
                              scale: [1, 1.05, 1],
                              boxShadow: [
                                "0 10px 30px rgba(101, 43, 130, 0.3)",
                                "0 14px 40px rgba(101, 43, 130, 0.5)",
                                "0 10px 30px rgba(101, 43, 130, 0.3)",
                              ],
                            }
                          : { scale: 1, boxShadow: "none" }
                      }
                      transition={
                        isComplete
                          ? {
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }
                          : {}
                      }
                    >
                      <span>{isComplete ? "أحسنت! متابعة" : "متابعة"}</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* النمر في الزاوية */}
          {/* النمر في الزاوية */}
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
