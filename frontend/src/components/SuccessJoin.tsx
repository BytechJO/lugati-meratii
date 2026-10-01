import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllClasses, fetchMyClass } from "../redux/reducers/classSlice";
import { RootState, AppDispatch } from "../redux/store";
import homeIcon from "../assets/Home.svg";
import { logout } from "../redux/reducers/auth";
import girl_img from "../assets/success_joinClass.svg";
import tigerImg from "figma:asset/d844153878e904df36a1b42e94cd19505b2fa01b.png";
import { clearMyClass } from "../redux/reducers/classSlice";
import successJoinBg from "../assets/successJoinBg.svg";
import { AppHeader } from "./AppHeader";
import { useAppSelector } from "../redux/hooks";
import { LogIn } from "lucide-react";
import star from "../assets/star_02.svg";
import book from "../assets/book.svg";
import pen from "../assets/pen_02.svg";
import letterAin from "../assets/alainLetter.svg";
import lamb from "../assets/lamb.svg";
interface SuccessJoinProps {
  // onLetterClick: (letter: string, letterName: string) => void;
  onLogout: () => void;
  onBack?: () => void;
}

export function SuccessJoin({ onLogout, onBack }: SuccessJoinProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { myClass, loading } = useAppSelector((state) => state.class);
  //   console.log(myClass);

  useEffect(() => {
    console.log("JOIN CLASS COMPONENT MOUNTED");

    dispatch(fetchMyClass());
    dispatch(fetchAllClasses());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearMyClass());
    navigate("/");
  };

  return (
    <>
      <div className="h-screen relative overflow-hidden" dir="rtl">
        {/* خلفية متدرجة */}
        <div
          className="fixed inset-0"
          style={{
            backgroundImage: `url("${successJoinBg}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
        {/* الهيدر - خارج أي container */}
        <AppHeader
          showUserInfo={true}
          onLogout={onLogout}
          showBackButton={false}
          onBack={onBack}
          title=""
          showLogout={false}
          showHome={false}
        />
        {/* عناصر زخرفية متحركة */}
        {/* عناصر زخرفية صغيرة (نقاط ملونة متل الصورة) */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
        

          {/* نقطة بنفسجية وسط الصفحة */}
          <motion.div
            className="absolute rounded-full"
            style={{
              top: "75%",
              left: "66%",
              width: "20px",
              height: "20px",
              backgroundColor: "#B887E9",
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* نجمة صغيرة يسار الوسط */}
          <motion.div
            className="absolute"
            style={{
              top: "60%",
              left: "66%",
              color: "#FDC333",
              fontSize: "60px",
            }}
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* ★ */}
            <img src={star} style={{ height: "40px", width: "auto" }} />
          </motion.div>

          {/* نقطة بنفسجية وسط الصفحة */}
          <motion.div
            className="absolute rounded-full"
            style={{
              top: "55%",
              left: "25%",
              width: "20px",
              height: "20px",
              backgroundColor: "#B887E9",
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* نجمة صغيرة يسار الوسط */}
          <motion.div
            className="absolute"
            style={{
              top: "44%",
              left: "37%",
              color: "#FDC333",
              fontSize: "60px",
            }}
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* ★ */}
            <img src={star} style={{ height: "40px", width: "auto" }}/>
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
            top: "38%",
            right: "65%",
            color: "#FDC333",
            fontSize: "60px",
            backgroundColor: "#ECC9FA",
            borderRadius: "50%",
            padding: "10px",
          }}
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* ★ */}
          <img src={book} style={{ height: "70px", width: "auto" }} />
        </motion.div>
        <motion.div
          className="absolute"
          style={{
            top: "80%",
            right: "0%",
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
            top: "66%",
            left: "71%",
            color: "#FDC333",
            fontSize: "60px",
            backgroundColor: "#EFDDFF",
            borderRadius: "50%",
            padding: "10px",
          }}
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* ★ */}
          <img src={pen} style={{ height: "60px", width: "auto" }} />
        </motion.div>

        <motion.div
          className="absolute"
          style={{
            top: "65%",
            left: "28%",
            color: "#FDC333",
            fontSize: "60px",
            rotate: "60deg",
            backgroundColor: "#EFDDFF",
            borderRadius: "50%",
            padding: "10px",
          }}
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* ★ */}
          <img src={lamb} style={{ height: "60px", width: "auto" }} />
        </motion.div>

        <motion.div
          className="absolute"
          style={{
            top: "45%",
            left: "67%",
            color: "#FDC333",
            fontSize: "60px",

            backgroundColor: "#EFDDFF",
            borderRadius: "50%",
            padding: "10px",
          }}
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* ★ */}
          <img src={letterAin} style={{ height: "60px", width: "auto" }} />
        </motion.div>
        <div
          className="flex justify-center gap-6"
         
        >
          {/* المحتوى الرئيسي */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-4 text-base md:text-xl lg:text-2xl">
            <h1
              className="font-cairo"
              style={{
                fontFamily: "Cairo",
                fontSize: "35px",
                fontWeight: "500",
                color: "#570A92",
              }}
            >
              استعد لمغامرة تعليمية رائعة{" "}
            </h1>
            <h1
              className="font-cairo"
              style={{
                fontFamily: "poppins",
                fontSize: "20px",
                fontWeight: "500",
                color: "#A664D3",
              }}
            >
              انت مسجل في صف{" "}
            </h1>
            <h1
              className="text-base md:text-xl lg:text-2xl"
              style={{
                fontFamily: "poppins",
                fontSize: "25px",
                fontWeight: "700",
                color: "#570A92",
              }}
            >
              {myClass?.name}
            </h1>
            <img src={girl_img} style={{ height: "350px" }} />
            <motion.button
              onClick={() => navigate("/letters")}
              className="w-80 max-w-full py-3 flex items-center justify-center rounded-full"
              style={{
                background: "linear-gradient(180deg, #FFDD55 0%, #FDC333 100%)",
                color: "#570A92",
                fontFamily: "Cairo",
                fontSize: "22px",
                fontWeight: "700",
                boxShadow: "0 10px 25px rgba(101, 43, 130, 0.25)",
                border: "none",
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>إنضم إلى الصف</span>
            </motion.button>
          </div>
        </div>
      </div>
      {/* النمر في الزاوية */}
      <motion.div className="fixed bottom-0 left-2 md:-bottom-23 md:left-4 z-0">
        <motion.img
          src={tigerImg}
          alt="نمر"
          className="w-20 h-48 md:w-72 md:h-48 lg:w-72 lg:h-96 object-contain drop-shadow-2xl"
        />
      </motion.div>
    </>
  );
}
