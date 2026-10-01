import { motion } from "motion/react";
import { useEffect } from "react";
import tigerImg from "../assets/tiger.svg";
import alphabet from "../assets/Group 46.svg";
// ⚠️ بدّلي هاد المسار باسم ملف صورة الباك قراوند الفعلي عندك بمجلد assets
import splashBackground from "../assets/splash_background.svg";
import star from "../assets/star_02.svg";
import "./SplashScreen.css";
import book from "../assets/book.svg";
import pen from "../assets/pen.svg";
interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="min-h-screen relative flex flex-col item-center justify-center overflow-hidden"
      dir="rtl"
    >
      {/* ✅ خلفية الصفحة كصورة (بدل البلوبز اللونية) */}
      <div
        className="fixed inset-0"
        style={{
          backgroundImage: `url(${splashBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      {/* عناصر زخرفية صغيرة (نقاط ملونة متل الصورة) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* نقطة وردي/سلموني أعلى الشمال */}
        <motion.div
          className="absolute rounded-full"
          style={{
            top: "21%",
            left: "7%",
            width: "22px",
            height: "22px",
            backgroundColor: "#F5A9A0",
          }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
         <motion.div
          className="absolute rounded-full"
          style={{
            top: "79%",
            left: "11%",
            width: "22px",
            height: "22px",
            backgroundColor: "#F5A9A0",
          }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            top: "61%",
            left: "44%",
            width: "22px",
            height: "22px",
            backgroundColor: "#F5A9A0",
          }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* نقطة بنفسجية وسط الصفحة */}
        <motion.div
          className="absolute rounded-full"
          style={{
            top: "51%",
            left: "8%",
            width: "20px",
            height: "20px",
            backgroundColor: "#8B5FA8",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* نجمة صغيرة يسار الوسط */}
        <motion.div
          className="absolute"
          style={{
            top: "50%",
            left: "3%",
            color: "#FDC333",
            fontSize: "60px",
          }}
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* ★ */}
          <img src={star} />
        </motion.div>

        {/* نقطة بنفسجية وسط الصفحة */}
        <motion.div
          className="absolute rounded-full"
          style={{
            top: "4%",
            left: "38%",
            width: "20px",
            height: "20px",
            backgroundColor: "#8B5FA8",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* نجمة صغيرة يسار الوسط */}
        <motion.div
          className="absolute"
          style={{
            top: "3%",
            left: "32%",
            color: "#FDC333",
            fontSize: "60px",
          }}
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* ★ */}
          <img src={star} />
        </motion.div>

        {/* الخلفية الدائرية الدوارة الأصلية (خفيفة، تضيف عمق فوق البلوبز) */}
        <motion.div
          className="absolute -top-20 -right-20 w-56 h-56 md:w-64 md:h-64 rounded-full opacity-10"
          style={{ backgroundColor: "#ffffff" }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
      </div>
      <motion.div
        className="absolute"
        style={{
          top: "2%",
          right: "2%",
          color: "#FDC333",
          fontSize: "60px",
        }}
        animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* ★ */}
        <img src={book} style={{ height: "130px", width: "auto" }} />
      </motion.div>
      <motion.div
        className="absolute"
        style={{
          top: "2%",
          left: "2%",
          color: "#FDC333",
          fontSize: "60px",
        }}
        animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* ★ */}
        <img src={pen} style={{ height: "130px", width: "auto" }} />
      </motion.div>
      {/* المحتوى */}
      <div
        className="content-container-loading-page relative z-10 text-center px-4 flex flex-row items-center justify-center gap-4"
        style={{ marginTop: "90px" }}
      >
        <div
          className="right-side-container-loading-page"
          style={{
            width: "70%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* العنوان */}
          <motion.div
            className="flex flex-col items-center justify-center gap-4"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            style={{ marginRight: "100px" }}
          >
            <div className="flex justify-center items-center gap-3">
              <div
                style={{
                  height: "25px",
                  width: "25px",
                  borderRadius: "50%",
                  backgroundColor: "#FECB27",
                }}
              ></div>{" "}
              <h1
                className="title-container-loading-page text-4xl md:text-5xl mb-3"
                style={{
                  color: "#4A1B73",
                  fontFamily: "tajawal",
                  fontWeight: "700",
                  fontSize: "90px",
                }}
              >
                مرآتي لغتي
              </h1>
              <div
                style={{
                  height: "25px",
                  width: "25px",
                  borderRadius: "50%",
                  backgroundColor: "#FECB27",
                }}
              ></div>{" "}
            </div>
            <motion.p
              className="subtitle1-container-loading-page text-lg md:text-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              style={{
                color: "#9F70D2",
                fontFamily: "tajawal",
                fontWeight: "500",
                fontSize: "40px",
              }}
            >
              رحلة تعلم اللغة العربية
            </motion.p>
            <motion.p
              className="subtitle1-container-loading-page text-lg md:text-xl"
              style={{
                color: "#653A92",
                fontFamily: "tajawal",
                fontWeight: "500",
                fontSize: "30px",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              إستعد لمغامرة تعليمية رائعة
            </motion.p>
          </motion.div>

          {/* رسالة ترحيبية */}
          {/* <motion.div
            className="mt-6 md:mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <div className="inline-block rounded-xl" >
              <img src={alphabet} style={{height:"250px",width:"auto"}}/>
            </div>
          </motion.div> */}
        </div>
        <div>
          {/* النمر المتحرك */}
          {/* <motion.div
            initial={{ scale: 0, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 12,
              duration: 1,
            }}
            className="mb-6 md:mb-8 flex items-left justify-center"
          > */}
          <motion.img
            src={tigerImg}
            alt="نمر"
            style={{ height: "70%", width: "75%" }}
            // animate={{
            //   y: [0, -12, 0],
            //   rotate: [0, 3, -3, 0],
            // }}
            // transition={{
            //   duration: 3,
            //   repeat: Infinity,
            //   ease: "easeInOut",
            // }}
          />
          {/* </motion.div> */}
        </div>
      </div>
      {/* مؤشر التحميل */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center justify-center gap-1.5">
          <motion.div
            className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full"
            style={{ backgroundColor: "#ffcf20ff" }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0,
            }}
          />
          <motion.div
            className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full"
            style={{ backgroundColor: "#fad656" }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0.2,
            }}
          />
          <motion.div
            className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full"
            style={{ backgroundColor: "#fad656" }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0.4,
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
