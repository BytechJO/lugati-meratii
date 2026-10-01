import { useState, useEffect, use } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllClasses, fetchMyClass } from "../redux/reducers/classSlice";
import { RootState, AppDispatch } from "../redux/store";
import homeIcon from "../assets/Home.svg";
import { logout } from "../redux/reducers/auth";
import girl_img from "../assets/success_joinClass.svg";
import { clearMyClass } from "../redux/reducers/classSlice";
import { AppHeader } from "./AppHeader";
import { useAppSelector } from "../redux/hooks";
import { LogIn } from "lucide-react";
import tiger from "../assets/welcom-tiger.svg";
import welcome from "../assets/welocme-header.svg";
import backGroundImg from "../assets/img-welcome-header.svg";
import goLetter from "../assets/go-letterIcon.svg";
interface SuccessJoinProps {
  // onLetterClick: (letter: string, letterName: string) => void;
  onLogout: () => void;
  onBack?: () => void;
}

export function LetterWelcomePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { myClass, loading } = useAppSelector((state) => state.class);
  //   console.log(myClass);
  const user = useAppSelector((state) => state.auth.user);
  const userName = user?.username || "المستخدم";
  useEffect(() => {
    console.log("JOIN CLASS COMPONENT MOUNTED");

    dispatch(fetchMyClass());
    dispatch(fetchAllClasses());
  }, [dispatch]);

  return (
    <>
      <div className="min-h-screen relative overflow-hidden flex flex-col" dir="rtl">
        {/* خلفية متدرجة */}
        <div
          className="fixed inset-0"
          style={{
            background: "#FDC333",
          }}
        ></div>
        {/* الهيدر - خارج أي container */}
        <div className="flex-1">
        <div className="relative">
          <img src={welcome} className="w-80" />
          <div
            className="absolute top-8 flex w-full"
            style={{ justifyContent: "space-between", padding: "0px 20px" }}
          >
            <div className="flex flex-col justify-center items-center">
              <div className="flex justify-center items-center gap-4">
                <div
                  style={{
                    height: "20px",
                    width: "20px",
                    backgroundColor: "#FDC333",
                    borderRadius: "50%",
                  }}
                ></div>
                <h1 className="text-base md:text-2xl lg:text-3xl"
                  style={{
                    fontFamily: "tajawal",
                    fontWeight: "700",
                    // fontSize: "35px",
                    color: "#373737",
                  }}
                >
                  مرحبا
                  <span className="text-base md:text-2xl lg:text-3xl"
                    style={{
                      fontFamily: "tajawal",
                      fontWeight: "500",
                      // fontSize: "25px",
                      color: "#373737",
                    }}
                  >
                    {" "}
                    {user?.username}
                  </span>
                </h1>
                <div
                  style={{
                    height: "20px",
                    width: "20px",
                    backgroundColor: "#FDC333",
                    borderRadius: "50%",
                  }}
                ></div>
              </div>
              <h2 className="text-base md:text-lg lg:text-xl"
                style={{
                  fontFamily: "tajawal",
                  fontWeight: "500",
                  // fontSize: "18px",
                  color: "#373737",
                  paddingRight: "20px",
                }}
              >
                إستعد لمغامرة تعليمية رائعة
              </h2>
            </div>

            <div>
              <button onClick={()=>navigate("/letters")} className="w-full text-white rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-105">
                <img src={goLetter} style={{ width: "250px" }} />
              </button>
            </div>
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div
          className="relative z-10 flex flex-col items-center justify-center gap-4"
          style={{
            top: "-109px",
            backgroundColor: "white",
            padding: "10px 0px",
          }}
        >
          <img src={backGroundImg} className="w-full"/>
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 -ml-6 z-20 flex justify-center items-center"
            style={{
              height: "150px",
              width: "150px",
              bottom: "5%",
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.img
              src={tiger}
              alt="نمر"
              className="tiger-choose-page w-48 md:w-48 lg:w-48 object-contain drop-shadow-2xl"
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </div>
</div>
       <div className="relative flex justify-center mt-auto pb-6">
  <h1
    className="text-base md:text-xl lg:text-2xl"
    style={{
      fontFamily: "tajawal",
      fontWeight: "500",
      color: "#6C6C6CBD",
      marginBottom: "20px",
    }}
  >
    انت مسجل في صف {myClass?.name}
  </h1>
</div>
        
      </div>
    </>
  );
}
